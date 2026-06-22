import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { deleteAccountAndData } from '@/lib/auth';

export default function DeleteAccountModal({ currentUser, onClose, onDeleted }) {
  const [visible, setVisible] = useState(false);
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
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

  const handleDelete = async () => {
    if (confirm !== currentUser) {
      setError('Type your username exactly to confirm');
      return;
    }
    setLoading(true);
    try {
      await deleteAccountAndData(currentUser);
      const sessions = JSON.parse(localStorage.getItem('artsource-sessions') || '{}');
      for (const [token, user] of Object.entries(sessions)) {
        if (user === currentUser) delete sessions[token];
      }
      localStorage.setItem('artsource-sessions', JSON.stringify(sessions));
      localStorage.removeItem('artsource-token');
      onDeleted();
    } catch (err) {
      setError(err.message);
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
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-1">Danger</p>
              <h2 className="font-display text-3xl uppercase tracking-wide" style={{ color: '#f87171' }}>Delete Account</h2>
            </div>
            <button onClick={handleClose} className="p-2 rounded-lg transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
            This will permanently delete your account and all saved data. Type <strong style={{ color: 'rgba(255,255,255,0.6)' }}>{currentUser}</strong> to confirm.
          </p>

          <input
            type="text"
            value={confirm}
            onChange={e => { setConfirm(e.target.value); setError(''); }}
            placeholder={`Type "${currentUser}" to confirm`}
            className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-all duration-200 mb-3"
            onFocus={e => e.target.style.borderColor = confirm === currentUser ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.2)'}
            onBlur={e => e.target.style.borderColor = ''}
          />

          {error && (
            <div className="text-xs text-red-400 text-center py-2 px-3 rounded-lg mb-3" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)' }}>{error}</div>
          )}

          <button
            onClick={handleDelete}
            disabled={confirm !== currentUser || loading}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-30"
            style={{
              background: confirm === currentUser && !loading ? '#dc2626' : 'rgba(255,255,255,0.06)',
              color: confirm === currentUser && !loading ? '#fff' : 'rgba(255,255,255,0.3)',
            }}
            onMouseEnter={e => { if (confirm === currentUser && !loading) e.currentTarget.style.background = '#ef4444'; }}
            onMouseLeave={e => { if (confirm === currentUser && !loading) e.currentTarget.style.background = '#dc2626'; }}
          >
            {loading ? 'Deleting...' : 'Delete Forever'}
          </button>

          <p className="text-center text-xs text-muted-foreground/40 mt-5">Click outside to dismiss</p>
        </div>
      </div>
    </div>
  );
}
