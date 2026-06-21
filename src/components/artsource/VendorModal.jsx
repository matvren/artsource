import { useState, useEffect } from 'react';
import { X, Copy, Check, MessageCircle } from 'lucide-react';

export default function VendorModal({ vendor, type, onClose, currentUser, onOpenAuth }) {
  const [copied, setCopied] = useState(false);
  const isPaid = type === 'paid';
  const isWechat = type === 'wechat' || type === 'freight';
  const displayId = vendor.display || vendor.id;

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(displayId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getCtaHref = () => {
    if (isPaid) {
      const msg = encodeURIComponent(`Hi, I want access to the paid ${vendor.category} supplier.`);
      return `https://wa.me/16472722058?text=${msg}`;
    }
    if (isWechat) return `weixin://dl/chat?${vendor.id}`;
    const msg = encodeURIComponent(`Hi, I was referred from ArtSource and I'm interested in ${vendor.category}. Can you help me?`);
    return `https://wa.me/${vendor.id.replace(/\D/g,'')}?text=${msg}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-1">
          {isPaid ? 'Paid' : isWechat ? 'WeChat' : 'WhatsApp'}
        </p>
        <h2 className="text-xl font-semibold text-foreground mb-6">{vendor.category}</h2>

        {!isPaid && (
          <div className="flex items-center gap-3 bg-muted border border-border rounded-xl px-4 py-3 mb-4">
            <span className="flex-1 text-sm font-mono text-foreground/80 truncate">{displayId}</span>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${copied ? 'bg-green-500/20 text-green-400' : 'bg-background text-muted-foreground hover:text-foreground'}`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}

        <a
          href={getCtaHref()}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center gap-2.5 w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] ${isPaid || !isWechat ? 'bg-[#25d366] text-white' : 'bg-[#07C160] text-white'}`}
        >
          <MessageCircle className="w-4 h-4" />
          {isPaid ? 'Contact Owner' : isWechat ? 'Open in WeChat' : 'Open WhatsApp'}
        </a>

        <p className="text-[11px] text-muted-foreground text-center mt-4 leading-relaxed">
          {isPaid
            ? 'This is a paid vendor. Message the owner to get access.'
            : isWechat
            ? 'Copy the ID and search in WeChat to add this vendor.'
            : 'Opens WhatsApp with an ArtSource intro message.'}
        </p>
      </div>
    </div>
  );
}