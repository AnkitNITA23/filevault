import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Shield, Clock, Zap, Key, BarChart3, Keyboard, UploadCloud } from 'lucide-react';
import Header from './components/Header';
import CommandPalette from './components/CommandPalette';
import DropZone from './components/DropZone';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';
import SharePage from './components/SharePage';
import SpotlightCard from './components/SpotlightCard';
import api from './utils/api';
import CommandPalettePreview from './components/CommandPalettePreview';
import Footer from './components/Footer';
import { 
  VaultMockup, 
  SelfDestructMockup, 
  PasswordLockMockup, 
  AnalyticsMockup, 
  RadarSweepMockup, 
  CommandCenterMockup 
} from './components/InteractiveMockups';

export default function App() {
  const [user, setUser] = useState(api.getUser());
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccessData, setUploadSuccessData] = useState(null);
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingUpload, setPendingUpload] = useState(null);
  const [shareToken, setShareToken] = useState(null);
  const [health, setHealth] = useState(null);
  
  // Global Viewport Drag-and-Drop Overlay State
  const [globalDragActive, setGlobalDragActive] = useState(false);
  const dragCounter = useRef(0);

  // Check URL hash for routing
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#share/')) {
        const token = hash.split('/')[1];
        setShareToken(token || null);
      } else {
        setShareToken(null);
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Fetch connection health status
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('http://localhost:5000/health');
        if (response.ok) {
          const data = await response.json();
          setHealth(data);
        }
      } catch (err) {
        console.warn('API Health check failed (server may be offline):', err);
      }
    };
    fetchHealth();
  }, []);

  // Setup global drag-and-drop window overlays
  useEffect(() => {
    const handleDragEnter = (e) => {
      e.preventDefault();
      dragCounter.current++;
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setGlobalDragActive(true);
      }
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      dragCounter.current--;
      if (dragCounter.current <= 0) {
        setGlobalDragActive(false);
        dragCounter.current = 0;
      }
    };

    const handleDragOver = (e) => {
      e.preventDefault();
    };

    const handleDrop = (e) => {
      e.preventDefault();
      setGlobalDragActive(false);
      dragCounter.current = 0;
      
      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0 && !shareToken) {
        handleUploadStart(droppedFiles[0], 24, false, '');
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [user, shareToken]);

  // Fetch history when user changes
  const fetchHistory = async () => {
    if (!user) return;
    try {
      const history = await api.getHistory();
      setFiles(history);
    } catch (err) {
      console.error('Error fetching file history:', err);
      if (err.message.includes('expired') || err.message.includes('token')) {
        handleLogout();
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    } else {
      setFiles([]);
    }
  }, [user]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isK = e.key === 'k' || e.key === 'K';
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && isK) {
        e.preventDefault();
        setIsCmdOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setFiles([]);
    setUploadSuccessData(null);
  };

  const handleAuthSuccess = (loggedUser) => {
    setUser(loggedUser);
    setShowAuthModal(false);

    // If uploader dropped a file as guest, kick it off automatically now that they logged in!
    if (pendingUpload) {
      const pending = pendingUpload;
      setPendingUpload(null);
      setTimeout(() => {
        handleUploadStart(
          pending.file,
          pending.expiryHours,
          pending.oneTimeDownload,
          pending.password
        );
      }, 300);
    }
  };

  const handleDeleteFile = async (id) => {
    try {
      await api.deleteFile(id);
      fetchHistory();
    } catch (err) {
      alert(`Error revoking file: ${err.message}`);
    }
  };

  // Perform secure S3/local direct upload with progress indicators
  const handleUploadStart = async (file, expiryHours, oneTimeDownload, password) => {
    // Intercept if logged out and prompt user to login/signup
    if (!user) {
      setPendingUpload({ file, expiryHours, oneTimeDownload, password });
      setAuthMode('register');
      setShowAuthModal(true);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadSuccessData(null);

    try {
      // 1. Request upload configuration
      const configData = await api.requestUpload(
        file.name,
        file.size,
        file.type,
        expiryHours,
        oneTimeDownload,
        password
      );

      const { uploadUrl, fileId, shareToken, expiresAt } = configData;

      // 2. Perform direct binary PUT stream to S3 / Local mock
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      
      // S3 expects exact Content-Type headers
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            // 3. Confirm upload on backend
            await api.confirmUpload(fileId);
            
            // Confetti success trigger!
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#ff5e3a', '#f43f5e', '#ffffff']
            });

            setUploadSuccessData({
              shareToken,
              filename: file.name,
              expiresAt,
              fileSize: file.size
            });

            fetchHistory();
          } catch (confirmErr) {
            alert(`Confirm upload failed: ${confirmErr.message}`);
          } finally {
            setIsUploading(false);
          }
        } else {
          alert(`Transmission rejected by storage provider (Code ${xhr.status})`);
          setIsUploading(false);
        }
      };

      xhr.onerror = () => {
        alert('Network connection lost during secure upload stream.');
        setIsUploading(false);
      };

      xhr.send(file);

    } catch (err) {
      alert(`Upload request failed: ${err.message}`);
      setIsUploading(false);
    }
  };

  const triggerUploadInput = () => {
    const dropzoneInput = document.querySelector('.dropzone-file-input');
    if (dropzoneInput) {
      dropzoneInput.click();
    }
  };

  return (
    <div className="app-container">
      {/* Background glow templates */}
      <div className="bg-glow-container">
        <div className="bg-glow-radial" />
        <div className="bg-glow-grid" />
      </div>

      <Header 
        user={user} 
        onLogout={handleLogout} 
        onOpenCmd={() => setIsCmdOpen(true)}
        health={health}
      />

      <main className="main-content">
        {shareToken ? (
          <SharePage shareToken={shareToken} />
        ) : user ? (
          // Logged In Dashboard & Workspace
          <>
            <DropZone 
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              uploadSuccessData={uploadSuccessData}
              onUploadStart={handleUploadStart}
              onResetUpload={() => setUploadSuccessData(null)}
            />
            <Dashboard 
              files={files} 
              onDeleteFile={handleDeleteFile}
              onRefresh={fetchHistory}
            />
          </>
        ) : (
          // Public-facing Raycast-style homepage
          <div className="marketing-container">
            {/* Split hero grid with simulated palette */}
            <div className="hero-grid slide-fade-in">
              <div className="hero-section" style={{ padding: '0', textAlign: 'left', margin: '0' }}>
                <div className="badge badge-orange" style={{ marginBottom: '16px' }} onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}>
                  <div className="badge-dot" />
                  <span>Temporary File Sharing in a Flash</span>
                </div>
                <h1 className="hero-title" style={{ textAlign: 'left', marginBottom: '16px' }}>
                  Secure temporary shares.<br />
                  <span className="glow-text">Deleted in 24 hours.</span>
                </h1>
                <p className="hero-subtitle" style={{ textAlign: 'left', margin: '0', maxWidth: '540px' }}>
                  Stream files directly into private, isolated AWS S3 vaults. Share links that self-destruct upon download, guarded by custom encryption passwords.
                </p>
              </div>
              <CommandPalettePreview />
            </div>

            {/* Live interactive playground */}
            <DropZone 
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              uploadSuccessData={uploadSuccessData}
              onUploadStart={handleUploadStart}
              onResetUpload={() => setUploadSuccessData(null)}
            />

            {/* Premium Features Grid */}
            <div className="features-grid slide-fade-in-list">
              <SpotlightCard className="feature-card">
                <VaultMockup />
                <div className="feature-icon">
                  <Shield size={18} />
                </div>
                <h3>Private AWS S3 Vaults</h3>
                <p>Files are stored in private isolated buckets with blocked public access, streamable only via temporary pre-signed links.</p>
              </SpotlightCard>
              
              <SpotlightCard className="feature-card">
                <RadarSweepMockup />
                <div className="feature-icon">
                  <Clock size={18} />
                </div>
                <h3>Auto-Purge Cron Jobs</h3>
                <p>Background Express task schedulers and Lambda scripts scan and sweep expired shares every 5 minutes.</p>
              </SpotlightCard>

              <SpotlightCard className="feature-card">
                <SelfDestructMockup />
                <div className="feature-icon">
                  <Zap size={18} />
                </div>
                <h3>Self-Destruct Transfers</h3>
                <p>Enable one-time downloads to immediately delete the file object from S3 after the first downloader completes.</p>
              </SpotlightCard>

              <SpotlightCard className="feature-card">
                <PasswordLockMockup />
                <div className="feature-icon">
                  <Key size={18} />
                </div>
                <h3>Password Lock Protection</h3>
                <p>Assign download passwords to share links. Decrypts and exposes download URLs only upon matching validation.</p>
              </SpotlightCard>

              <SpotlightCard className="feature-card">
                <AnalyticsMockup />
                <div className="feature-icon">
                  <BarChart3 size={18} />
                </div>
                <h3>Download Hit Analytics</h3>
                <p>Inspect real-time hit counters on your dashboard to track exactly how many times files have been opened.</p>
              </SpotlightCard>

              <SpotlightCard className="feature-card">
                <CommandCenterMockup />
                <div className="feature-icon">
                  <Keyboard size={18} />
                </div>
                <h3>Command Menu Centre</h3>
                <p>Search history and copy links rapidly with the keyboard-focused Cmd+K Command Palette.</p>
              </SpotlightCard>
            </div>
          </div>
        )}
      </main>
      <Footer health={health} />

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="modal-overlay centered" onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setShowAuthModal(false); }}>
          <div style={{ animation: 'modalSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)', width: '100%', maxWidth: '420px' }}>
            <AuthModal 
              onAuthSuccess={handleAuthSuccess}
              initialMode={authMode}
            />
          </div>
        </div>
      )}

      <CommandPalette 
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        user={user}
        onLogout={handleLogout}
        onTriggerUpload={triggerUploadInput}
        files={files}
        health={health}
        onOpenAuth={(mode) => { setAuthMode(mode); setShowAuthModal(true); }}
      />

      {globalDragActive && (
        <div className="global-drag-overlay">
          <div className="global-drag-box">
            <UploadCloud size={48} style={{ color: 'var(--accent-orange)' }} />
            <h2 className="global-drag-title">Drop anywhere to secure</h2>
            <p className="global-drag-subtitle">Stream file directly to private AWS S3 vault</p>
          </div>
        </div>
      )}
    </div>
  );
}
