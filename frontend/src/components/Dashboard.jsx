import React, { useState, useEffect } from 'react';
import { FileCode, Trash2, Link, Copy, CheckCircle, Clock, Lock, Eye, Zap, X } from 'lucide-react';
import SpotlightCard from './SpotlightCard';

/**
 * Self-updating countdown component to display remaining time
 */
function Countdown({ expiresAt, onExpire }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(expiresAt) - new Date();
      if (difference <= 0) {
        setTimeLeft('Expired');
        if (onExpire) onExpire();
        return;
      }

      const hrs = Math.floor(difference / (1000 * 60 * 60));
      const mins = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((difference % (1000 * 60)) / 1000);

      if (hrs > 0) {
        setTimeLeft(`${hrs}h ${mins}m left`);
      } else if (mins > 0) {
        setTimeLeft(`${mins}m ${secs}s left`);
      } else {
        setTimeLeft(`${secs}s left`);
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  return (
    <div className={`countdown-tag ${timeLeft === 'Expired' ? 'expired-tag' : ''}`}>
      <Clock size={11} />
      <span>{timeLeft}</span>
    </div>
  );
}

export default function Dashboard({ files, onDeleteFile, onRefresh }) {
  const [copiedId, setCopiedId] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleCopyLink = (file) => {
    const shareUrl = `${window.location.origin}/#share/${file.share_token}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeFiles = files.filter(f => f.status === 'active' && new Date(f.expires_at) > new Date());
  const expiredFiles = files.filter(f => f.status === 'expired' || new Date(f.expires_at) <= new Date() || f.status === 'pending');

  // Monitor arrow navigation and dashboard hotkeys
  useEffect(() => {
    if (activeFiles.length === 0) {
      setFocusedIndex(-1);
      return;
    }

    const handleKeyDown = (e) => {
      // Avoid firing hotkeys when focus is inside text fields
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => {
          const next = prev + 1;
          return next >= activeFiles.length ? 0 : next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => {
          const next = prev - 1;
          return next < 0 ? activeFiles.length - 1 : next;
        });
      } else if (e.key === 'c' || e.key === 'C') {
        if (focusedIndex >= 0 && focusedIndex < activeFiles.length) {
          e.preventDefault();
          handleCopyLink(activeFiles[focusedIndex]);
        }
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        if (focusedIndex >= 0 && focusedIndex < activeFiles.length) {
          e.preventDefault();
          const target = activeFiles[focusedIndex];
          if (window.confirm(`Are you sure you want to revoke the share link for ${target.filename}? This deletes the file immediately.`)) {
            onDeleteFile(target.id);
            setFocusedIndex(prev => {
              if (prev >= activeFiles.length - 1) return Math.max(0, activeFiles.length - 2);
              return prev;
            });
          }
        }
      } else if (e.key === 'Enter' || e.key === 'v' || e.key === 'V') {
        if (focusedIndex >= 0 && focusedIndex < activeFiles.length) {
          e.preventDefault();
          setSelectedFile(activeFiles[focusedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFiles, focusedIndex, onDeleteFile]);

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };



  return (
    <div className="dashboard-container slide-fade-in" style={{ marginTop: '12px' }}>
      
      {/* Active Files Section */}
      <div className="dashboard-title-row">
        <h2>Active Secure Shares</h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {activeFiles.length} active link{activeFiles.length !== 1 ? 's' : ''}
        </span>
      </div>

      {activeFiles.length > 0 ? (
        <>
          <div className="file-list slide-fade-in-list">
            {activeFiles.map((file, idx) => (
              <SpotlightCard 
                className={`file-card ${idx === focusedIndex ? 'focused' : ''}`} 
                key={file.id}
                tabIndex="0"
                onMouseEnter={() => setFocusedIndex(idx)}
                onClick={() => setSelectedFile(file)}
                style={{ cursor: 'pointer' }}
              >
                <div className="file-info-left">
                  <div className="file-icon-box">
                    <FileCode size={20} />
                  </div>
                  <div className="file-text">
                    <div className="file-name" title={file.filename}>{file.filename}</div>
                    <div className="file-meta-row">
                      <span>{formatSize(file.file_size)}</span>
                      <span>•</span>
                      <Countdown expiresAt={file.expires_at} onExpire={onRefresh} />
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }} title="Downloads count">
                        <Eye size={12} /> {file.download_count}
                      </span>
                      {file.password_protected && (
                        <>
                          <span>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#60a5fa' }} title="Password Protected">
                            <Lock size={11} /> Secured
                          </span>
                        </>
                      )}
                      {file.one_time_download && (
                        <>
                          <span>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#fbbf24' }} title="One-time share (Self-destruct)">
                            <Zap size={11} /> Self-Destruct
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="file-card-actions" onClick={(e) => e.stopPropagation()}>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => handleCopyLink(file)}
                    style={{ padding: '8px' }}
                    title="Copy share link"
                  >
                    {copiedId === file.id ? (
                      <CheckCircle size={15} style={{ color: '#10b981' }} />
                    ) : (
                      <Link size={15} />
                    )}
                  </button>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to revoke the share link for ${file.filename}? This deletes the file immediately.`)) {
                        onDeleteFile(file.id);
                      }
                    }}
                    style={{ padding: '8px' }}
                    title="Revoke & Delete file"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </SpotlightCard>
            ))}
          </div>
          <div className="file-kbd-guide">
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Keyboard Guides:</span>
            <span><span className="kbd-badge">↑↓</span> Navigate</span>
            <span><span className="kbd-badge">C</span> Copy Link</span>
            <span><span className="kbd-badge">Del</span> Revoke Share</span>
            <span><span className="kbd-badge">Enter</span> Share Details</span>
          </div>
        </>
      ) : (
        <div className="empty-state">
          No active temporary share links. Drop a file above to create one.
        </div>
      )}

      {/* Expired / Archive Files Section */}
      {expiredFiles.length > 0 && (
        <>
          <div className="dashboard-title-row" style={{ marginTop: '40px' }}>
            <h2 style={{ color: 'var(--text-muted)' }}>Expired / Revoked Shares</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {expiredFiles.length} archived
            </span>
          </div>

          <div className="file-list slide-fade-in-list" style={{ opacity: 0.6 }}>
            {expiredFiles.map(file => (
              <div className="file-card glass-panel" key={file.id} style={{ border: '1px solid transparent' }}>
                <div className="file-info-left">
                  <div className="file-icon-box">
                    <FileCode size={20} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div className="file-text">
                    <div className="file-name" style={{ color: 'var(--text-secondary)' }}>{file.filename}</div>
                    <div className="file-meta-row">
                      <span>{formatSize(file.file_size)}</span>
                      <span>•</span>
                      <span className="badge expired-tag" style={{ padding: '1px 6px' }}>
                        Expired / Purged
                      </span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Eye size={12} /> {file.download_count} downloads
                      </span>
                    </div>
                  </div>
                </div>
                <div className="file-card-actions">
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Deleted {new Date(file.expires_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Sliding Analytics Details Drawer */}
      {selectedFile && (
        <>
          <div className="drawer-backdrop" onClick={() => setSelectedFile(null)} />
          <div className="analytics-drawer">
            <div className="drawer-header">
              <h3>Secure Share Details</h3>
              <button className="btn btn-secondary" onClick={() => setSelectedFile(null)} style={{ padding: '6px' }} title="Close Details">
                <X size={16} />
              </button>
            </div>
            
            <div className="drawer-body">
              <div>
                <span className="drawer-section-title">File Identity</span>
                <div className="drawer-meta-grid">
                  <div className="drawer-meta-row">
                    <span className="drawer-label">Filename</span>
                    <span className="drawer-value" style={{ fontWeight: 600 }}>{selectedFile.filename}</span>
                  </div>
                  <div className="drawer-meta-row">
                    <span className="drawer-label">MIME Type</span>
                    <span className="drawer-value">{selectedFile.mime_type || 'Unknown'}</span>
                  </div>
                  <div className="drawer-meta-row">
                    <span className="drawer-label">File Size</span>
                    <span className="drawer-value">{formatSize(selectedFile.file_size)}</span>
                  </div>
                  <div className="drawer-meta-row">
                    <span className="drawer-label">Storage Key</span>
                    <span className="drawer-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                      {selectedFile.file_key}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <span className="drawer-section-title">Security & Limits</span>
                <div className="drawer-meta-grid">
                  <div className="drawer-meta-row">
                    <span className="drawer-label">Decryption Lock</span>
                    <span className="drawer-value" style={{ color: selectedFile.password_protected ? '#60a5fa' : 'var(--text-secondary)' }}>
                      {selectedFile.password_protected ? 'Password Secured' : 'No Password'}
                    </span>
                  </div>
                  <div className="drawer-meta-row">
                    <span className="drawer-label">Share Mode</span>
                    <span className="drawer-value" style={{ color: selectedFile.one_time_download ? '#fbbf24' : 'var(--text-secondary)' }}>
                      {selectedFile.one_time_download ? 'Self-Destruct Enabled' : 'Standard Share'}
                    </span>
                  </div>
                  <div className="drawer-meta-row">
                    <span className="drawer-label">Expiration</span>
                    <span className="drawer-value" style={{ color: 'var(--accent-orange)' }}>
                      {new Date(selectedFile.expires_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <span className="drawer-section-title">Traffic Analytics</span>
                <div className="drawer-meta-grid">
                  <div className="drawer-meta-row">
                    <span className="drawer-label">Hit Count</span>
                    <span className="drawer-value" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '1rem', fontWeight: 700 }}>
                      <Eye size={14} /> {selectedFile.download_count} download{selectedFile.download_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="drawer-meta-row">
                    <span className="drawer-label">Share Status</span>
                    <span className="drawer-value">
                      <span className="badge badge-green" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                        <span className="badge-dot" /> Active Link
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="drawer-footer" style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  handleCopyLink(selectedFile);
                }}
                style={{ flex: 1 }}
              >
                Copy Share Link
              </button>
              <button 
                className="btn btn-danger" 
                onClick={() => {
                  if (window.confirm(`Are you sure you want to revoke the share link for ${selectedFile.filename}? This deletes the file immediately.`)) {
                    onDeleteFile(selectedFile.id);
                    setSelectedFile(null);
                  }
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
