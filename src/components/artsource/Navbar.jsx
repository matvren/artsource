import { useState, useRef, useEffect } from 'react';
import { LogOut, Settings, Shield, ChevronDown } from 'lucide-react';
import { ADMIN_USERS } from '@/lib/vendorData';

export default function Navbar({ currentUser, onOpenAuth, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isAdmin = ADMIN_USERS.includes(currentUser);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-5"
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'transparent',
      }}
    >
      {/* Wordmark — small, clean */}
      <div
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: '17px',
          fontWeight: 700,
          letterSpacing: '0.01em',
          color: '#f5f5f5',
        }}
      >
        ArtSource
      </div>

      <div className="flex items-center gap-3">
        {currentUser ? (
          <div ref={ref} className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
              style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '0.02em' }}
            >
              <div
                className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                style={{ background: 'rgba(255,255,255,0.12)', color: '#f5f5f5' }}
              >
                {currentUser[0].toUpperCase()}
              </div>
              <span>{currentUser}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {open && (
              <div
                className="absolute top-full right-0 mt-3 w-48 rounded-xl p-1.5 shadow-2xl z-50"
                style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {isAdmin && (
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </button>
                )}
                <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Settings className="w-4 h-4" />
                  Reset Password
                </button>
                <div className="h-px my-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <button
                  onClick={() => { setOpen(false); onLogout(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left"
                  style={{ color: '#f87171' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-5 py-2 text-xs font-medium tracking-[0.12em] uppercase transition-all duration-200"
            style={{
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '100px',
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: '0.12em',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
              e.currentTarget.style.color = '#f5f5f5';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
            }}
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
