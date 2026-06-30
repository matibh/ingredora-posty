"use client";
import React from "react";
import { FaTiktok } from 'react-icons/fa';
import { SiThreads } from 'react-icons/si';

/* ═══════════════════════════════════════════════════════════════════
   CSS KEYFRAMES
   ═══════════════════════════════════════════════════════════════════ */
const css = `
@keyframes softPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(122,208,232,0); }
  50%      { box-shadow: 0 0 18px 4px rgba(122,208,232,0.12); }
}
@keyframes orbitSpin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes dashFlow {
  0%   { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -20; }
}
`;

/* ═══════════════════════════════════════════════════════════════════
   SOCIAL PLATFORM ICONS  (brand SVGs)
   ═══════════════════════════════════════════════════════════════════ */
const platforms = [
  {
    name: "YouTube",
    color: "#FF0000",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 md:w-7 md:h-7" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    color: "#E4405F",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 md:w-7 md:h-7" fill="currentColor">
        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.882 0 1.441 1.441 0 012.882 0z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    color: "#1877F2",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 md:w-7 md:h-7" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    color: "#25F4EE",
    icon: (
      <FaTiktok className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" />
    ),
  },
  {
    name: "X",
    color: "#F0F4F8",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 md:w-6 md:h-6" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    color: "#0A66C2",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 md:w-7 md:h-7" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "Threads",
    color: "#F0F4F8",
    icon: (
      <SiThreads className="w-6 h-6 md:w-7 md:h-7" fill="currentColor" />
    ),
  },
  {
    name: "Pinterest",
    color: "#E60023",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 md:w-7 md:h-7" fill="currentColor">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z" />
      </svg>
    ),
  },
  {
    name: "Voxurn",
    color: "#6C63FF",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 md:w-7 md:h-7" fill="none">
        <defs>
          <linearGradient id="voxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8A2BE2" />
            <stop offset="100%" stopColor="#4A00E0" />
          </linearGradient>
          <linearGradient id="voxRingGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4A00E0" />
            <stop offset="50%" stopColor="#6C63FF" />
            <stop offset="100%" stopColor="#00E1D9" />
          </linearGradient>
          <clipPath id="voxTopHalf">
            <rect x="0" y="0" width="24" height="11.5" />
          </clipPath>
        </defs>

        {/* 1. Background rings (bottom half visible behind V) */}
        <ellipse cx="12" cy="11.5" rx="10.5" ry="3.5" stroke="url(#voxRingGrad)" strokeWidth={2.5}
          transform="rotate(-15 12 11.5)" opacity="0.95" />
        <ellipse cx="12" cy="11.5" rx="8" ry="2.5" stroke="url(#voxRingGrad)" strokeWidth={1.5}
          transform="rotate(-15 12 11.5)" opacity="0.7" />
        <ellipse cx="12" cy="11.5" rx="5.5" ry="1.5" stroke="url(#voxRingGrad)" strokeWidth={1}
          transform="rotate(-15 12 11.5)" opacity="0.4" />

        {/* 2. Sleek filled V letter - Larger & Thicker */}
        <path d="M12 22 L1.5 2 h6.5 L12 12.5 L16 2 h6.5 L12 22 Z" fill="url(#voxGrad)" />

        {/* 3. Foreground rings (top half overlapping the V) */}
        <g clipPath="url(#voxTopHalf)">
          <ellipse cx="12" cy="11.5" rx="10.5" ry="3.5" stroke="url(#voxRingGrad)" strokeWidth={2.5}
            transform="rotate(-15 12 11.5)" opacity="0.95" />
          <ellipse cx="12" cy="11.5" rx="8" ry="2.5" stroke="url(#voxRingGrad)" strokeWidth={1.5}
            transform="rotate(-15 12 11.5)" opacity="0.7" />
          <ellipse cx="12" cy="11.5" rx="5.5" ry="1.5" stroke="url(#voxRingGrad)" strokeWidth={1}
            transform="rotate(-15 12 11.5)" opacity="0.4" />
        </g>
      </svg>
    ),
  },
];


/* ═══════════════════════════════════════════════════════════════════
   GLOBE WITH CONNECTED PLATFORMS  (SVG world + orbiting icons)
   ═══════════════════════════════════════════════════════════════════ */
