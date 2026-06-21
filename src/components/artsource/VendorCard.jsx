import { Heart, Lock } from 'lucide-react';

export default function VendorCard({
  vendor, type, currentUser, isFavorited,
  onToggleFav, onOpen, onOpenAuth
}) {
  const isPaid = type === 'paid';
  const displayId = vendor.display || vendor.id;
  const platformLabel = type === 'whatsapp' ? 'WhatsApp' : 'WeChat';

  const handleFav = (e) => {
    e.stopPropagation();
    if (!currentUser) { onOpenAuth(); return; }
    onToggleFav();
  };

  return (
    <div
      onClick={onOpen}
      className="group relative bg-card border border-border rounded-xl p-5 cursor-pointer hover:border-foreground/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40 overflow-hidden"
    >
      {/* Subtle hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl bg-gradient-to-br from-white/[0.03] to-transparent" />

      {/* Paid lock */}
      {isPaid ? (
        <div className="absolute top-3 right-3 flex items-center gap-1 text-[9px] font-semibold tracking-widest uppercase text-muted-foreground border border-border rounded-md px-2 py-1 bg-background">
          <Lock className="w-2.5 h-2.5" />
          Paid
        </div>
      ) : currentUser ? (
        <button
          onClick={handleFav}
          className={`absolute top-3 right-3 p-1.5 rounded-md transition-all z-10 ${isFavorited ? 'text-red-400' : 'text-muted-foreground/30 hover:text-muted-foreground'}`}
        >
          <Heart className="w-3.5 h-3.5" fill={isFavorited ? 'currentColor' : 'none'} />
        </button>
      ) : null}

      <p className="text-[9px] font-semibold tracking-[0.15em] uppercase text-muted-foreground/50 mb-2.5">
        {platformLabel}
      </p>

      <p className="text-sm font-medium text-foreground mb-2 leading-tight pr-6">
        {vendor.category}
      </p>

      <p className={`text-[11px] font-mono text-muted-foreground/60 truncate ${isPaid ? 'blur-[5px] select-none' : ''}`}>
        {isPaid ? 'xxxxxxxxxxxxxxxxx' : displayId}
      </p>
    </div>
  );
}