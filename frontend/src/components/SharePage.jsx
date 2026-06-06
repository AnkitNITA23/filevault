import React, { useState, useEffect } from 'react';
import { FileCode, Download, ShieldAlert, Clock, Loader, Lock } from 'lucide-react';
import api from '../utils/api';
import Logo from './Logo';

export default function SharePage({ shareToken }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fileInfo, setFileInfo] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  
  // Password protection state
  const [password, setPassword] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState('');

  useEffect(() => {
    const fetchFileInfo = async () => {
      setLoading(true);
      setError('');
      try {
        const info = await api.getShareInfo(shareToken);
        setFileInfo(info);
      } catch (err) {
        setError(err.message || 'This share link is expired, deleted, or invalid.');
      } finally {
        setLoading(false);
      }
    };

    if (shareToken) {
      fetchFileInfo();
    }
  }, [shareToken]);

  // Real-time countdown calculation
  useEffect(() => {
    if (!fileInfo || fileInfo.passwordProtected) return;

    const calculateTime = () => {
      const difference = new Date(fileInfo.expiresAt) - new Date();
      if (difference <= 0) {
        setTimeLeft('Expired');
        setError('This share link has just expired.');
        setFileInfo(null);
        return;
      }

      const hrs = Math.floor(difference / (1000 * 60 * 60));
      const mins = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((difference % (1000 * 60)) / 1000);

      if (hrs > 0) {
        setTimeLeft(`${hrs}h ${mins}m ${secs}s remaining`);
      } else if (mins > 0) {
        setTimeLeft(`${mins}m ${secs}s remaining`);
      } else {
        setTimeLeft(`${secs}s remaining`);
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [fileInfo]);

  const handleDownload = () => {
    if (!fileInfo || !fileInfo.downloadUrl) return;
    
    // Create an anchor tag and click it to trigger S3 or local download
    const link = document.createElement('a');
    link.href = fileInfo.downloadUrl;
    link.setAttribute('download', fileInfo.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUnlockSubmit = async (e) => {
    e.preventDefault();
    setUnlockError('');
    setUnlocking(true);
    try {
      const info = await api.verifySharePassword(shareToken, password);
      setFileInfo(info);
      
      // Auto-trigger download on success for premium UX
      if (info.downloadUrl) {
        const link = document.createElement('a');
        link.href = info.downloadUrl;
        link.setAttribute('download', info.filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      setUnlockError(err.message || 'Incorrect password. Access denied.');
    } finally {
      setUnlocking(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="share-layout slide-fade-in">
        <div className="share-card glass-panel" style={{ justifyContent: 'center', padding: '64px' }}>
          <Loader className="spin-icon" size={36} style={{ animation: 'spin 2s linear infinite', color: 'var(--accent-orange)' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Retrieving secure shared metadata...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="share-layout slide-fade-in">
        <div className="share-card glass-panel" style={{ border: '1px solid rgba(239, 68, 68, 0.15)' }}>
          <div className="share-file-icon" style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
            <ShieldAlert size={32} />
          </div>
          <div className="share-card-info">
            <h2 className="share-filename" style={{ color: '#f87171' }}>Link Expired or Invalid</h2>
            <p className="share-filesize" style={{ marginTop: '8px', maxWidth: '340px' }}>
              {error}
            </p>
          </div>
          <a href="/" className="btn btn-secondary" style={{ width: '100%', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); window.location.hash = ''; }}>
            Back to FileVault
          </a>
        </div>
      </div>
    );
  }

  // If password-protected and not unlocked yet
  if (fileInfo && fileInfo.passwordProtected) {
    return (
      <div className="share-layout slide-fade-in" style={{ flexDirection: 'column', gap: '20px' }}>
        <a href="/" className="brand" onClick={(e) => { e.preventDefault(); window.location.hash = ''; }} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>
          <Logo size={24} />
          <span>FileVault</span>
        </a>
        <div className="share-card glass-panel" style={{ width: '100%', maxWidth: '440px' }}>
          <div className="share-file-icon" style={{ background: 'rgba(96, 165, 250, 0.05)', borderColor: 'rgba(96, 165, 250, 0.2)', color: '#60a5fa' }}>
            <Lock size={32} />
          </div>

          <div className="share-card-info">
            <h2 className="share-filename">File Protected</h2>
            <p className="share-filesize">{formatSize(fileInfo.fileSize)} • Enter password to unlock</p>
          </div>

          <form onSubmit={handleUnlockSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', marginTop: '8px' }}>
            {unlockError && (
              <div className="form-error">
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <ShieldAlert size={14} style={{ flexShrink: 0 }} />
                  <span>{unlockError}</span>
                </div>
              </div>
            )}

            <div className="form-group">
              <input 
                type="password" 
                className="form-input" 
                placeholder="Enter password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={unlocking}
                required
                autoFocus
              />
            </div>

            <button 
              className="btn btn-primary" 
              type="submit" 
              disabled={unlocking} 
              style={{ width: '100%', padding: '12px', fontSize: '1rem', gap: '10px' }}
            >
              {unlocking ? (
                <>
                  <Loader size={16} className="spin-icon" style={{ animation: 'spin 2s linear infinite' }} />
                  <span>Decrypting Link...</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>Unlock & Download</span>
                </>
              )}
            </button>
          </form>

          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            File will download immediately on success.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="share-layout slide-fade-in" style={{ flexDirection: 'column', gap: '20px' }}>
      <a href="/" className="brand" onClick={(e) => { e.preventDefault(); window.location.hash = ''; }} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>
        <Logo size={24} />
        <span>FileVault</span>
      </a>
      <div className="share-card glass-panel">
        <div className="share-file-icon">
          <FileCode size={32} />
        </div>

        <div className="share-card-info">
          <h2 className="share-filename" title={fileInfo.filename}>{fileInfo.filename}</h2>
          <p className="share-filesize">{formatSize(fileInfo.fileSize)} • {fileInfo.mimeType}</p>
        </div>

        <div className="share-expiry">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <Clock size={12} />
            <span>Time before auto-deletion</span>
          </div>
          <span className="share-countdown">{timeLeft}</span>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={handleDownload} 
          style={{ width: '100%', padding: '12px', fontSize: '1rem', gap: '10px' }}
        >
          <Download size={18} />
          <span>Download Shared File</span>
        </button>

        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          FileVault secure link encryption verified
        </span>
      </div>
    </div>
  );
}
