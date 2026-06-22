import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/artsource/Navbar';
import HeroSection from '@/components/artsource/HeroSection';
import VendorSection from '@/components/artsource/VendorSection';
import ContactSection from '@/components/artsource/ContactSection';
import VendorModal from '@/components/artsource/VendorModal';
import AuthModal from '@/components/artsource/AuthModal';
import ResetPasswordModal from '@/components/artsource/ResetPasswordModal';
import AdminModal from '@/components/artsource/AdminModal';
import DeleteAccountModal from '@/components/artsource/DeleteAccountModal';
import { vendorData } from '@/lib/vendorData';
import { getFavorites as lsGetFavs, getCustomVendors as lsGetCustom, setFavorites as lsSetFavs, syncFromGitHub } from '@/lib/githubDB';

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    setScrollProgress(docHeight > 0 ? scrollTop / docHeight : 0);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
  const [currentUser, setCurrentUser] = useState(() => {
    const token = localStorage.getItem('artsource-token');
    if (token) {
      const sessions = JSON.parse(localStorage.getItem('artsource-sessions') || '{}');
      return sessions[token] || null;
    }
    return null;
  });
  const [favorites, setFavorites] = useState(() => currentUser ? lsGetFavs(currentUser) : []);
  const [customVendors, setCustomVendors] = useState(() => lsGetCustom());
  const [syncKey, setSyncKey] = useState(0);

  // Sync from GitHub on mount — reads public raw file, no token needed
  useEffect(() => {
    syncFromGitHub().then(() => {
      if (currentUser) setFavorites(lsGetFavs(currentUser));
      setCustomVendors(lsGetCustom());
    }).catch(() => {});
  }, [currentUser, syncKey]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  const mergedVendorData = Object.fromEntries(
    Object.entries(vendorData).map(([key, vendors]) => [
      key, [...vendors, ...(customVendors[key] || [])],
    ])
  );

  const handleLogin = (user) => {
    setCurrentUser(user);
    setFavorites(lsGetFavs(user));
    setShowAuth(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('artsource-token');
    setCurrentUser(null);
    setFavorites([]);
  };

  const handleDeleteAccount = () => {
    setCurrentUser(null);
    setFavorites([]);
    setShowDeleteAccount(false);
    setCustomVendors(lsGetCustom());
  };

  const toggleFavorite = (key) => {
    if (!currentUser) { setShowAuth(true); return; }
    const newFavs = favorites.includes(key)
      ? favorites.filter(f => f !== key)
      : [...favorites, key];
    setFavorites(newFavs);
    lsSetFavs(currentUser, newFavs);
  };

  const openVendor = (vendor, type) => {
    setSelectedVendor({ vendor, type });
  };

  const filteredData = Object.fromEntries(
    Object.entries(mergedVendorData).map(([key, vendors]) => [
      key,
      vendors.filter(v =>
        !searchQuery ||
        v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.display || v.id).toLowerCase().includes(searchQuery.toLowerCase())
      )
    ])
  );

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#010101' }}>
      {/* Fixed navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={() => setShowAuth(true)}
        onLogout={handleLogout}
        onOpenAdmin={() => setShowAdmin(true)}
        onOpenResetPassword={() => setShowResetPassword(true)}
        onOpenDeleteAccount={() => setShowDeleteAccount(true)}
      />

      {/* Full-viewport hero — no top padding needed since navbar is fixed + transparent */}
      <HeroSection searchQuery={searchQuery} onSearch={setSearchQuery} />

      {/* Vendor directory */}
      <main id="directory" className="max-w-6xl mx-auto px-6 pb-32" style={{ paddingTop: '80px', animation: 'pageFadeIn 0.6s ease 0.2s both' }}>
        {/* Section eyebrow */}
        <div className="mb-12">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-2"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            Vendor Directory
          </p>
          <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </div>

        <div className="space-y-16">
          <VendorSection
            title="WeChat"
            vendors={filteredData.wechat}
            type="wechat"
            currentUser={currentUser}
            favorites={favorites}
            onToggleFav={toggleFavorite}
            onOpenVendor={openVendor}
            onOpenAuth={() => setShowAuth(true)}
          />
          <VendorSection
            title="WhatsApp"
            vendors={filteredData.whatsapp}
            type="whatsapp"
            currentUser={currentUser}
            favorites={favorites}
            onToggleFav={toggleFavorite}
            onOpenVendor={openVendor}
            onOpenAuth={() => setShowAuth(true)}
          />
          <VendorSection
            title="Freight Forwarders"
            vendors={filteredData.freight}
            type="freight"
            currentUser={currentUser}
            favorites={favorites}
            onToggleFav={toggleFavorite}
            onOpenVendor={openVendor}
            onOpenAuth={() => setShowAuth(true)}
          />
          <VendorSection
            title="Paid"
            vendors={filteredData.paid}
            type="paid"
            currentUser={currentUser}
            favorites={favorites}
            onToggleFav={toggleFavorite}
            onOpenVendor={openVendor}
            onOpenAuth={() => setShowAuth(true)}
          />
        </div>

        <div className="mt-20">
          <ContactSection />
        </div>

        <div className="mt-24 mb-12 text-center">
          <div className="flex items-center justify-center gap-8 mb-5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3c-1.5 0-3 2-3 5s1.5 5 3 5 3-2 3-5-1.5-5-3-5z"/>
              <path d="M8 13h8"/>
              <path d="M6 17c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v2H6v-2z"/>
              <path d="M18 21H6"/>
            </svg>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="8"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.03em' }}>
            To purchase any item for cheap contact{' '}
            <a href="https://wa.me/16472722058" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 transition-colors" style={{ color: 'rgba(255,255,255,0.45)' }} onMouseEnter={e => e.currentTarget.style.color = '#f5f5f5'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}>artsources</a>
            {' '}or{' '}
            <a href="https://wa.me/35795653345" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 transition-colors" style={{ color: 'rgba(255,255,255,0.45)' }} onMouseEnter={e => e.currentTarget.style.color = '#f5f5f5'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}>racibuls</a>
          </p>
        </div>

        <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-center pb-8" style={{ color: 'rgba(255,255,255,0.15)' }}>
          &copy; racibuls &amp; artsources
        </p>
      </main>

      {selectedVendor && (
        <VendorModal
          vendor={selectedVendor.vendor}
          type={selectedVendor.type}
          onClose={() => setSelectedVendor(null)}
          currentUser={currentUser}
          onOpenAuth={() => { setSelectedVendor(null); setShowAuth(true); }}
        />
      )}

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLogin={handleLogin}
        />
      )}

      {showAdmin && (
        <AdminModal
          currentUser={currentUser}
          onClose={() => setShowAdmin(false)}
          onSync={() => setSyncKey(k => k + 1)}
        />
      )}

      {showResetPassword && (
        <ResetPasswordModal
          currentUser={currentUser}
          onClose={() => setShowResetPassword(false)}
        />
      )}

      {showDeleteAccount && (
        <DeleteAccountModal
          currentUser={currentUser}
          onClose={() => setShowDeleteAccount(false)}
          onDeleted={handleDeleteAccount}
        />
      )}

      {/* Scroll to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 z-50 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 hover:scale-110"
        style={{
          background: scrollProgress > 0.1 ? 'rgba(255,255,255,0.06)' : 'transparent',
          border: scrollProgress > 0.1 ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
          opacity: scrollProgress > 0.1 ? 1 : 0,
          pointerEvents: scrollProgress > 0.1 ? 'auto' : 'none',
        }}
      >
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>

      {/* Custom scrollbar indicator */}
      <div
        className="fixed right-0 top-0 bottom-0 w-[3px] pointer-events-none z-50"
        style={{ background: 'rgba(255,255,255,0.03)' }}
      >
        <div
          className="w-full transition-all duration-75"
          style={{
            height: `${Math.max(scrollProgress * 100, 0)}%`,
            background: 'rgba(255,255,255,0.12)',
            borderRadius: '0 2px 2px 0',
          }}
        />
      </div>
    </div>
  );
}
