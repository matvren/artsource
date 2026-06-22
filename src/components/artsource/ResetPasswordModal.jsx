import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { resetPassword } from '@/lib/auth';

export default function ResetPasswordModal({ currentUser, onClose }) {
  const [visible, setVisible] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (newPass.length < 8) throw new Error('Password must be at least 8 characters');
      if (!/[A-Z]/.test(newPass)) throw new Error('Password needs an uppercase letter');
      if (newPass !== confirmPass) throw new Error('Passwords do not match');
      resetPassword(currentUser, oldPass, newPass);
      setSuccess(true);
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
        className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl"
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.04) 0%, transparent 70%)' }} />

        <div className="relative p-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-1">Security</p>
              <h2 className="font-display text-3xl uppercase tracking-wide text-foreground">Reset Password</h2>
            </div>
            <button onClick={handleClose} className="p-2 rounded-lg transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.1)' }}>
                <svg className="w-5 h-5" style={{ color: '#4ade80' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p className="text-sm text-foreground/70">Password updated successfully</p>
              <button onClick={handleClose} className="mt-5 px-6 py-2.5 rounded-xl text-xs font-semibold transition-all" style={{ background: 'hsl(var(--foreground))', color: 'hsl(var(--background))' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>Done</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Current Password</label>
                <input type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-all duration-200" onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'} onBlur={e => e.target.style.borderColor = ''} placeholder="Current password" autoComplete="current-password" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">New Password</label>
                <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-all duration-200" onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'} onBlur={e => e.target.style.borderColor = ''} placeholder="New password" autoComplete="new-password" />
                <p className="text-[11px] text-muted-foreground/60 mt-1.5">Min 8 chars, one uppercase letter</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Confirm New Password</label>
                <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-all duration-200" onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'} onBlur={e => e.target.style.borderColor = ''} placeholder="Confirm new password" autoComplete="new-password" />
              </div>

              {error && (
                <div className="text-xs text-red-400 text-center py-2 px-3 rounded-lg" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)' }}>{error}</div>
              )}

              <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 mt-1" style={{ background: 'hsl(var(--foreground))', color: 'hsl(var(--background))', transform: loading ? 'scale(0.98)' : 'scale(1)' }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-background/30 border-t-background animate-spin" />
                    Updating...
                  </span>
                ) : 'Update Password'}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-muted-foreground/40 mt-5">
            Click outside to dismiss
          </p>
        </div>
      </div>
    </div>
  );
}
