import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { AlertCircle, Camera, CheckCircle, ImagePlus, LoaderCircle, RefreshCw, X } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import AdminMasthead from '../components/AdminMasthead';
import { foundItemUploadAPI } from '../services/api';
import './FoundItemUpload.css';

const categories = ['electronics', 'clothing', 'accessories', 'books', 'documents', 'wallet', 'id card', 'keys', 'other'];
const localDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const phoneUploadUsesHttps = () => {
  try {
    const publicUrl = import.meta.env.VITE_PUBLIC_APP_URL?.trim();
    return new URL(publicUrl || window.location.origin).protocol === 'https:';
  } catch {
    return false;
  }
};

const getAdminEmail = () => {
  try {
    return JSON.parse(localStorage.getItem('campusfind_user') || 'null')?.email || '';
  } catch {
    return '';
  }
};

export default function AddFoundItemPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    reportType: 'found',
    title: '',
    description: '',
    category: 'other',
    foundAt: '',
    foundDate: localDate(),
    contactEmail: getAdminEmail(),
    contactPhone: '',
  });
  const [session, setSession] = useState(null);
  const [uploadMode, setUploadMode] = useState('');
  const [qrImage, setQrImage] = useState('');
  const [qrError, setQrError] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [localPreview, setLocalPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [pollError, setPollError] = useState('');

  useEffect(() => {
    if (!session?.token || uploadMode !== 'phone') {
      return undefined;
    }

    let cancelled = false;
    const buildQr = async () => {
      try {
        const configuredUrl = import.meta.env.VITE_PUBLIC_APP_URL?.trim();
        const baseUrl = new URL(configuredUrl || window.location.origin);
        if (!['http:', 'https:'].includes(baseUrl.protocol) || baseUrl.username || baseUrl.password) {
          throw new Error('The public app URL must be a valid HTTP or HTTPS address.');
        }
        if (/^(localhost|127(?:\.\d{1,3}){3}|\[::1\])$/i.test(baseUrl.hostname)) {
          throw new Error('Your site is using localhost, which phones cannot reach. Open CampusFind on this computer using its LAN address (for example, http://192.168.1.20:5173), then generate a new QR code.');
        }
        if (import.meta.env.PROD && (baseUrl.protocol !== 'https:' || /^(localhost|127\.0\.0\.1)$/.test(baseUrl.hostname))) {
          throw new Error('Production phone uploads require a public HTTPS frontend URL.');
        }

        const mobileUrl = new URL('mobile-upload', baseUrl.href.endsWith('/') ? baseUrl.href : `${baseUrl.href}/`);
        mobileUrl.searchParams.set('token', session.token);
        const dataUrl = await QRCode.toDataURL(mobileUrl.toString(), {
          errorCorrectionLevel: 'M',
          margin: 1,
          width: 240,
          color: { dark: '#26251e', light: '#f7f7f4' },
        });
        if (!cancelled) setQrImage(dataUrl);
      } catch (qrBuildError) {
        if (!cancelled) setQrError(qrBuildError.message || 'Could not generate a QR code.');
      }
    };

    buildQr();
    return () => {
      cancelled = true;
    };
  }, [session?.token, uploadMode]);

  useEffect(() => {
    if (!session?.id || uploadMode !== 'phone' || !['pending', 'uploading'].includes(session.status)) {
      return undefined;
    }

    let timeoutId;
    let controller;
    let stopped = false;
    let failures = 0;

    const poll = async () => {
      controller = new AbortController();
      try {
        const response = await foundItemUploadAPI.getSession(session.id, { signal: controller.signal });
        if (stopped) return;
        const latest = response.data;
        setSession((current) => current?.id === latest.id ? { ...current, ...latest } : current);
        setPollError('');
        failures = 0;
        if (latest.status === 'uploaded') setPhotoUrl(latest.imageUrl);
        if (['pending', 'uploading'].includes(latest.status)) {
          timeoutId = window.setTimeout(poll, 2500);
        }
      } catch (pollingError) {
        if (stopped || pollingError.name === 'CanceledError') return;
        failures += 1;
        if (failures > 6) {
          setPollError('Could not check the phone upload. Check your connection or generate a new QR code.');
          return;
        }
        timeoutId = window.setTimeout(poll, Math.min(2000 * (2 ** (failures - 1)), 15000));
      }
    };

    poll();
    return () => {
      stopped = true;
      window.clearTimeout(timeoutId);
      controller?.abort();
    };
  }, [session?.id, session?.status, uploadMode]);

  useEffect(() => () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
  }, [localPreview]);

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError('');
  };

  const cancelCurrentSession = async () => {
    if (!session?.id || session.status === 'consumed') return;
    await foundItemUploadAPI.cancelSession(session.id);
  };

  const createSession = async (mode) => {
    await cancelCurrentSession();
    const response = await foundItemUploadAPI.createSession();
    const created = response.data;
    setSession(created);
    setUploadMode(mode);
    setPhotoUrl('');
    setQrError('');
    setPollError('');
    setQrImage('');
    setError('');
    return created;
  };

  const handlePhoneUpload = async () => {
    setBusy(true);
    setError('');
    setPhotoUrl('');
    setLocalPreview('');
    try {
      await createSession('phone');
    } catch (requestError) {
      setError(requestError.message || 'Could not start a phone upload session.');
    } finally {
      setBusy(false);
    }
  };

  const handleSelectPhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5 MB or smaller.');
      return;
    }

    setBusy(true);
    setError('');
    setPhotoUrl('');
    setUploadProgress(null);
    setLocalPreview(URL.createObjectURL(file));
    try {
      const created = await createSession('pc');
      const data = new FormData();
      data.append('image', file);
      const response = await foundItemUploadAPI.uploadFromAdmin(created.id, data, {
        onUploadProgress: (event) => {
          if (event.total) setUploadProgress(Math.round((event.loaded / event.total) * 100));
        },
      });
      setSession((current) => current?.id === created.id ? { ...current, ...response.data } : current);
      setPhotoUrl(response.data.imageUrl);
    } catch (requestError) {
      setError(requestError.message || 'Could not upload the selected image.');
    } finally {
      setBusy(false);
    }
  };

  const handleCancelUpload = async () => {
    setBusy(true);
    setError('');
    try {
      await cancelCurrentSession();
      setSession((current) => current ? { ...current, status: 'cancelled' } : current);
      setUploadMode('');
      setPhotoUrl('');
      setLocalPreview('');
      setQrImage('');
    } catch (requestError) {
      setError(requestError.message || 'Could not cancel this upload.');
    } finally {
      setBusy(false);
    }
  };

  const handleCancelAndExit = async () => {
    setBusy(true);
    setError('');
    try {
      await cancelCurrentSession();
      navigate('/admin/dashboard');
    } catch (requestError) {
      setError(requestError.message || 'Could not cancel this upload session.');
    } finally {
      setBusy(false);
    }
  };

  const handlePublish = async (event) => {
    event.preventDefault();
    if (!photoUrl || session?.status !== 'uploaded') {
      setError('Attach a successfully uploaded item photo before publishing.');
      return;
    }
    setPublishing(true);
    setError('');
    try {
      await foundItemUploadAPI.publish(session.id, {
        ...form,
        uploadSessionId: session.id,
      });
      navigate('/admin/dashboard', { state: { notice: `${form.title.trim()} was added to the item registry.` } });
    } catch (publishError) {
      setError(publishError.message || 'Could not publish the found item.');
    } finally {
      setPublishing(false);
    }
  };

  const imagePreview = photoUrl || localPreview;
  const sessionStatus = session?.status;

  return (
    <div className="found-upload-layout">
      <AdminSidebar />
      <main className="found-upload-main">
        <AdminMasthead />
        <header className="found-upload-header">
          <p className="found-upload-eyebrow">ADMINISTRATIVE OFFICE / ITEM REGISTRY</p>
          <h1>Report an item</h1>
          <p>Create one record for either a lost item or an item found on campus.</p>
        </header>

        <form className="found-upload-form" onSubmit={handlePublish}>
          <section className="found-upload-card" aria-labelledby="report-type-heading">
            <div className="found-upload-section-title">
              <span className="found-upload-eyebrow">01 / REPORT CLASSIFICATION</span>
              <h2 id="report-type-heading">What is being reported?</h2>
            </div>
            <div role="group" aria-labelledby="report-type-heading" className="found-upload-photo-actions">
              {[
                { value: 'lost', label: 'Lost item' },
                { value: 'found', label: 'Found item' },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  className={form.reportType === type.value ? 'btn-primary' : 'btn-secondary'}
                  aria-pressed={form.reportType === type.value}
                  onClick={() => setForm((current) => ({ ...current, reportType: type.value }))}
                >
                  {type.label}
                </button>
              ))}
            </div>
            <p className="found-upload-inline-status">
              {form.reportType === 'lost'
                ? 'Record the item a student has lost; it will appear in the registry but not in the found-item handover queue.'
                : 'Record an item in the administration office’s custody; verified students can reclaim it through the handover desk.'}
            </p>
          </section>

          <section className="found-upload-card" aria-labelledby="item-details-heading">
            <div className="found-upload-section-title">
              <span className="found-upload-eyebrow">02 / ITEM DETAILS</span>
              <h2 id="item-details-heading">Item information</h2>
            </div>
            <div className="found-upload-fields">
              <label>
                Item name <span aria-hidden="true">*</span>
                <input name="title" value={form.title} onChange={updateField} maxLength={120} required />
              </label>
              <label>
                Category <span aria-hidden="true">*</span>
                <select name="category" value={form.category} onChange={updateField} required>
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
              <label className="found-upload-wide">
                Description <span aria-hidden="true">*</span>
                <textarea name="description" value={form.description} onChange={updateField} maxLength={2000} rows={4} required />
              </label>
              <label>
                {form.reportType === 'lost' ? 'Last seen at' : 'Location found'} <span aria-hidden="true">*</span>
                <input name="foundAt" value={form.foundAt} onChange={updateField} maxLength={160} required />
              </label>
              <label>
                {form.reportType === 'lost' ? 'Date lost' : 'Date found'} <span aria-hidden="true">*</span>
                <input name="foundDate" type="date" value={form.foundDate} onChange={updateField} max={localDate()} required />
              </label>
              <label>
                Contact email <span aria-hidden="true">*</span>
                <input name="contactEmail" type="email" value={form.contactEmail} onChange={updateField} required />
              </label>
              <label>
                Contact phone <span aria-hidden="true">*</span>
                <input name="contactPhone" type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={form.contactPhone} onChange={updateField} required />
              </label>
            </div>
          </section>

          <section className="found-upload-card" aria-labelledby="item-photo-heading">
            <div className="found-upload-section-title">
              <span className="found-upload-eyebrow">03 / ITEM PHOTO</span>
              <h2 id="item-photo-heading">Attach a photograph</h2>
              <p>JPEG, PNG, or WebP · up to 5 MB. Upload directly from this computer or use a phone.</p>
            </div>

            <div className="found-upload-photo-actions">
              <button type="button" className="btn-primary" disabled={busy || publishing} onClick={() => fileInputRef.current?.click()}>
                {busy && uploadMode === 'pc' ? <LoaderCircle className="found-upload-spin" size={16} /> : <ImagePlus size={16} />}
                Choose photo from PC
              </button>
              <input ref={fileInputRef} className="found-upload-hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleSelectPhoto} />
              <button type="button" className="btn-secondary" disabled={busy || publishing} onClick={handlePhoneUpload}>
                {busy && uploadMode !== 'pc' ? <LoaderCircle className="found-upload-spin" size={16} /> : <Camera size={16} />}
                {busy && uploadMode !== 'pc' ? 'Preparing phone upload…' : 'Upload from phone'}
              </button>
            </div>

            {imagePreview && (
              <div className="found-upload-preview">
                <img src={imagePreview} alt="Preview of found item" />
                <div>
                  <p>{photoUrl ? 'Photo uploaded and ready to publish' : busy ? 'Uploading photo…' : 'Local preview — upload not complete'}</p>
                  {sessionStatus !== 'consumed' && (
                    <button type="button" className="found-upload-text-button" onClick={handleCancelUpload} disabled={busy}>
                      <X size={14} /> {photoUrl ? 'Remove photo' : 'Discard selection'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {busy && uploadMode === 'pc' && <p className="found-upload-inline-status"><LoaderCircle className="found-upload-spin" size={15} /> {uploadProgress === null ? 'Uploading photo securely…' : `Uploading photo securely… ${uploadProgress}%`}</p>}

            {uploadMode === 'phone' && session && (
              <div className="found-upload-phone-session">
                {qrImage ? <img className="found-upload-qr" src={qrImage} alt="Temporary mobile upload QR code" /> : null}
                <div className="found-upload-phone-copy">
                  <h3>Scan with your phone camera</h3>
                  <p>The temporary upload link expires at {new Date(session.expiresAt).toLocaleTimeString()}.</p>
                  {!phoneUploadUsesHttps() && (
                    <p className="found-upload-error-text">
                      This link uses HTTP. Phone camera permission requires HTTPS; gallery uploads will still work.
                    </p>
                  )}
                  <p className="found-upload-inline-status" role="status">
                    {sessionStatus === 'uploaded' ? <CheckCircle size={15} /> : <LoaderCircle className="found-upload-spin" size={15} />}
                    {sessionStatus === 'uploaded' ? 'Photo received and attached.' : sessionStatus === 'uploading' ? 'Phone is uploading the image…' : sessionStatus === 'expired' ? 'This upload link expired.' : sessionStatus === 'cancelled' ? 'Upload cancelled.' : 'Waiting for a phone photo…'}
                  </p>
                  {qrError && <p className="found-upload-error-text">{qrError}</p>}
                  {pollError && <p className="found-upload-error-text">{pollError}</p>}
                  {['expired', 'cancelled'].includes(sessionStatus) && (
                    <button type="button" className="btn-secondary" onClick={handlePhoneUpload} disabled={busy}>
                      <RefreshCw size={15} /> Generate a new QR code
                    </button>
                  )}
                </div>
                {!['uploaded', 'expired', 'cancelled'].includes(sessionStatus) && (
                  <button type="button" className="found-upload-text-button" onClick={handleCancelUpload} disabled={busy}>
                    Cancel
                  </button>
                )}
              </div>
            )}
          </section>

          {error && (
            <div className="found-upload-message found-upload-message-error" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <footer className="found-upload-footer">
            <button type="button" className="btn-secondary" onClick={handleCancelAndExit} disabled={busy || publishing}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={busy || publishing || !photoUrl || sessionStatus !== 'uploaded'}>
              {publishing ? <LoaderCircle className="found-upload-spin" size={16} /> : <CheckCircle size={16} />}
              {publishing ? 'Publishing…' : 'Save item report'}
            </button>
          </footer>
        </form>
      </main>
    </div>
  );
}
