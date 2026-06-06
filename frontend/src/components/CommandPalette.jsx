import React, { useState, useEffect, useRef } from 'react';
import { Search, FileUp, FolderHeart, Info, LogOut, Key, UserPlus } from 'lucide-react';

export default function CommandPalette({ 
  isOpen, 
  onClose, 
  user, 
  onLogout, 
  onTriggerUpload, 
  files = [], 
  health,
  onOpenAuth 
}) {
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle outside click
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  // Compile items list
  const getCommands = () => {
    const cmds = [];

    if (user) {
      cmds.push({
        id: 'upload',
        title: 'Upload File',
        subtitle: 'Select and drop a new temporary file',
        icon: <FileUp className="cmd-item-icon" />,
        action: () => { onTriggerUpload(); onClose(); }
      });
      cmds.push({
        id: 'dashboard',
        title: 'View History & Dashboard',
        subtitle: 'See active and expired uploads',
        icon: <FolderHeart className="cmd-item-icon" />,
        action: () => { window.location.hash = ''; onClose(); }
      });
      cmds.push({
        id: 'logout',
        title: 'Log Out',
        subtitle: `Sign out of ${user.username}`,
        icon: <LogOut className="cmd-item-icon" />,
        action: () => { onLogout(); onClose(); }
      });
    } else {
      cmds.push({
        id: 'login',
        title: 'Log In',
        subtitle: 'Sign in to your account',
        icon: <Key className="cmd-item-icon" />,
        action: () => { onOpenAuth('login'); onClose(); }
      });
      cmds.push({
        id: 'signup',
        title: 'Create Account',
        subtitle: 'Sign up for FileVault',
        icon: <UserPlus className="cmd-item-icon" />,
        action: () => { onOpenAuth('register'); onClose(); }
      });
    }

    // Add files to the searchable palette if there are any
    if (user && files.length > 0) {
      files.forEach(file => {
        cmds.push({
          id: `file-${file.id}`,
          title: `Copy Link: ${file.filename}`,
          subtitle: `Size: ${(file.file_size / (1024 * 1024)).toFixed(2)} MB | Expiry: ${new Date(file.expires_at).toLocaleTimeString()}`,
          icon: <FolderHeart className="cmd-item-icon" style={{ color: 'var(--accent-orange)' }} />,
          action: () => {
            const shareUrl = `${window.location.origin}/#share/${file.share_token}`;
            navigator.clipboard.writeText(shareUrl);
            alert(`Copied link for ${file.filename} to clipboard!`);
            onClose();
          }
        });
      });
    }

    // Filter items based on search query
    return cmds.filter(cmd => 
      cmd.title.toLowerCase().includes(search.toLowerCase()) || 
      (cmd.subtitle && cmd.subtitle.toLowerCase().includes(search.toLowerCase()))
    );
  };

  const filteredCommands = getCommands();

  // Keyboard navigation inside palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[activeIndex]) {
          filteredCommands[activeIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, activeIndex]);

  // Update active index when hover moves
  const handleItemHover = (index) => {
    setActiveIndex(index);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="cmd-palette">
        <div className="cmd-input-container">
          <Search size={18} className="cmd-search-icon" />
          <input 
            type="text" 
            className="cmd-input" 
            placeholder="Search commands or files..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setActiveIndex(0); }}
            ref={inputRef}
          />
        </div>

        <div className="cmd-list">
          {filteredCommands.length > 0 ? (
            <>
              <div className="cmd-section-title">Actions</div>
              {filteredCommands.map((cmd, idx) => (
                <div 
                  key={cmd.id}
                  className={`cmd-item ${idx === activeIndex ? 'active' : ''}`}
                  onClick={cmd.action}
                  onMouseEnter={() => handleItemHover(idx)}
                >
                  <div className="cmd-item-left">
                    {cmd.icon}
                    <div>
                      <span className="cmd-item-title">{cmd.title}</span>
                      {cmd.subtitle && <span className="cmd-item-subtitle">{cmd.subtitle}</span>}
                    </div>
                  </div>
                  <div className="cmd-item-shortcut">
                    {idx === activeIndex && (
                      <span className="cmd-footer-key" style={{ color: 'var(--text-secondary)' }}>
                        ↵ Enter
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="empty-state" style={{ padding: '32px 16px' }}>
              No commands or files matching "{search}"
            </div>
          )}
        </div>

        <div className="cmd-footer">
          <div className="cmd-footer-nav">
            <span>Use <span className="cmd-footer-key">↓↑</span> to navigate</span>
            <span><span className="cmd-footer-key">↵</span> to select</span>
            <span><span className="cmd-footer-key">esc</span> to dismiss</span>
          </div>
          <div>
            <span>FileVault Command Center</span>
          </div>
        </div>
      </div>
    </div>
  );
}
