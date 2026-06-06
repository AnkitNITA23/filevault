import React from 'react';
import { Keyboard, LogOut } from 'lucide-react';
import api from '../utils/api';
import Logo from './Logo';

export default function Header({ user, onLogout, onOpenCmd, health }) {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <header className="header">
      <div className="header-inner">
        <a href="/" className="brand" onClick={(e) => { e.preventDefault(); window.location.hash = ''; }} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Logo size={28} />
          <span>FileVault</span>
        </a>

        <div className="nav-actions">
          {/* Health connection badge */}
          {health && (
            <div className={`badge ${health.mode === 'aws-postgres' ? 'badge-green' : 'badge-orange'}`}>
              <div className="badge-dot" />
              <span>{health.mode === 'aws-postgres' ? 'AWS + Postgres' : 'Local Fallback'}</span>
            </div>
          )}

          {user ? (
            <>
              {/* Shortcut hint button */}
              <button 
                className="btn btn-secondary keyboard-hint" 
                onClick={onOpenCmd}
                style={{ padding: '6px 12px' }}
                title="Open Command Palette"
              >
                <Keyboard size={14} />
                <span>Menu</span>
                <span className="kbd">{isMac ? '⌘K' : 'Ctrl+K'}</span>
              </button>

              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {user.username}
              </span>
              
              <button 
                className="btn btn-secondary" 
                onClick={onLogout}
                style={{ padding: '6px' }}
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <span className="keyboard-hint">
              <span>Press</span>
              <span className="kbd">{isMac ? '⌘K' : 'Ctrl+K'}</span>
              <span>to begin</span>
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
