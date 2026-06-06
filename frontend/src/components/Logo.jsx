import React from 'react';

/**
 * Premium custom vector SVG logo representing FileVault.
 * Utilizes the brand's core orange-to-pink linear gradient.
 */
export default function Logo({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="vaultLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff5e3a" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
      </defs>
      
      {/* Subtle outer bounding box with thin neon border */}
      <rect 
        x="1.5" 
        y="1.5" 
        width="29" 
        height="29" 
        rx="8" 
        fill="rgba(255, 94, 58, 0.05)" 
        stroke="url(#vaultLogoGrad)" 
        strokeWidth="1.5" 
        style={{ backdropFilter: 'blur(4px)' }}
      />
      
      {/* Padlock loop (arch) */}
      <path 
        d="M11 14V10.5C11 7.46243 13.2386 5 16 5V5C18.7614 5 21 7.46243 21 10.5V14" 
        stroke="url(#vaultLogoGrad)" 
        strokeWidth="2" 
        strokeLinecap="round" 
      />
      
      {/* Padlock solid body */}
      <rect 
        x="8.5" 
        y="13.5" 
        width="15" 
        height="11.5" 
        rx="2" 
        fill="url(#vaultLogoGrad)" 
      />
      
      {/* Keyhole vector overlay */}
      <circle cx="16" cy="18" r="1.5" fill="#ffffff" />
      <path d="M16 19.5L17 22H15L16 19.5Z" fill="#ffffff" />
    </svg>
  );
}

export function LogoIconOnly({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
