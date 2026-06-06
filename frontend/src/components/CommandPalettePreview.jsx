import React, { useState, useEffect } from 'react';
import { Search, Key, Shield, Zap, Check, Eye } from 'lucide-react';

/**
 * An auto-playing simulated Command Palette panel.
 * Cycles through typing text, selecting items, and triggering actions to showcase the Raycast keyboard UX.
 */
export default function CommandPalettePreview() {
  const [searchText, setSearchText] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [step, setStep] = useState(0); // 0: Idle, 1: Typing, 2: Select Row, 3: Action Trigger, 4: Success Flash
  const [simulatedPassword, setSimulatedPassword] = useState('');

  useEffect(() => {
    let timer;

    // Loop steps timeline
    const runSimulation = async () => {
      // Step 0: Idle
      setStep(0);
      setSearchText('');
      setActiveIndex(0);
      setSimulatedPassword('');
      await delay(1500);

      // Step 1: Typing "lock"
      setStep(1);
      const textToType = 'lock';
      for (let i = 0; i <= textToType.length; i++) {
        setSearchText(textToType.substring(0, i));
        await delay(200);
      }
      await delay(600);

      // Step 2: Highlight "Lock link with Password" (index 0 after filter)
      setStep(2);
      setActiveIndex(0);
      await delay(1000);

      // Step 3: Trigger active execution / open parameter
      setStep(3);
      await delay(600);

      // Simulate typing password "vault101"
      const passToType = 'vault101';
      for (let i = 0; i <= passToType.length; i++) {
        setSimulatedPassword(passToType.substring(0, i));
        await delay(120);
      }
      await delay(800);

      // Step 4: Success animation
      setStep(4);
      await delay(2000);

      // Loop back to start
      runSimulation();
    };

    runSimulation();

    return () => clearTimeout(timer);
  }, []);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Simulated commands database
  const allCommands = [
    { id: 'vault', title: 'Stream to AWS Vault', subtitle: 'Store files in S3', icon: <Shield size={16} /> },
    { id: 'lock', title: 'Lock link with Password', subtitle: 'Add decryption validation', icon: <Key size={16} /> },
    { id: 'destruct', title: 'Enable Self-Destruct', subtitle: 'Erase on first download', icon: <Zap size={16} /> },
    { id: 'stats', title: 'View Analytics Dashboard', subtitle: 'Track file downloads', icon: <Eye size={16} /> },
  ];

  // Filter commands if typing
  const filtered = searchText 
    ? allCommands.filter(c => c.title.toLowerCase().includes(searchText.toLowerCase()))
    : allCommands;

  return (
    <div className="cmd-preview-container slide-fade-in" style={{ animationDelay: '0.1s' }}>
      <div className="cmd-palette-mock glass-panel">
        {/* Mock window controls */}
        <div className="cmd-mock-header">
          <div className="cmd-mock-dots">
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
          </div>
          <span className="cmd-mock-title">Interactive Terminal</span>
        </div>

        {/* Input box */}
        <div className="cmd-input-container" style={{ padding: '12px 16px' }}>
          <Search size={16} className="cmd-search-icon" style={{ opacity: 0.6 }} />
          <div className="cmd-mock-input-wrap">
            <span className="cmd-mock-input-text">
              {searchText || <span className="cmd-mock-placeholder">Search commands...</span>}
            </span>
            {step < 3 && <span className="cmd-mock-cursor" />}
          </div>
        </div>

        {/* List of items */}
        <div className="cmd-list" style={{ padding: '6px', minHeight: '200px' }}>
          {step < 3 ? (
            <>
              <div className="cmd-section-title" style={{ fontSize: '0.65rem', padding: '4px 8px' }}>Suggestions</div>
              {filtered.map((cmd, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <div key={cmd.id} className={`cmd-item ${isActive ? 'active' : ''}`} style={{ padding: '8px' }}>
                    <div className="cmd-item-left" style={{ gap: '10px' }}>
                      <span style={{ color: isActive ? 'var(--accent-orange)' : 'var(--text-secondary)', display: 'flex' }}>
                        {cmd.icon}
                      </span>
                      <div>
                        <span className="cmd-item-title" style={{ fontSize: '0.8rem' }}>{cmd.title}</span>
                        <span className="cmd-item-subtitle" style={{ fontSize: '0.7rem', display: 'block', margin: 0 }}>
                          {cmd.subtitle}
                        </span>
                      </div>
                    </div>
                    {isActive && (
                      <span className="cmd-footer-key" style={{ fontSize: '0.6rem', padding: '1px 4px' }}>
                        ↵ Enter
                      </span>
                    )}
                  </div>
                );
              })}
            </>
          ) : step === 3 ? (
            // Simulation parameter dialog
            <div className="cmd-mock-dialog slide-fade-in" style={{ padding: '16px 8px' }}>
              <span className="setting-label" style={{ fontSize: '0.65rem', marginBottom: '8px', display: 'block' }}>
                Set Password Protection
              </span>
              <div className="form-group" style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  value={simulatedPassword}
                  readOnly
                  style={{ fontSize: '0.8rem', background: '#09090b', borderColor: 'var(--accent-orange)' }}
                />
                <span className="cmd-mock-cursor" style={{ top: '11px', left: `${14 + simulatedPassword.length * 6.8}px` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <span className="cmd-footer-key" style={{ fontSize: '0.65rem', padding: '3px 8px' }}>
                  ↵ Save Settings
                </span>
              </div>
            </div>
          ) : (
            // Success checklist confirmation animation
            <div className="cmd-mock-success slide-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '180px', gap: '12px' }}>
              <div 
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  border: '2px solid #10b981', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#10b981',
                  animation: 'scaleUpConfirm 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                <Check size={20} strokeWidth={3} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981' }}>
                Lock Password Applied!
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                File encrypted vault mapping updated
              </span>
            </div>
          )}
        </div>

        {/* Palette footer */}
        <div className="cmd-footer" style={{ padding: '8px 16px', fontSize: '0.7rem' }}>
          <span style={{ opacity: 0.6 }}>Interactive Feature Guide</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="cmd-footer-key" style={{ fontSize: '0.6rem' }}>tab</span>
            <span className="cmd-footer-key" style={{ fontSize: '0.6rem' }}>esc</span>
          </div>
        </div>
      </div>
    </div>
  );
}
