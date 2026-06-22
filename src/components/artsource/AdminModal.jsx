import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { getAccounts } from '@/lib/auth';

export default function AdminModal({ onClose }) {
  const [visible, setVisible] = useState(false);
  const [accounts, setAccounts] = useState(getAccounts());

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

  const handleDeleteUser = (username) => {
    const updated = { ...accounts };
    delete updated[username];
    setAccounts(updated);
    localStorage.setItem('artsource-accounts', JSON.stringify(updated));
    const sessions = JSON.parse(localStorage.getItem('artsource-sessions') || '{}');
    for (const [token, user] of Object.entries(sessions)) {
      if (user === username) delete sessions[token];
    }
    localStorage.setItem('artsource-sessions', JSON.stringify(sessions));
    const token = localStorage.getItem('artsource-token');
    if (token && sessions[token] === username) {
      localStorage.removeItem('artsource-token');
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
        className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl"
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.04) 0%, transparent 70%)' }} />

        <div className="relative p-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-1">Admin</p>
              <h2 className="font-display text-3xl uppercase tracking-wide text-foreground">Panel</h2>
            </div>
            <button onClick={handleClose} className="p-2 rounded-lg transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {Object.keys(accounts).length === 0 ? (
              <p className="text-sm text-muted-foreground/40 text-center py-8">No registered users</p>
            ) : (
              Object.entries(accounts).map(([username]) => (
                <div key={username} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <p className="text-sm font-medium text-foreground/80">{username}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteUser(username)}
                    className="p-1.5 rounded-lg transition-all"
                    style={{ color: 'rgba(248,113,113,0.5)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.color = '#f87171'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(248,113,113,0.5)'; }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
