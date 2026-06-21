import { useState } from 'react';
import { Check } from 'lucide-react';
import { contacts } from '@/lib/vendorData';

export default function ContactSection() {
  const [copied, setCopied] = useState({});

  const handleCopy = (name) => {
    navigator.clipboard.writeText(name).then(() => {
      setCopied(prev => ({ ...prev, [name]: true }));
      setTimeout(() => setCopied(prev => ({ ...prev, [name]: false })), 2000);
    });
  };

  return (
    <section>
      <div className="flex items-center gap-4 mb-5">
        <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground">
          Contact ArtSource
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {contacts.map(contact => (
          <div key={contact.name} className="bg-card border border-border rounded-xl p-5 hover:border-foreground/20 transition-all">
            <p className="text-sm font-medium text-foreground">{contact.name}</p>
            <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-4 mt-0.5">
              {contact.role}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCopy(contact.discord)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${copied[contact.discord] ? 'bg-blue-500/20 text-blue-400' : 'bg-[#5865f2] text-white hover:opacity-90'}`}
              >
                {copied[contact.discord] ? <Check className="w-3 h-3" /> : (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057 13.2048 13.2048 0 01-1.8711-.9212.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.371-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.9220.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 5.9012-3.0298a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
                  </svg>
                )}
                {copied[contact.discord] ? 'Copied!' : contact.discord}
              </button>
              <a
                href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-[#25d366] text-white hover:opacity-90 transition-all"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                </svg>
                {contact.whatsappDisplay}
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}