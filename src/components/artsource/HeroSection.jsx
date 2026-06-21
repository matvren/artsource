import { Search } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function HeroSection({ searchQuery, onSearch }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Animated soft blobs
    const blobs = [
      { x: 0.2, y: 0.3, r: 0.45, color: 'rgba(255,255,255,0.018)', speed: 0.0004, ox: 0.08, oy: 0.06 },
      { x: 0.8, y: 0.6, r: 0.4,  color: 'rgba(255,255,255,0.012)', speed: 0.0003, ox: 0.1,  oy: 0.08 },
      { x: 0.5, y: 0.1, r: 0.35, color: 'rgba(255,255,255,0.01)',  speed: 0.0005, ox: 0.06, oy: 0.12 },
    ];

    const draw = () => {
      t++;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      blobs.forEach((b, i) => {
        const cx = (b.x + Math.sin(t * b.speed * 1000 + i) * b.ox) * w;
        const cy = (b.y + Math.cos(t * b.speed * 800 + i * 1.5) * b.oy) * h;
        const r = b.r * Math.max(w, h);
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, b.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Subtle scanline at the bottom
      const lineGrad = ctx.createLinearGradient(0, h * 0.7, 0, h);
      lineGrad.addColorStop(0, 'transparent');
      lineGrad.addColorStop(1, 'rgba(0,0,0,0.4)');
      ctx.fillStyle = lineGrad;
      ctx.fillRect(0, 0, w, h);

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[58vh] px-6 overflow-hidden">
      {/* Animated canvas bg */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Fine grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '180px',
        }}
      />

      {/* Horizontal lines accent */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.015) 40px)',
      }} />

      <div className="relative z-10 flex flex-col items-center text-center">
        <p
          className="text-[10px] font-medium tracking-[0.35em] uppercase text-muted-foreground mb-7"
          style={{ animation: 'fadeSlideUp 0.8s ease 0.1s both' }}
        >
          Vendor Directory
        </p>

        <h1
          className="font-display font-normal uppercase leading-none text-foreground mb-5"
          style={{
            fontSize: 'clamp(68px, 13vw, 152px)',
            letterSpacing: '-0.015em',
            animation: 'fadeSlideUp 0.8s ease 0.2s both',
            textShadow: '0 0 80px rgba(255,255,255,0.06)',
          }}
        >
          ArtSource
        </h1>

        <p
          className="text-sm text-muted-foreground mb-10 tracking-wide"
          style={{ animation: 'fadeSlideUp 0.8s ease 0.3s both' }}
        >
          Connect with verified vendors via WeChat or WhatsApp
        </p>

        {/* Search */}
        <div
          className="relative w-full max-w-md"
          style={{ animation: 'fadeSlideUp 0.8s ease 0.4s both' }}
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={e => onSearch(e.target.value)}
            placeholder="Search vendors…"
            className="w-full bg-secondary/80 border border-border rounded-full pl-11 pr-5 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-300 backdrop-blur-sm"
            onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
            onBlur={e => e.target.style.borderColor = ''}
          />
        </div>

        {/* Formats bar */}
        <p
          className="mt-8 text-[10px] tracking-[0.25em] uppercase text-muted-foreground/40"
          style={{ animation: 'fadeSlideUp 0.8s ease 0.5s both' }}
        >
          Supported Platforms — WeChat · WhatsApp · Freight · Paid
        </p>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}