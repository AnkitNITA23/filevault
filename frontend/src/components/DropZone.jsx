import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, Copy, File, Clock, RefreshCw } from 'lucide-react';
import SpotlightCard from './SpotlightCard';

export default function DropZone({ 
  isUploading, 
  uploadProgress, 
  uploadSuccessData, 
  onUploadStart, 
  onResetUpload 
}) {
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expiryHours, setExpiryHours] = useState(24);
  const [oneTimeDownload, setOneTimeDownload] = useState(false);
  const [password, setPassword] = useState('');
  const [enablePassword, setEnablePassword] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onUploadStart(files[0], expiryHours, oneTimeDownload, enablePassword ? password : '');
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      onUploadStart(files[0], expiryHours, oneTimeDownload, enablePassword ? password : '');
    }
  };

  const triggerFileSelect = () => {
    if (!isUploading && !uploadSuccessData) {
      fileInputRef.current?.click();
    }
  };

  const copyShareLink = () => {
    if (!uploadSuccessData) return;
    const shareUrl = `${window.location.origin}/#share/${uploadSuccessData.shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="dropzone-container slide-fade-in">
      {!isUploading && !uploadSuccessData && (
        <>
          <SpotlightCard 
            className={`dropzone-card ${dragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
          >
            <input 
              type="file" 
              className="dropzone-file-input" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              onClick={(e) => e.stopPropagation()} // Fix file-click lag by stopping click bubbling loop
            />
            <div className="dropzone-icon-container">
              <UploadCloud size={32} />
            </div>
            <div>
              <h3 className="dropzone-title">Drop your file here</h3>
              <p className="dropzone-subtitle" style={{ marginTop: '4px' }}>
                or click to browse from your computer (Max 100MB)
              </p>
            </div>
          </SpotlightCard>

          <SpotlightCard className="upload-settings">
            <div className="setting-group">
              <label className="setting-label">Link Expiration Period</label>
              <div className="setting-slider-container">
                <input 
                  type="range" 
                  min="1" 
                  max="24" 
                  value={expiryHours} 
                  onChange={(e) => setExpiryHours(parseInt(e.target.value))}
                  className="setting-slider"
                />
                <span className="setting-value">{expiryHours} hours</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <input 
                  type="checkbox" 
                  checked={oneTimeDownload}
                  onChange={(e) => setOneTimeDownload(e.target.checked)}
                  style={{ accentColor: 'var(--accent-orange)' }}
                />
                <span>Self-Destruct (Delete on first download)</span>
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <input 
                    type="checkbox" 
                    checked={enablePassword}
                    onChange={(e) => {
                      setEnablePassword(e.target.checked);
                      if (!e.target.checked) setPassword('');
                    }}
                    style={{ accentColor: 'var(--accent-orange)' }}
                  />
                  <span>Lock link with Password</span>
                </label>
                <div className={`expandable-input ${enablePassword ? 'open' : ''}`}>
                  <input 
                    type="text" 
                    placeholder="Enter download password" 
                    className="form-input" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ padding: '6px 12px', fontSize: '0.8rem', width: '100%', marginTop: '0px' }}
                  />
                </div>
              </div>
            </div>
          </SpotlightCard>
        </>
      )}

      {isUploading && (
        <div className="uploading-card glass-panel">
          <div className="uploading-header">
            <span className="uploading-title">
              <RefreshCw className="spin-icon" size={16} style={{ animation: 'spin 2s linear infinite', color: 'var(--accent-orange)' }} />
              Uploading file to secure vault...
            </span>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {uploadProgress}%
            </span>
          </div>
          <div className="uploading-progress-container">
            <div 
              className="uploading-progress-bar" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <div className="uploading-meta">
            <span>Direct secure connection stream</span>
            <span>Encrypting link mapping</span>
          </div>
        </div>
      )}

      {uploadSuccessData && (
        <div className="success-card glass-panel">
          <div className="success-header">
            <CheckCircle size={20} />
            <span>Secure File Uploaded Successfully!</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem' }}>
            <File size={16} style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontWeight: 500 }}>{uploadSuccessData.filename}</span>
            <span style={{ color: 'var(--text-muted)' }}>({formatSize(uploadSuccessData.fileSize)})</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span className="setting-label" style={{ fontSize: '0.75rem' }}>Shareable Temporary Link</span>
            <div className="success-link-box">
              <span className="success-link-text">
                {`${window.location.origin}/#share/${uploadSuccessData.shareToken}`}
              </span>
              <button 
                className="btn btn-secondary" 
                onClick={copyShareLink}
                style={{ padding: '6px 12px', minWidth: '80px' }}
              >
                {copied ? 'Copied!' : <><Copy size={14} /> Copy</>}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Link will expire on {new Date(uploadSuccessData.expiresAt).toLocaleString()}
            </span>
            <button className="btn btn-secondary" onClick={onResetUpload} style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
              Upload another file
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
