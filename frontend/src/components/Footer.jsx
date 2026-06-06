import React from 'react';
import Logo from './Logo';

/**
 * Premium developer-centric multi-column footer for FileVault.
 * Houses custom inline SVG vectors for social media and pulsing connection status badges.
 */
export default function Footer({ health }) {
  const isPostgres = health?.mode === 'aws-postgres';
  
  return (
    <footer className="footer slide-fade-in" style={{ animationDelay: '0.3s' }}>
      <div className="footer-inner">
        <div className="footer-grid-cols">
          {/* Brand Info Column */}
          <div className="footer-col brand-col">
            <a href="/" className="brand" onClick={(e) => { e.preventDefault(); window.location.hash = ''; }} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>
              <Logo size={24} />
              <span>FileVault</span>
            </a>
            <p className="footer-desc" style={{ marginTop: '12px', fontSize: '0.8rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
              Developer-first, temporary secure file sharing. Stream binaries directly into isolated cloud vaults with zero permanent footprint.
            </p>
          </div>

          {/* Product Links Column */}
          <div className="footer-col">
            <span className="footer-section-title">Product</span>
            <ul className="footer-links">
              <li><a href="#vaults">AWS S3 Vaults</a></li>
              <li><a href="#purge">Auto-Purge Cron</a></li>
              <li><a href="#self-destruct">Self-Destruct</a></li>
              <li><a href="#locks">Password Locks</a></li>
              <li><a href="#analytics">Share Stats</a></li>
            </ul>
          </div>

          {/* Developer Links Column */}
          <div className="footer-col">
            <span className="footer-section-title">Developer</span>
            <ul className="footer-links">
              <li><a href="#api">REST API Reference</a></li>
              <li><a href="#schema">Database Schema</a></li>
              <li><a href="#lambda">AWS Lambda sweep</a></li>
              <li><a href="#github">GitHub Integration</a></li>
            </ul>
          </div>

          {/* Company / Compliance Column */}
          <div className="footer-col">
            <span className="footer-section-title">Open Source</span>
            <ul className="footer-links">
              <li><a href="#license">MIT License</a></li>
              <li><a href="#security">Security Audit</a></li>
              <li><a href="#privacy">Privacy Guard</a></li>
              <li><a href="#terms">Usage Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & status row */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <span className="footer-copyright">
              &copy; {new Date().getFullYear()} FileVault. Code licensed MIT.
            </span>
            <div className="status-indicator-badge">
              <span className="status-ping-dot" />
              <span className="status-text">
                {isPostgres ? 'Production AWS Storage Live' : 'All systems operational'}
              </span>
            </div>
          </div>

          {/* Social Vector Links */}
          <div className="footer-social-links">
            {/* GitHub */}
            <a href="https://github.com/AnkitNITA23" target="_blank" rel="noreferrer" title="GitHub Repository">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </a>
            {/* Twitter/X */}
            <a href="https://x.com/imAnkitkm" target="_blank" rel="noreferrer" title="Follow on X">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </a>
            {/* Discord */}
            <a href="https://discord.com" target="_blank" rel="noreferrer" title="Join Discord Server">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="12" r="1" />
                <circle cx="15" cy="12" r="1" />
                <path d="M7.5 11.5c.3-1.3 1.5-2.5 3-2.5h3c1.5 0 2.7 1.2 3 2.5l.5 4c.1.8-.4 1.5-1.2 1.5H8.2c-.8 0-1.3-.7-1.2-1.5l.5-4z" />
                <path d="M9 7.5L8 5m6 2.5l1-2.5" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
