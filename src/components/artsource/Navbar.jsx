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
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="font-display text-2xl font-normal tracking-widest uppercase text-foreground">
        ArtSource
      </div>

      <div className="flex items-center gap-3">
        {currentUser ? (
          <div ref={ref} className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:border-foreground/30 transition-all text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <div className="w-6 h-6 rounded-md bg-foreground text-background flex items-center justify-center text-xs font-bold">
                {currentUser[0].toUpperCase()}
              </div>
              <span>{currentUser}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {open && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-xl p-1.5 shadow-2xl z-50">
                {isAdmin && (
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </button>
                )}
                <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                  <Settings className="w-4 h-4" />
                  Reset Password
                </button>
                <div className="h-px bg-border my-1" />
                <button
                  onClick={() => { setOpen(false); onLogout(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-muted text-red-400 hover:text-red-300 transition-colors"
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
            className="px-5 py-2 rounded-full border border-foreground text-foreground text-sm font-medium tracking-wide hover:bg-foreground hover:text-background transition-all duration-200"
          >
            SIGN IN
          </button>
        )}
      </div>
    </nav>
  );
}