import VendorCard from './VendorCard';

export default function VendorSection({
  title, vendors, type, currentUser, favorites,
  onToggleFav, onOpenVendor, onOpenAuth
}) {
  if (!vendors || vendors.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-4 mb-5">
        <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground">
          {title}
        </span>
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] text-muted-foreground/50">{vendors.length}</span>
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