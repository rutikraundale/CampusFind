import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, Camera, CheckCircle, ImagePlus, LoaderCircle, RefreshCw } from 'lucide-react';
import { foundItemUploadAPI } from '../services/api';
import './FoundItemUpload.css';

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

export default function MobileFoundItemUploadPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [checking, setChecking] = useState(true);
  const [sessionStatus, setSessionStatus] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

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

  const handleSelectFile = (event) => {
    const selected = event.target.files?.[0];
    event.target.value = '';
    if (!selected) return;
    setError('');
    setFile(null);
    setPreviewUrl('');
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
            {previewUrl && <img className="mobile-upload-preview" src={previewUrl} alt="Selected item preview" />}
            <div className="mobile-upload-actions">
              <label className="btn-secondary mobile-upload-file-action" aria-disabled={uploading}>
                <input
                  className="mobile-upload-file-input"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleSelectFile}
                  disabled={uploading}
                  aria-label="Take photo with camera"
                />
                <Camera size={17} /> Take photo
              </label>
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
            {file && (
              <div className="mobile-upload-confirm">
                <span>{file.name}</span>
                <button type="button" className="found-upload-text-button" onClick={() => { setFile(null); setPreviewUrl(''); }} disabled={uploading}>Replace</button>
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
