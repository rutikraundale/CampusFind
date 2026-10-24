import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, Camera, CheckCircle, ImagePlus, LoaderCircle, RefreshCw } from 'lucide-react';
import { foundItemUploadAPI } from '../services/api';
import './FoundItemUpload.css';

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

export default function MobileFoundItemUploadPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const [checking, setChecking] = useState(true);
  const [sessionStatus, setSessionStatus] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraRequesting, setCameraRequesting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const validateSession = async () => {
      if (!token) {
        setError('This upload link is missing its temporary access token.');
        setChecking(false);
        return;
      }
      try {
        const response = await foundItemUploadAPI.validateMobileToken(token, { signal: controller.signal });
        setSessionStatus(response.data.status);
      } catch (requestError) {
        if (requestError.name !== 'CanceledError') setError(requestError.message || 'This upload link is invalid or expired.');
      } finally {
        if (!controller.signal.aborted) setChecking(false);
      }
    };
    validateSession();
    return () => controller.abort();
  }, [token]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => {
    if (cameraActive && videoRef.current && cameraStreamRef.current) {
      videoRef.current.srcObject = cameraStreamRef.current;
      videoRef.current.play().catch(() => {
        setError('The camera preview could not start. Check camera access for this site and try again.');
      });
    }
  }, [cameraActive]);

  useEffect(() => () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const stopCamera = () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    setCameraActive(false);
  };

  const startCamera = async () => {
    setError('');
    if (!window.isSecureContext) {
      setError('Camera permission requires a secure HTTPS site. This link is not secure; ask the administrator to open CampusFind using HTTPS. You can still choose a photo from your gallery.');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('This browser does not support camera access. Open the link in your phone browser or choose a photo from your gallery.');
      return;
    }

    setCameraRequesting(true);
    try {
      cameraStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' } },
      });
      setCameraActive(true);
    } catch (cameraError) {
      if (cameraError.name === 'NotAllowedError' || cameraError.name === 'PermissionDeniedError') {
        setError('Camera access was denied. Allow camera permission for this site in your browser settings, then tap Take photo again.');
      } else if (cameraError.name === 'NotFoundError' || cameraError.name === 'DevicesNotFoundError') {
        setError('No camera was found on this device. Choose a photo from your gallery instead.');
      } else if (cameraError.name === 'NotReadableError' || cameraError.name === 'TrackStartError') {
        setError('The camera is busy or unavailable. Close other apps using the camera and try again.');
      } else {
        setError(cameraError.message || 'Could not access the camera. Check site permissions or choose a photo from your gallery.');
      }
    } finally {
      setCameraRequesting(false);
    }
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setError('The camera is not ready yet. Wait for the preview and try again.');
      return;
    }

    const maxDimension = 1600;
    const scale = Math.min(1, maxDimension / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const context = canvas.getContext('2d');
    if (!context) {
      setError('Could not capture the camera image. Please try again or choose a gallery photo.');
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      let blob = null;
      for (const quality of [0.85, 0.7, 0.55]) {
        blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
        if (blob && blob.size <= 5 * 1024 * 1024) break;
      }
      if (!blob) throw new Error('Could not create a photo from the camera.');
      if (blob.size > 5 * 1024 * 1024) {
        throw new Error('The captured photo is larger than 5 MB. Move closer to the item or choose a smaller gallery image.');
      }

      const capturedFile = new File([blob], `campusfind-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setFile(capturedFile);
      setPreviewUrl(URL.createObjectURL(capturedFile));
      setError('');
      stopCamera();
    } catch (captureError) {
      setError(captureError.message || 'Could not capture the photo. Please try again.');
    }
  };

  const handleSelectFile = (event) => {
    const selected = event.target.files?.[0];
    event.target.value = '';
    if (!selected) return;
    setError('');
    setFile(null);
    setPreviewUrl((currentPreview) => {
      if (currentPreview) URL.revokeObjectURL(currentPreview);
      return '';
    });
    if (!allowedTypes.includes(selected.type)) {
      setError('Choose a JPEG, PNG, or WebP image.');
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setError('Image must be 5 MB or smaller.');
      return;
    }
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const uploadPhoto = async () => {
    if (!file || !token) return;
    setUploading(true);
    setProgress(null);
    setError('');
    const body = new FormData();
    body.append('image', file);
    try {
      await foundItemUploadAPI.uploadFromMobile(token, body, {
        onUploadProgress: (event) => {
          if (event.total) setProgress(Math.round((event.loaded / event.total) * 100));
        },
      });
      setSessionStatus('uploaded');
      setFile(null);
    } catch (requestError) {
      try {
        const response = await foundItemUploadAPI.validateMobileToken(token);
        setSessionStatus(response.data.status);
        if (response.data.status === 'pending') {
          setError(requestError.message || 'Photo upload failed. Try again while the link is active.');
        }
      } catch {
        setError(requestError.message || 'Photo upload failed. The link may have expired or been used.');
      }
    } finally {
      setUploading(false);
    }
  };

  const isReady = sessionStatus === 'pending' && !checking;

  return (
    <main className="mobile-upload-page">
      <section className="mobile-upload-card">
        <p className="found-upload-eyebrow">CAMPUSFIND / TEMPORARY UPLOAD</p>
        <h1>Send the item photo</h1>
        <p className="mobile-upload-intro">Choose a photo of the found item. The administrator who created this link will see it appear on their dashboard.</p>

        {checking && <p className="found-upload-inline-status"><LoaderCircle className="found-upload-spin" size={16} /> Checking temporary upload link…</p>}
        {!checking && sessionStatus === 'expired' && <p className="found-upload-message found-upload-message-error"><AlertCircle size={16} /> This upload link has expired. Ask the administrator to generate a new one.</p>}
        {!checking && sessionStatus === 'cancelled' && <p className="found-upload-message found-upload-message-error"><AlertCircle size={16} /> This upload was cancelled. Ask the administrator for a new link.</p>}
        {!checking && sessionStatus === 'uploaded' && <p className="found-upload-message"><CheckCircle size={16} /> A photo has already been uploaded with this link.</p>}
        {error && <p className="found-upload-message found-upload-message-error" role="alert"><AlertCircle size={16} /> {error}</p>}

        {isReady && sessionStatus !== 'uploaded' && (
          <>
            {!window.isSecureContext && (
              <p className="mobile-camera-security-note" role="note">
                Camera access requires HTTPS on this phone. Ask the administrator for a secure link; gallery uploads remain available.
              </p>
            )}
            {cameraActive && (
              <div className="mobile-camera-panel">
                <video ref={videoRef} className="mobile-camera-preview" autoPlay playsInline muted aria-label="Live camera preview" />
                <div className="mobile-camera-actions">
                  <button type="button" className="btn-secondary" onClick={stopCamera}>Cancel</button>
                  <button type="button" className="btn-primary" onClick={capturePhoto}><Camera size={16} /> Capture photo</button>
                </div>
              </div>
            )}
            {previewUrl && <img className="mobile-upload-preview" src={previewUrl} alt="Selected item preview" />}
            <div className="mobile-upload-actions">
              <button type="button" className="btn-secondary" onClick={startCamera} disabled={uploading || cameraActive || cameraRequesting}>
                {cameraRequesting ? <LoaderCircle className="found-upload-spin" size={17} /> : <Camera size={17} />}
                {cameraRequesting ? 'Requesting camera…' : 'Take photo'}
              </button>
              <label className="btn-secondary mobile-upload-file-action" aria-disabled={uploading}>
                <input
                  className="mobile-upload-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleSelectFile}
                  disabled={uploading}
                  aria-label="Choose photo from gallery"
                />
                <ImagePlus size={17} /> Choose from gallery
              </label>
            </div>
            {file && !cameraActive && (
              <div className="mobile-upload-confirm">
                <span>{file.name}</span>
                <button type="button" className="found-upload-text-button" onClick={() => { setFile(null); setPreviewUrl((currentPreview) => { if (currentPreview) URL.revokeObjectURL(currentPreview); return ''; }); }} disabled={uploading}>Replace</button>
                <button type="button" className="btn-primary" onClick={uploadPhoto} disabled={uploading}>
                  {uploading ? <LoaderCircle className="found-upload-spin" size={16} /> : <CheckCircle size={16} />}
                  {uploading ? (progress === null ? 'Uploading…' : `Uploading ${progress}%`) : 'Upload photo'}
                </button>
              </div>
            )}
            <p className="mobile-upload-expiry">This link can be used once and expires after a few minutes.</p>
          </>
        )}

        {sessionStatus === 'uploading' && <p className="found-upload-inline-status"><LoaderCircle className="found-upload-spin" size={16} /> A photo is currently being uploaded.</p>}
        {sessionStatus === 'consumed' && <p className="found-upload-message"><CheckCircle size={16} /> This upload link has already been used for a published item.</p>}
        {['invalid', 'expired', 'cancelled'].includes(sessionStatus) && (
          <button type="button" className="btn-secondary" onClick={() => window.location.reload()}>
            <RefreshCw size={15} /> Check link again
          </button>
        )}
      </section>
    </main>
  );
}
