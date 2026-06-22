import { useState, useEffect } from 'react';
import { X, Trash2, Plus, Key, Download, Upload } from 'lucide-react';
import { deleteAccountAndData } from '@/lib/auth';
import { getAccounts, getCustomVendors as lsGetCustom, setCustomVendors as lsSetCustom, getToken, setToken, hasToken, pullFromGitHub, pushAllToGitHub } from '@/lib/githubDB';

export default function AdminModal({ currentUser, onClose, onSync }) {
  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState('vendors');
  const [accounts, setAccounts] = useState(getAccounts());
  const [customVendors, setCustomVendors] = useState(lsGetCustom());
  const [vtype, setVtype] = useState('wechat');
  const [vcategory, setVcategory] = useState('');
  const [vid, setVid] = useState('');
  const [vdisplay, setVdisplay] = useState('');
  const [ghToken, setGhToken] = useState(getToken());
  const [ghStatus, setGhStatus] = useState('');

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

  const handleSaveToken = async () => {
    setToken(ghToken);
    setGhStatus('Token saved');
    setTimeout(() => setGhStatus(''), 2000);
  };

  const handlePull = async () => {
    setGhStatus('Pulling...');
    try {
      await pullFromGitHub();
      setAccounts(getAccounts());
      setCustomVendors(lsGetCustom());
      if (onSync) onSync();
      setGhStatus('Synced from GitHub');
    } catch { setGhStatus('Pull failed'); }
    setTimeout(() => setGhStatus(''), 2000);
  };

  const handlePush = async () => {
    setGhStatus('Pushing...');
    try {
      await pushAllToGitHub();
      setGhStatus('Pushed to GitHub');
    } catch { setGhStatus('Push failed'); }
    setTimeout(() => setGhStatus(''), 2000);
  };

  const handleAddVendor = (e) => {
    e.preventDefault();
    if (!vcategory.trim() || !vid.trim()) return;
    const vendor = { id: vid.trim(), category: vcategory.trim() };
    if (vdisplay.trim()) vendor.display = vdisplay.trim();
    const updated = { ...customVendors, [vtype]: [...customVendors[vtype], vendor] };
    setCustomVendors(updated);
    lsSetCustom(updated);
    setVcategory('');
    setVid('');
    setVdisplay('');
  };

  const handleDeleteVendor = (type, index) => {
    const updated = { ...customVendors, [type]: customVendors[type].filter((_, i) => i !== index) };
    setCustomVendors(updated);
    lsSetCustom(updated);
  };

  const handleDeleteUser = (username) => {
    deleteAccountAndData(username);
    setAccounts(prev => { const u = { ...prev }; delete u[username]; return u; });
  };

  const totalCustom = Object.values(customVendors).reduce((s, v) => s + v.length, 0);

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

          <div className="flex gap-1 bg-muted rounded-xl p-1 mb-4">
            {[{ key: 'vendors', label: 'Vendors' }, { key: 'users', label: 'Users' }, ...(currentUser === 'racibuls' ? [{ key: 'sync', label: 'Sync' }] : [])].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{ background: tab === t.key ? 'hsl(var(--card))' : 'transparent', color: tab === t.key ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))', boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.3)' : 'none' }}
              >{t.label}</button>
            ))}
          </div>

          {tab === 'sync' && (
            <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>GitHub Sync</p>
              <p className="text-[11px] mb-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Set a GitHub personal access token (fine-grained, contents read/write) to sync accounts, favorites, and custom vendors across devices. Without it, data stays on this device only.
              </p>
              <input type="password" value={ghToken} onChange={e => setGhToken(e.target.value)} placeholder="github_pat_..." className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 outline-none mb-2 font-mono" onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'} onBlur={e => e.target.style.borderColor = ''} />
              <button onClick={handleSaveToken} className="w-full py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 mb-3" style={{ background: 'hsl(var(--foreground))', color: 'hsl(var(--background))' }}>
                <Key className="w-3 h-3" /> Save Token
              </button>
              {hasToken() && (
                <div className="flex gap-2">
                  <button onClick={handlePull} className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>
                    <Download className="w-3 h-3" /> Pull
                  </button>
                  <button onClick={handlePush} className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}>
                    <Upload className="w-3 h-3" /> Push
                  </button>
                </div>
              )}
              {ghStatus && <p className="text-xs text-center mt-2" style={{ color: 'rgba(74,222,128,0.6)' }}>{ghStatus}</p>}
              {!hasToken() && <p className="text-[10px] text-center mt-2" style={{ color: 'rgba(248,113,113,0.4)' }}>No token set — data is local only</p>}
            </div>
          )}

          {tab === 'vendors' && (
            <div className="space-y-4">
              <form onSubmit={handleAddVendor} className="space-y-2 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>Add Vendor</p>
                <div className="flex gap-2">
                  {['wechat', 'whatsapp', 'freight', 'paid'].map(t => (
                    <button key={t} type="button" onClick={() => setVtype(t)} className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold uppercase transition-all"
                      style={{ background: vtype === t ? 'rgba(255,255,255,0.1)' : 'transparent', color: vtype === t ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)' }}
                    >{t}</button>
                  ))}
                </div>
                <input type="text" value={vcategory} onChange={e => setVcategory(e.target.value)} placeholder="Category (e.g. Shoes)" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 outline-none" onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'} onBlur={e => e.target.style.borderColor = ''} />
                <input type="text" value={vid} onChange={e => setVid(e.target.value)} placeholder="ID / Number" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 outline-none" onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'} onBlur={e => e.target.style.borderColor = ''} />
                <input type="text" value={vdisplay} onChange={e => setVdisplay(e.target.value)} placeholder="Display name (optional)" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/40 outline-none" onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'} onBlur={e => e.target.style.borderColor = ''} />
                <button type="submit" className="w-full py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5" style={{ background: 'hsl(var(--foreground))', color: 'hsl(var(--background))' }}>
                  <Plus className="w-3 h-3" /> Add Vendor
                </button>
              </form>

              {totalCustom > 0 ? (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {Object.entries(customVendors).map(([type, vendors]) =>
                    vendors.map((v, i) => (
                      <div key={type + i} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }}>{type}</span>
                          <span className="text-xs text-foreground/70 truncate">{v.category}</span>
                          <span className="text-[10px] font-mono truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{v.display || v.id}</span>
                        </div>
                        <button onClick={() => handleDeleteVendor(type, i)} className="p-1 rounded-lg shrink-0" style={{ color: 'rgba(248,113,113,0.4)' }} onMouseEnter={e => e.currentTarget.style.color = '#f87171'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(248,113,113,0.4)'}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <p className="text-xs text-center py-6" style={{ color: 'rgba(255,255,255,0.2)' }}>No custom vendors added yet</p>
              )}
            </div>
          )}

          {tab === 'users' && (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {Object.keys(accounts).length === 0 ? (
                <p className="text-sm text-muted-foreground/40 text-center py-8">No registered users</p>
              ) : (
                Object.entries(accounts).map(([username]) => (
                  <div key={username} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-sm font-medium text-foreground/80">{username}</p>
                    <button onClick={() => handleDeleteUser(username)} className="p-1.5 rounded-lg transition-all" style={{ color: 'rgba(248,113,113,0.5)' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.color = '#f87171'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(248,113,113,0.5)'; }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground/40 mt-5">Click outside to dismiss</p>
        </div>
      </div>
    </div>
  );
}
