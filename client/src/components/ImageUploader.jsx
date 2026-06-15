import { useState, useRef } from 'react';
import api from '../api';
import './ImageUploader.css';

/**
 * Drag-and-drop image uploader for the admin product form.
 * Props:
 *   value:    array of image URL strings
 *   onChange: (urls: string[]) => void
 */
export default function ImageUploader({ value = [], onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;
    setError('');
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach(f => fd.append('images', f));
      const r = await api.post('/uploads/images', fd);
      onChange([...value, ...r.data.urls]);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
  };

  const removeImage = async (url) => {
    onChange(value.filter(u => u !== url));
    // Best-effort delete from disk for files we hosted
    if (url.startsWith('/uploads/')) {
      try { await api.delete('/uploads/images', { data: { url } }); } catch { /* ignore */ }
    }
  };

  const makeMain = (url) => {
    onChange([url, ...value.filter(u => u !== url)]);
  };

  return (
    <div className="img-uploader">
      <div
        className={`img-dropzone ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={e => { uploadFiles(e.target.files); e.target.value = ''; }}
        />
        {uploading ? (
          <div className="img-dropzone-inner">
            <div className="spinner-sm" style={{ margin: '0 auto 10px' }} />
            <span>Uploading…</span>
          </div>
        ) : (
          <div className="img-dropzone-inner">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span><strong>Click to upload</strong> or drag &amp; drop</span>
            <span className="img-dropzone-hint">JPG, PNG, WEBP — up to 8MB each</span>
          </div>
        )}
      </div>

      {error && <div className="alert alert-error" style={{ marginTop: '10px' }}>{error}</div>}

      {value.length > 0 && (
        <div className="img-grid">
          {value.map((url, i) => (
            <div key={url} className={`img-thumb ${i === 0 ? 'is-main' : ''}`}>
              <img src={url} alt={`Product ${i + 1}`} />
              {i === 0 && <span className="img-main-badge">Main</span>}
              <div className="img-thumb-actions">
                {i !== 0 && (
                  <button type="button" title="Set as main image" onClick={() => makeMain(url)}>★</button>
                )}
                <button type="button" title="Remove" className="img-remove" onClick={() => removeImage(url)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
