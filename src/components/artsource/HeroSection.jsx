import { Search } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function HeroSection({ searchQuery, onSearch }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    // Grid resolution for the cloth mesh
    const COLS = 32;
    const ROWS = 20;
    let pts = [];
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      buildGrid();
    };

    const buildGrid = () => {
      pts = [];
      for (let row = 0; row <= ROWS; row++) {
        pts[row] = [];
        for (let col = 0; col <= COLS; col++) {
          pts[row][col] = {
            bx: (col / COLS) * canvas.width,
            by: (row / ROWS) * canvas.height,
            ox: (col / COLS - 0.5),
            oy: (row / ROWS - 0.5),
          };
        }
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      t += 0.004;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#080808';
      ctx.fillRect(0, 0, w, h);

      // Build displaced points
      const disp = pts.map((row, ri) =>
        row.map((p, ci) => {
          const wave1 = Math.sin(p.ox * 3.5 + t * 1.1) * Math.cos(p.oy * 2.8 + t * 0.7);
          const wave2 = Math.sin(p.oy * 4.2 - t * 0.9) * Math.cos(p.ox * 3.1 + t * 1.3);
          const wave3 = Math.sin((p.ox + p.oy) * 2.5 + t * 0.8);
          const amp = 0.065 * Math.max(w, h);
          return {
            x: p.bx + (wave1 * 0.6 + wave2 * 0.4) * amp,
            y: p.by + (wave2 * 0.5 + wave3 * 0.5) * amp,
          };
        })
      );

      // Draw cloth quads as filled polys with gradient-like color
      for (let ri = 0; ri < ROWS; ri++) {
        for (let ci = 0; ci < COLS; ci++) {
          const tl = disp[ri][ci];
          const tr = disp[ri][ci + 1];
          const br = disp[ri + 1][ci + 1];
          const bl = disp[ri + 1][ci];

          // Normal calculation for fake lighting
          const midX = (tl.x + tr.x + br.x + bl.x) / 4;
          const midY = (tl.y + tr.y + br.y + bl.y) / 4;

          // Edge vectors
          const ex1 = tr.x - tl.x;
          const ey1 = tr.y - tl.y;
          const ex2 = bl.x - tl.x;
          const ey2 = bl.y - tl.y;

          // Cross product z component (2D "normal")
          const crossZ = ex1 * ey2 - ey1 * ex2;
          const normalizedZ = Math.max(-1, Math.min(1, crossZ / (w * h * 0.002)));

          // Lighting: base dark + specular from fold direction
          const light = 0.08 + 0.28 * Math.max(0, normalizedZ);
          const specular = Math.pow(Math.max(0, normalizedZ), 6) * 0.35;
          const total = Math.min(1, light + specular);

          // Add subtle warm/cool tint based on position and time
          const tintWave = Math.sin(midX / w * Math.PI + t * 0.5) * 0.5 + 0.5;

          const r = Math.round(total * 255 * (1 - tintWave * 0.04));
          const g = Math.round(total * 255 * (1 - tintWave * 0.02));
          const b = Math.round(total * 255 * (1 + tintWave * 0.05));

          ctx.beginPath();
          ctx.moveTo(tl.x, tl.y);
          ctx.lineTo(tr.x, tr.y);
          ctx.lineTo(br.x, br.y);
          ctx.lineTo(bl.x, bl.y);
          ctx.closePath();

          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fill();
        }
      }

      // Edge lines for a subtle mesh look (very faint)
      ctx.strokeStyle = 'rgba(255,255,255,0.018)';
      ctx.lineWidth = 0.5;
      for (let ri = 0; ri <= ROWS; ri++) {
        ctx.beginPath();
        for (let ci = 0; ci <= COLS; ci++) {
          const p = disp[ri][ci];
          ci === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }
      for (let ci = 0; ci <= COLS; ci++) {
        ctx.beginPath();
        for (let ri = 0; ri <= ROWS; ri++) {
          const p = disp[ri][ci];
          ri === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      // Vignette overlay
      const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.15, w / 2, h / 2, h * 0.85);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.72)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      // Bottom fade to black
      const bottomFade = ctx.createLinearGradient(0, h * 0.65, 0, h);
      bottomFade.addColorStop(0, 'rgba(0,0,0,0)');
      bottomFade.addColorStop(1, 'rgba(8,8,8,1)');
      ctx.fillStyle = bottomFade;
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
    <div className="relative flex flex-col items-center justify-center min-h-screen px-6 overflow-hidden">
      {/* Animated cloth canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: 'block' }}
      />

      {/* Very fine grain texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.035,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px',
        }}
      />

      {/* Centered content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Eyebrow */}
        <p
          className="text-[10px] font-medium tracking-[0.4em] uppercase mb-8"
          style={{
            color: 'rgba(255,255,255,0.45)',
            animation: 'heroFadeUp 1s ease 0.1s both',
            letterSpacing: '0.4em',
          }}
        >
          Art Sourcing &amp; Vendor Network
        </p>

        {/* Main wordmark — high-contrast serif */}
        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 700,
            fontSize: 'clamp(64px, 12vw, 148px)',
            lineHeight: 0.92,
            letterSpacing: '-0.02em',
            color: '#f5f5f5',
            animation: 'heroFadeUp 1s ease 0.2s both',
            textShadow: '0 2px 60px rgba(255,255,255,0.08)',
          }}
        >
          ArtSource
        </h1>

        {/* Subtitle */}
        <p
          className="mt-6 text-sm font-light tracking-wide max-w-xs leading-relaxed"
          style={{
            color: 'rgba(255,255,255,0.5)',
            animation: 'heroFadeUp 1s ease 0.35s both',
          }}
        >
          Connect with vendors, freight forwarders<br />
          &amp; sourcing partners worldwide
        </p>

        {/* Search bar */}
        <div
          className="relative mt-10 w-full max-w-sm"
          style={{ animation: 'heroFadeUp 1s ease 0.45s both' }}
        >
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          />
          <input
            type="search"
            value={searchQuery}
            onChange={e => onSearch(e.target.value)}
            placeholder="Search vendors…"
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '100px',
              padding: '12px 20px 12px 44px',
              fontSize: '13px',
              color: '#f5f5f5',
              outline: 'none',
              backdropFilter: 'blur(12px)',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.25)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
          <style>{`input::placeholder { color: rgba(255,255,255,0.3); }`}</style>
        </div>
      </div>

      {/* Scroll indicator at bottom */}
      <div
        className="absolute bottom-10 left-0 right-0 flex flex-col items-center gap-2"
        style={{ animation: 'heroFadeUp 1.2s ease 0.8s both' }}
      >
        <p
          className="text-[9px] tracking-[0.35em] uppercase"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          ↓ &nbsp;Scroll to Explore
        </p>
      </div>

      {/* Bottom border / divider line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      />

      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
