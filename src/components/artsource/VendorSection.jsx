import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Phone, Package, Lock, ChevronDown } from 'lucide-react';
import VendorCard from './VendorCard';

const platformIcons = {
  wechat: { icon: MessageCircle, color: '#25d366' },
  whatsapp: { icon: Phone, color: '#25d366' },
  freight: { icon: Package, color: '#eab308' },
  paid: { icon: Lock, color: '#eab308' },
};

export default function VendorSection({
  title, vendors, type, currentUser, favorites,
  onToggleFav, onOpenVendor, onOpenAuth
}) {
  const [expanded, setExpanded] = useState(false);
  const gridRef = useRef(null);
  const [height, setHeight] = useState('auto');

  useEffect(() => {
    if (gridRef.current) {
      setHeight(expanded ? gridRef.current.scrollHeight + 'px' : '0px');
    }
  }, [expanded, vendors]);

  if (!vendors || vendors.length === 0) return null;

  const Icon = platformIcons[type]?.icon || MessageCircle;
  const iconColor = platformIcons[type]?.color || 'rgba(255,255,255,0.4)';

  return (
    <section>
      <div
        className="flex items-center gap-3 mb-6 cursor-pointer select-none group"
        onClick={() => setExpanded(!expanded)}
        style={{ userSelect: 'none' }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
          style={{
            background: expanded ? `${iconColor}18` : 'rgba(255,255,255,0.04)',
            color: expanded ? iconColor : 'rgba(255,255,255,0.3)',
          }}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>

        <p
          className="text-[10px] font-semibold uppercase transition-all duration-200"
          style={{
            color: expanded ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)',
            letterSpacing: '0.18em',
          }}
        >
          {title}
        </p>

        <div className="flex-1 h-px transition-all duration-200" style={{ background: expanded ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)' }} />

        <span
          className="text-[10px] transition-all duration-200"
          style={{ color: expanded ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)', fontVariantNumeric: 'tabular-nums' }}
        >
          {vendors.length}
        </span>

        <ChevronDown
          className="w-3 h-3 transition-all duration-200"
          style={{
            color: 'rgba(255,255,255,0.25)',
            transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
          }}
        />
      </div>

      <div
        ref={gridRef}
        style={{
          overflow: 'hidden',
          transition: 'height 0.35s cubic-bezier(0.16,1,0.3,1)',
          height: height,
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {vendors.map(vendor => (
            <VendorCard
              key={vendor.id + type}
              vendor={vendor}
              type={type}
              currentUser={currentUser}
              isFavorited={favorites.includes(vendor.id + type)}
              onToggleFav={() => onToggleFav(vendor.id + type)}
              onOpen={() => onOpenVendor(vendor, type)}
              onOpenAuth={onOpenAuth}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
