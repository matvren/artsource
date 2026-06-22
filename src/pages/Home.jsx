import { useState, useEffect } from 'react';
import Navbar from '@/components/artsource/Navbar';
import HeroSection from '@/components/artsource/HeroSection';
import VendorSection from '@/components/artsource/VendorSection';
import ContactSection from '@/components/artsource/ContactSection';
import VendorModal from '@/components/artsource/VendorModal';
import AuthModal from '@/components/artsource/AuthModal';
import { vendorData } from '@/lib/vendorData';

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('artsource-token');
    if (token) {
      const sessions = JSON.parse(localStorage.getItem('artsource-sessions') || '{}');
      const user = sessions[token];
      if (user) {
        setCurrentUser(user);
        setFavorites(JSON.parse(localStorage.getItem('artsource-favs-' + user) || '[]'));
      } else {
        localStorage.removeItem('artsource-token');
      }
    }
  }, []);

  const handleLogin = (user, favs) => {
    setCurrentUser(user);
    setFavorites(favs);
    setShowAuth(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('artsource-token');
    setCurrentUser(null);
    setFavorites([]);
  };

  const toggleFavorite = (key) => {
    if (!currentUser) { setShowAuth(true); return; }
    const newFavs = favorites.includes(key)
      ? favorites.filter(f => f !== key)
      : [...favorites, key];
    setFavorites(newFavs);
    localStorage.setItem('artsource-favs-' + currentUser, JSON.stringify(newFavs));
  };

  const openVendor = (vendor, type) => {
    setSelectedVendor({ vendor, type });
  };

  const filteredData = Object.fromEntries(
    Object.entries(vendorData).map(([key, vendors]) => [
      key,
      vendors.filter(v =>
        !searchQuery ||
        v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.display || v.id).toLowerCase().includes(searchQuery.toLowerCase())
      )
    ])
  );

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#0a0a0a' }}>
      {/* Fixed navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={() => setShowAuth(true)}
        onLogout={handleLogout}
      />

      {/* Full-viewport hero — no top padding needed since navbar is fixed + transparent */}
      <HeroSection searchQuery={searchQuery} onSearch={setSearchQuery} />

      {/* Vendor directory */}
      <main id="directory" className="max-w-6xl mx-auto px-6 pb-32" style={{ paddingTop: '80px' }}>
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
    </div>
  );
}
