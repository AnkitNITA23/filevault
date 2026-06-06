import React, { useState } from 'react';
import { ShieldAlert, Key, Loader } from 'lucide-react';
import api from '../utils/api';
import SpotlightCard from './SpotlightCard';
import Logo from './Logo';

export default function AuthModal({ onAuthSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      let data;
      if (mode === 'login') {
        data = await api.login(username, password);
      } else {
        data = await api.register(username, password);
      }
      
      onAuthSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SpotlightCard className="auth-panel slide-fade-in">
      <div className="auth-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Logo size={44} style={{ marginBottom: '12px' }} />
        <h2 className="auth-title" style={{ marginTop: '0px' }}>Welcome to FileVault</h2>
        <p className="auth-subtitle">Secure temporary file drop & sharing</p>
      </div>

      <div className="auth-tabs">
        <button 
          className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
          onClick={() => { setMode('login'); setError(''); }}
          type="button"
        >
          Sign In
        </button>
        <button 
          className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
          onClick={() => { setMode('register'); setError(''); }}
          type="button"
        >
          Create Account
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {error && (
          <div className="form-error">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <ShieldAlert size={14} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="username">Username</label>
          <input 
            type="text" 
            id="username"
            className="form-input" 
            placeholder="enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            required
            autoComplete="username"
          />
        </div>

        <div className="form-group" style={{ marginBottom: '8px' }}>
          <label className="form-label" htmlFor="password">Password</label>
          <input 
            type="password" 
            id="password"
            className="form-input" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            autoComplete="current-password"
          />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', gap: '10px' }}>
          {loading ? (
            <>
              <Loader size={16} className="spin-icon" style={{ animation: 'spin 2s linear infinite' }} />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <Key size={16} />
              <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
            </>
          )}
        </button>
      </form>
    </SpotlightCard>
  );
}
