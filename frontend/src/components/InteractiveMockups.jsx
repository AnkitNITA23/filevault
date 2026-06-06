import React from 'react';

/**
 * Animated SVG illustration representing private S3 Storage buckets.
 * Features data packets flowing along lines into a secure vault.
 */
export function VaultMockup() {
  return (
    <div className="card-mockup-wrapper">
      <svg width="100%" height="80" viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Connection lines */}
        <path d="M20 40H80" stroke="rgba(255, 94, 58, 0.2)" strokeWidth="1.5" strokeDasharray="4 4" />
        <path d="M120 40H180" stroke="rgba(255, 94, 58, 0.2)" strokeWidth="1.5" strokeDasharray="4 4" />
        
        {/* Flowing packets */}
        <circle cx="20" cy="40" r="3" fill="var(--accent-orange)">
          <animate attributeName="cx" values="20;80" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="20" cy="40" r="3" fill="var(--accent-pink)">
          <animate attributeName="cx" values="20;80" dur="2s" begin="0.7s" repeatCount="indefinite" />
        </circle>
        
        {/* Secure bucket container */}
        <rect x="80" y="20" width="40" height="40" rx="6" fill="#121214" stroke="url(#mockVaultGrad)" strokeWidth="1.5" />
        {/* Server lines inside vault */}
        <line x1="88" y1="30" x2="112" y2="30" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="2" strokeLinecap="round" />
        <line x1="88" y1="40" x2="112" y2="40" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="2" strokeLinecap="round" />
        <line x1="88" y1="50" x2="104" y2="50" stroke="var(--accent-orange)" strokeWidth="2" strokeLinecap="round" />
        
        {/* Floating shields */}
        <circle cx="100" cy="40" r="15" stroke="var(--accent-orange)" strokeWidth="1" strokeDasharray="3 3" opacity="0.3">
          <animate attributeName="r" values="12;22" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0" dur="3s" repeatCount="indefinite" />
        </circle>
        
        <defs>
          <linearGradient id="mockVaultGrad" x1="80" y1="20" x2="120" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff5e3a" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/**
 * Animated SVG countdown timer dissolving on complete download.
 */
export function SelfDestructMockup() {
  return (
    <div className="card-mockup-wrapper">
      <svg width="100%" height="80" viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Dial base */}
        <circle cx="100" cy="40" r="24" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="4" />
        
        {/* Countdown dial sweep */}
        <circle 
          cx="100" 
          cy="40" 
          r="24" 
          stroke="url(#selfDestGrad)" 
          strokeWidth="3" 
          strokeDasharray="150" 
          strokeDashoffset="0"
          strokeLinecap="round"
        >
          <animate 
            attributeName="strokeDashoffset" 
            values="0;150;0" 
            dur="6s" 
            repeatCount="indefinite" 
            keyTimes="0;0.7;1"
            keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
          />
        </circle>
        
        {/* Dissolving particles */}
        <g opacity="0">
          <animate 
            attributeName="opacity" 
            values="0;1;0;0" 
            dur="6s" 
            repeatCount="indefinite"
            keyTimes="0;0.65;0.75;1"
          />
          {/* Small spark nodes */}
          <circle cx="100" cy="16" r="1.5" fill="#f43f5e" />
          <circle cx="124" cy="40" r="1" fill="#ff5e3a" />
          <circle cx="85" cy="55" r="1.5" fill="#ff5e3a" />
          <circle cx="110" cy="62" r="1.2" fill="#f43f5e" />
        </g>
        
        {/* Inner lock/clock center node */}
        <circle cx="100" cy="40" r="14" fill="#121214" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
        {/* Exclamation point */}
        <rect x="99" y="32" width="2" height="8" rx="1" fill="var(--accent-orange)" />
        <circle cx="100" cy="44" r="1.2" fill="var(--accent-orange)" />

        <defs>
          <linearGradient id="selfDestGrad" x1="76" y1="16" x2="124" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff5e3a" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/**
 * Lock cylinder rotating and opening secure link vaults.
 */
export function PasswordLockMockup() {
  return (
    <div className="card-mockup-wrapper">
      <svg width="100%" height="80" viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Animated Padlock */}
        <g>
          {/* Shackle */}
          <path 
            d="M90 38V31C90 25.4772 94.4772 21 100 21C105.523 21 110 25.4772 110 31V38" 
            stroke="url(#mockLockGrad)" 
            strokeWidth="3.5" 
            strokeLinecap="round"
          >
            <animateTransform 
              attributeName="transform" 
              type="translate" 
              values="0,0; 0,-6; 0,0" 
              dur="4s" 
              repeatCount="indefinite" 
              keyTimes="0;0.5;1"
            />
          </path>
          
          {/* Padlock body */}
          <rect x="82" y="36" width="36" height="26" rx="4" fill="#121214" stroke="url(#mockLockGrad)" strokeWidth="2" />
          
          {/* Decrypting beam */}
          <line x1="60" y1="48" x2="140" y2="48" stroke="var(--accent-orange)" strokeWidth="1" opacity="0.3" />
          <circle cx="100" cy="48" r="4" fill="var(--accent-orange)">
            <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
          </circle>
        </g>

        <defs>
          <linearGradient id="mockLockGrad" x1="82" y1="21" x2="118" y2="62" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff5e3a" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/**
 * Real-time hit statistics bar chart simulating analytics dashboard updates.
 */
export function AnalyticsMockup() {
  return (
    <div className="card-mockup-wrapper">
      <svg width="100%" height="80" viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Grid lines */}
        <line x1="30" y1="20" x2="170" y2="20" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />
        <line x1="30" y1="40" x2="170" y2="40" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />
        <line x1="30" y1="60" x2="170" y2="60" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
        
        {/* Dynamic bar charts */}
        <g fill="url(#mockBarGrad)">
          {/* Bar 1 */}
          <rect x="45" y="45" width="12" height="15" rx="2">
            <animate attributeName="height" values="15;35;15" dur="4s" repeatCount="indefinite" />
            <animate attributeName="y" values="45;25;45" dur="4s" repeatCount="indefinite" />
          </rect>
          
          {/* Bar 2 */}
          <rect x="70" y="30" width="12" height="30" rx="2">
            <animate attributeName="height" values="30;12;30" dur="4s" begin="0.8s" repeatCount="indefinite" />
            <animate attributeName="y" values="30;48;30" dur="4s" begin="0.8s" repeatCount="indefinite" />
          </rect>
          
          {/* Bar 3 */}
          <rect x="95" y="25" width="12" height="35" rx="2">
            <animate attributeName="height" values="35;45;35" dur="4s" begin="1.4s" repeatCount="indefinite" />
            <animate attributeName="y" values="25;15;25" dur="4s" begin="1.4s" repeatCount="indefinite" />
          </rect>
          
          {/* Bar 4 */}
          <rect x="120" y="50" width="12" height="10" rx="2">
            <animate attributeName="height" values="10;25;10" dur="4s" begin="0.3s" repeatCount="indefinite" />
            <animate attributeName="y" values="50;35;50" dur="4s" begin="0.3s" repeatCount="indefinite" />
          </rect>
          
          {/* Bar 5 */}
          <rect x="145" y="35" width="12" height="25" rx="2">
            <animate attributeName="height" values="25;40;25" dur="4s" begin="1.9s" repeatCount="indefinite" />
            <animate attributeName="y" values="35;20;35" dur="4s" begin="1.9s" repeatCount="indefinite" />
          </rect>
        </g>

        <defs>
          <linearGradient id="mockBarGrad" x1="30" y1="20" x2="170" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff5e3a" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/**
 * Radar scan line sweeping over nodes inside scheduler card.
 */
export function RadarSweepMockup() {
  return (
    <div className="card-mockup-wrapper">
      <svg width="100%" height="80" viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Sweep scanner beam */}
        <line x1="30" y1="40" x2="170" y2="40" stroke="url(#radarBeamGrad)" strokeWidth="2">
          <animate attributeName="y1" values="10;70;10" dur="3s" repeatCount="indefinite" />
          <animate attributeName="y2" values="10;70;10" dur="3s" repeatCount="indefinite" />
        </line>
        
        {/* Nodes that flash on scan intersection */}
        <circle cx="50" cy="25" r="4" fill="var(--accent-orange)">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="3s" repeatCount="indefinite" keyTimes="0;0.25;1" />
          <animate attributeName="r" values="3;5;3" dur="3s" repeatCount="indefinite" keyTimes="0;0.25;1" />
        </circle>
        
        <circle cx="140" cy="55" r="4" fill="var(--accent-pink)">
          <animate attributeName="opacity" values="0.2;1;0.2" dur="3s" repeatCount="indefinite" keyTimes="0;0.75;1" />
          <animate attributeName="r" values="3;5;3" dur="3s" repeatCount="indefinite" keyTimes="0;0.75;1" />
        </circle>

        <circle cx="95" cy="45" r="3" fill="#ffffff">
          <animate attributeName="opacity" values="0.1;0.8;0.1" dur="3s" repeatCount="indefinite" keyTimes="0;0.58;1" />
        </circle>

        <defs>
          <linearGradient id="radarBeamGrad" x1="30" y1="40" x2="170" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="rgba(255, 94, 58, 0.8)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

/**
 * Floating keyboard center with highlighted shortcut keys.
 */
export function CommandCenterMockup() {
  return (
    <div className="card-mockup-wrapper">
      <svg width="100%" height="80" viewBox="0 0 200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Virtual Keyboard outline */}
        <rect x="35" y="15" width="130" height="50" rx="6" fill="#121214" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
        
        {/* Mock keys row 1 */}
        <g fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5">
          <rect x="42" y="22" width="10" height="10" rx="1.5" />
          <rect x="55" y="22" width="10" height="10" rx="1.5" />
          <rect x="68" y="22" width="10" height="10" rx="1.5" />
          <rect x="81" y="22" width="10" height="10" rx="1.5" />
          {/* Highlight Key K */}
          <rect x="94" y="22" width="10" height="10" rx="1.5" fill="rgba(255, 94, 58, 0.15)" stroke="var(--accent-orange)" strokeWidth="1">
            <animate attributeName="fill" values="rgba(255, 94, 58, 0.15); rgba(255, 94, 58, 0.45); rgba(255, 94, 58, 0.15)" dur="3s" repeatCount="indefinite" />
          </rect>
          <rect x="107" y="22" width="10" height="10" rx="1.5" />
          <rect x="120" y="22" width="10" height="10" rx="1.5" />
          <rect x="133" y="22" width="25" height="10" rx="1.5" />
        </g>
        
        {/* Mock keys row 2 */}
        <g fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5">
          {/* Highlight Key Ctrl/Cmd */}
          <rect x="42" y="37" width="18" height="10" rx="1.5" fill="rgba(255, 94, 58, 0.15)" stroke="var(--accent-orange)" strokeWidth="1">
            <animate attributeName="fill" values="rgba(255, 94, 58, 0.15); rgba(255, 94, 58, 0.45); rgba(255, 94, 58, 0.15)" dur="3s" repeatCount="indefinite" />
          </rect>
          <rect x="63" y="37" width="10" height="10" rx="1.5" />
          <rect x="76" y="37" width="48" height="10" rx="1.5" />
          <rect x="127" y="37" width="10" height="10" rx="1.5" />
          <rect x="140" y="37" width="18" height="10" rx="1.5" />
        </g>
        
        {/* Pulse rays out from K key */}
        <circle cx="99" cy="27" r="1" stroke="var(--accent-orange)" strokeWidth="1.5" opacity="0">
          <animate attributeName="r" values="4;35" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}
