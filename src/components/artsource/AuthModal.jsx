import { useState, useEffect } from 'react';
import { login, signup } from '@/lib/auth';

const REMEMBER_KEY = 'artsource-remembered';

function loadRemembered(username) {
  try {
    const data = JSON.parse(localStorage.getItem(REMEMBER_KEY) || '{}');
    return data[username] || '';
  } catch { return ''; }
}

function saveRemembered(username, password, remember) {
  const data = JSON.parse(localStorage.getItem(REMEMBER_KEY) || '{}');
  if (remember) data[username] = password;
  else delete data[username];
  localStorage.setItem(REMEMBER_KEY, JSON.stringify(data));
}

export default function AuthModal({ onClose, onLogin }) {
  const [tab, setTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (tab === 'login' && username) {
      const saved = loadRemembered(username);
      if (saved) setPassword(saved);
    }
  }, [tab, username]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fn = tab === 'login' ? login : signup;
      const { user } = await fn(username.trim(), password.trim());
      if (tab === 'login') saveRemembered(username.trim(), password.trim(), remember);
      onLogin(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      style={{
        transition: 'background 0.3s ease, backdrop-filter 0.3s ease',
        background: visible ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(16px)' : 'blur(0px)',
      }}
    >
      <div
        style={{
          transition: 'opacity 0.3s cubic-bezier(0.16,1,0.3,1), transform 0.3s cubic-bezier(0.16,1,0.3,1)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.95)',
        }}
        className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Animated gradient accent top bar */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
          }}
        />

        {/* Subtle inner glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.04) 0%, transparent 70%)',
          }}
        />

        <div className="relative p-7">
          {/* Header */}
          <div className="mb-6 text-center">
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-1">ArtSource</p>
            <h2 className="font-display text-3xl uppercase tracking-wide text-foreground">
              {tab === 'login' ? 'Welcome Back' : 'Join Us'}
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-muted rounded-xl p-1 mb-6">
            {['login', 'signup'].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: tab === t ? 'hsl(var(--card))' : 'transparent',
                  color: tab === t ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                  boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
                  transform: tab === t ? 'scale(1)' : 'scale(0.97)',
                }}
              >
                {t === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-all duration-200"
                style={{ '--tw-ring-shadow': 'none' }}
                onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                onBlur={e => e.target.style.borderColor = ''}
                placeholder="Enter username"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-all duration-200"
                onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                onBlur={e => e.target.style.borderColor = ''}
                placeholder="Enter password"
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              />
              {tab === 'signup' && (
                <p className="text-[11px] text-muted-foreground/60 mt-1.5">Min 8 chars, one uppercase letter</p>
              )}
            </div>

            {tab === 'login' && (
              <label className="flex items-center gap-2 cursor-pointer" style={{ paddingTop: '2px' }}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border cursor-pointer"
                  style={{
                    accentColor: '#f5f5f5',
                    borderColor: 'rgba(255,255,255,0.2)',
                    background: 'transparent',
                  }}
                />
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Remember password</span>
              </label>
            )}

            {error && (
              <div
                className="text-xs text-red-400 text-center py-2 px-3 rounded-lg"
                style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)' }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 mt-1"
              style={{
                background: 'hsl(var(--foreground))',
                color: 'hsl(var(--background))',
                transform: loading ? 'scale(0.98)' : 'scale(1)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-background/30 border-t-background animate-spin" />
                  {tab === 'login' ? 'Signing in…' : 'Creating…'}
                </span>
              ) : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground/40 mt-5">
            Click outside to dismiss
          </p>
        </div>
      </div>
    </div>
  );
}