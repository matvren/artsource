import { Heart, Lock } from 'lucide-react';

export default function VendorCard({
  vendor, type, currentUser, isFavorited,
  onToggleFav, onOpen, onOpenAuth
}) {
  const isPaid = type === 'paid';
  const displayId = vendor.display || vendor.id;
  const platformLabel = type === 'whatsapp' ? 'WhatsApp' : type === 'freight' ? 'Freight' : type === 'paid' ? 'Paid' : 'WeChat';

  const handleFav = (e) => {
    e.stopPropagation();
    if (!currentUser) { onOpenAuth(); return; }
    onToggleFav();
  };

  return (
    <div
      onClick={onOpen}
      className="group relative cursor-pointer overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '12px',
        padding: '20px',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.055)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Top-right: Paid lock or fav */}
      {isPaid ? (
        <div
          className="absolute top-3 right-3 flex items-center gap-1"
          style={{
            fontSize: '8px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.3)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '6px',
            padding: '3px 7px',
          }}
        >
          <Lock className="w-2.5 h-2.5" />
          Paid
        </div>
      ) : currentUser ? (
        <button
          onClick={handleFav}
          className="absolute top-3 right-3 p-1.5 rounded-lg transition-all z-10"
          style={{ color: isFavorited ? '#f87171' : 'rgba(255,255,255,0.2)' }}
          onMouseEnter={e => !isFavorited && (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
          onMouseLeave={e => !isFavorited && (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
        >
          <Heart className="w-3.5 h-3.5" fill={isFavorited ? 'currentColor' : 'none'} />
        </button>
      ) : null}

      {/* Platform label */}
      <p
        className="mb-3"
        style={{
          fontSize: '9px',
          fontWeight: 600,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.28)',
        }}
      >
        {platformLabel}
      </p>

      {/* Category */}
      <p
        className="mb-2 leading-tight pr-6"
        style={{
          fontSize: '14px',
          fontWeight: 500,
          color: '#f0f0f0',
          letterSpacing: '0.005em',
        }}
      >
        {vendor.category}
      </p>

      {/* ID */}
      <p
        style={{
          fontSize: '11px',
          fontFamily: 'ui-monospace, monospace',
          color: 'rgba(255,255,255,0.3)',
          filter: isPaid ? 'blur(5px)' : 'none',
          userSelect: isPaid ? 'none' : 'auto',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {isPaid ? 'xxxxxxxxxxxxxxxxx' : displayId}
      </p>
    </div>
  );
}
