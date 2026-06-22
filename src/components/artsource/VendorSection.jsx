import VendorCard from './VendorCard';

export default function VendorSection({
  title, vendors, type, currentUser, favorites,
  onToggleFav, onOpenVendor, onOpenAuth
}) {
  if (!vendors || vendors.length === 0) return null;

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center gap-4 mb-6">
        <p
          className="text-[10px] font-semibold uppercase"
          style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.18em' }}
        >
          {title}
        </p>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
        <span
          className="text-[10px]"
          style={{ color: 'rgba(255,255,255,0.2)', fontVariantNumeric: 'tabular-nums' }}
        >
          {vendors.length}
        </span>
      </div>

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
    </section>
  );
}