function GlobeWithPlatforms() {
  /* Place platforms in a circle around the globe */
  const count = platforms.length;
  // Increase globe radius and canvas, but make platforms closer relative to globe size.
  const radius = 180; // px from center
  const centerX = 230;
  const centerY = 230;
  const canvasSize = 460;

  return (
    <div className="relative mx-auto w-full max-w-[460px] aspect-square">
      {/* SVG layer: globe + dashed lines */}
      <svg
        viewBox={`0 0 ${canvasSize} ${canvasSize}`}
        className="absolute inset-0 w-full h-full"
        fill="none"
      >
        {/* Globe circles */}
        <circle cx={centerX} cy={centerY} r="80" stroke="#7AD0E8" strokeWidth="1.5" opacity=".25" />
        <circle cx={centerX} cy={centerY} r="55" stroke="#7AD0E8" strokeWidth="1" opacity=".15" />
        <ellipse cx={centerX} cy={centerY} rx="80" ry="32" stroke="#7AD0E8" strokeWidth="1" opacity=".2" />
        <ellipse cx={centerX} cy={centerY} rx="32" ry="80" stroke="#7AD0E8" strokeWidth="1" opacity=".2" />

        {/* Dynamic Fluid Hexagon Simulation (Mode 6 perturbation) */}
        <path 
          d={(() => {
            const numPoints = 120;
            let pts = [];
            for(let i=0; i<=numPoints; i++){
              let t = (i/numPoints) * 2 * Math.PI;
              let r = 75 + 4 * Math.cos(6 * t);
              let x = (centerX + r*Math.cos(t)).toFixed(3);
              let y = (centerY + r*Math.sin(t)).toFixed(3);
              pts.push(`${i===0?'M':'L'} ${x} ${y}`);
            }
            return pts.join(' ') + ' Z';
          })()}
          stroke="#7AD0E8" strokeWidth="1.5" fill="rgba(122,208,232,0.06)"
          style={{ transformOrigin: "center", transformBox: "fill-box", animation: "orbitSpin 45s linear infinite" }}
        />
        <path 
          d={(() => {
            const numPoints = 120;
            let pts = [];
            for(let i=0; i<=numPoints; i++){
              let t = (i/numPoints) * 2 * Math.PI;
              let r = 66 + 3.5 * Math.cos(6 * t);
              let x = (centerX + r*Math.cos(t)).toFixed(3);
              let y = (centerY + r*Math.sin(t)).toFixed(3);
              pts.push(`${i===0?'M':'L'} ${x} ${y}`);
            }
            return pts.join(' ') + ' Z';
          })()}
          stroke="#7AD0E8" strokeWidth="1" fill="rgba(122,208,232,0.04)"
          style={{ transformOrigin: "center", transformBox: "fill-box", animation: "orbitSpin 35s linear infinite" }}
        />
        <path 
          d={(() => {
            const numPoints = 120;
            let pts = [];
            for(let i=0; i<=numPoints; i++){
              let t = (i/numPoints) * 2 * Math.PI;
              let r = 58 + 2.5 * Math.cos(6 * t);
              let x = (centerX + r*Math.cos(t)).toFixed(3);
              let y = (centerY + r*Math.sin(t)).toFixed(3);
              pts.push(`${i===0?'M':'L'} ${x} ${y}`);
            }
            return pts.join(' ') + ' Z';
          })()}
          stroke="#7AD0E8" strokeWidth="0.8" fill="rgba(122,208,232,0.02)"
          style={{ transformOrigin: "center", transformBox: "fill-box", animation: "orbitSpin 25s linear infinite" }}
        />
        
        {/* Fast central circular vortex (Moved to logo border) */}


        {/* Dashed lines from center to each platform */}
        {platforms.map((p, i) => {
          const angle = (2 * Math.PI * i) / count - Math.PI / 2;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          return (
            <line
              key={p.name}
              x1={centerX}
              y1={centerY}
              x2={x}
              y2={y}
              stroke={p.color}
              strokeWidth="1.5"
              strokeDasharray="4 6"
              opacity=".45"
              style={{ animation: "dashFlow 1.5s linear infinite" }}
            />
          );
        })}

        {/* Center glow removed */}
      </svg>

      {/* Platform icons positioned around the globe */}
      {platforms.map((p, i) => {
        const angle = (2 * Math.PI * i) / count - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        return (
          <div
            key={p.name}
            className="absolute flex flex-col items-center gap-1.5 group"
            style={{
              left: `${(x / canvasSize) * 100}%`,
              top: `${(y / canvasSize) * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full transition-all duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-1"
              style={{
                color: p.color,
                background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: `2.5px solid ${p.color}60`,
                boxShadow: `0 4px 16px ${p.color}25`,
              }}
            >
              {p.icon}
            </div>
            <span className="text-xs font-semibold whitespace-nowrap" style={{ color: "#A8B8C8" }}>
              {p.name}
            </span>
          </div>
        );
      })}

      {/* Center Posty Logo */}
      <div
        className="absolute flex items-center justify-center rounded-full"
        style={{
          width: "11%",
          height: "11%",
          left: `${(centerX / canvasSize) * 100}%`,
          top: `${(centerY / canvasSize) * 100}%`,
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Pulsating glow behind logo */}
        <div className="absolute inset-0 rounded-full" style={{ background: "rgba(122,208,232,0.1)", backdropFilter: "blur(4px)", animation: "softPulse 5s ease-in-out infinite" }} />

        {/* Logo Image */}
        <img src="/postylogo2.png" alt="Posty" className="relative w-full h-full object-cover rounded-full shadow-lg" />

        {/* Rotating dashed ring — sits exactly on the logo edge */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            outline: "3px dashed rgba(122,208,232,0.7)",
            outlineOffset: "0px",
            animation: "orbitSpin 15s linear infinite",
          }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════════════════════════════ */
export default function FlowSection() {
  return (
    <>
      <style>{css}</style>

      <div
        className="relative rounded-3xl overflow-hidden py-14 px-4 md:px-8 max-w-4xl mx-auto"
        style={{
          background: "linear-gradient(135deg, rgba(245,248,252,0.05) 0%, rgba(212,234,245,0.07) 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(122,208,232,0.05) 0%, transparent 65%)",
          }}
        />

        {/* ── GLOBE WITH ALL PLATFORMS ── */}
        <div className="relative flex flex-col items-center justify-center w-full mx-auto pb-8">
          <GlobeWithPlatforms />
        </div>



        {/* ── TAGLINE ── */}
        <p
          className="relative mt-8 text-center text-lg md:text-xl font-bold tracking-tight"
          style={{ color: "#A8B8C8" }}
        >
          Tu contenido fluye a todas las redes con un solo clic.
        </p>
      </div>
    </>
  );
}
