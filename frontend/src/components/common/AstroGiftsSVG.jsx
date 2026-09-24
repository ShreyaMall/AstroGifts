import React from 'react';

const AstroGiftsSVG = ({ height = 48, mode = 'light', className = '', layout = 'horizontal' }) => {
  // mode: 'light' (header) or 'dark' (footer)
  const astroColor = mode === 'dark' ? '#faf4eb' : '#2c1510';
  const goldStop1  = mode === 'dark' ? '#f5d77f' : '#e2ba54';
  const goldStop2  = mode === 'dark' ? '#e2a731' : '#c59b27';
  const goldStop3  = mode === 'dark' ? '#b8860b' : '#8b6508';

  const uniqueId = React.useId().replace(/:/g, '');

  if (layout === 'stacked') {
    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 240 170" 
        style={{ height, width: 'auto', display: 'block' }}
        className={`astrogifts-svg-logo ${className}`}
      >
        <defs>
          <linearGradient id={`goldGrad-s-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={goldStop1} />
            <stop offset="45%" stopColor={goldStop2} />
            <stop offset="100%" stopColor={goldStop3} />
          </linearGradient>
          <linearGradient id={`sparkleGrad-s-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff4d0" />
            <stop offset="100%" stopColor="#d4af37" />
          </linearGradient>
        </defs>

        {/* Centered Gift Icon */}
        <g transform="translate(70, 4) scale(0.95)">
          <path d="M44 26 C35 14, 46 12, 50 24 C54 12, 65 14, 56 26 Z" fill="none" stroke={`url(#goldGrad-s-${uniqueId})`} strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M33 32 L67 32 L65 41 L35 41 Z" fill="none" stroke={`url(#goldGrad-s-${uniqueId})`} strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M37 41 L39 67 C39 70, 61 70, 61 67 L63 41" fill="none" stroke={`url(#goldGrad-s-${uniqueId})`} strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M50 32 L50 68" stroke={`url(#goldGrad-s-${uniqueId})`} strokeWidth="3.2" strokeLinecap="round"/>
          <path d="M26 65 C 22 84, 52 87, 77 62 C 86 51, 87 36, 77 31" fill="none" stroke={`url(#goldGrad-s-${uniqueId})`} strokeWidth="3.8" strokeLinecap="round"/>
          <path d="M80 20 Q80 26 86 26 Q80 26 80 32 Q80 26 74 26 Q80 26 80 20 Z" fill={`url(#sparkleGrad-s-${uniqueId})`} />
          <path d="M22 48 Q22 52 26 52 Q22 52 22 56 Q22 52 18 52 Q22 52 22 48 Z" fill={`url(#sparkleGrad-s-${uniqueId})`} />
          <path d="M75 60 Q75 63 78 63 Q75 63 75 66 Q75 63 72 63 Q75 63 75 60 Z" fill={`url(#sparkleGrad-s-${uniqueId})`} />
          <path d="M62 75 Q62 77 64 77 Q62 77 62 79 Q62 77 60 77 Q62 77 62 75 Z" fill={`url(#sparkleGrad-s-${uniqueId})`} />
        </g>

        {/* Text Below */}
        <g transform="translate(120, 140)">
          <text fontFamily="'Dancing Script', 'Great Vibes', cursive, serif" fontSize="46" fontWeight="700" textAnchor="middle">
            <tspan fill={astroColor}>Astro</tspan>
            <tspan fill={`url(#goldGrad-s-${uniqueId})`} dx="4">Gifts</tspan>
          </text>
        </g>
      </svg>
    );
  }

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 315 65" 
      style={{ height, width: 'auto', display: 'block' }}
      className={`astrogifts-svg-logo ${className}`}
    >
      <defs>
        <linearGradient id={`goldGrad-h-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={goldStop1} />
          <stop offset="45%" stopColor={goldStop2} />
          <stop offset="100%" stopColor={goldStop3} />
        </linearGradient>
        <linearGradient id={`sparkleGrad-h-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff4d0" />
          <stop offset="100%" stopColor="#d4af37" />
        </linearGradient>
      </defs>

      {/* ── LOGO ICON ── */}
      <g transform="translate(4, 2) scale(0.62)">
        <path d="M44 26 C35 14, 46 12, 50 24 C54 12, 65 14, 56 26 Z" fill="none" stroke={`url(#goldGrad-h-${uniqueId})`} strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M33 32 L67 32 L65 41 L35 41 Z" fill="none" stroke={`url(#goldGrad-h-${uniqueId})`} strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M37 41 L39 67 C39 70, 61 70, 61 67 L63 41" fill="none" stroke={`url(#goldGrad-h-${uniqueId})`} strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M50 32 L50 68" stroke={`url(#goldGrad-h-${uniqueId})`} strokeWidth="3.2" strokeLinecap="round"/>
        <path d="M26 65 C 22 84, 52 87, 77 62 C 86 51, 87 36, 77 31" fill="none" stroke={`url(#goldGrad-h-${uniqueId})`} strokeWidth="3.8" strokeLinecap="round"/>
        <path d="M80 20 Q80 26 86 26 Q80 26 80 32 Q80 26 74 26 Q80 26 80 20 Z" fill={`url(#sparkleGrad-h-${uniqueId})`} />
        <path d="M22 48 Q22 52 26 52 Q22 52 22 56 Q22 52 18 52 Q22 52 22 48 Z" fill={`url(#sparkleGrad-h-${uniqueId})`} />
        <path d="M75 60 Q75 63 78 63 Q75 63 75 66 Q75 63 72 63 Q75 63 75 60 Z" fill={`url(#sparkleGrad-h-${uniqueId})`} />
        <path d="M62 75 Q62 77 64 77 Q62 77 62 79 Q62 77 60 77 Q62 77 62 75 Z" fill={`url(#sparkleGrad-h-${uniqueId})`} />
      </g>

      {/* ── LOGO TEXT (Astro + Gifts with tspan dx="4" for 0 overlap) ── */}
      <g transform="translate(68, 46)">
        <text fontFamily="'Dancing Script', 'Great Vibes', cursive, serif" fontSize="42" fontWeight="700" letterSpacing="-0.5">
          <tspan fill={astroColor}>Astro</tspan>
          <tspan fill={`url(#goldGrad-h-${uniqueId})`} dx="4">Gifts</tspan>
        </text>
      </g>
    </svg>
  );
};

export default AstroGiftsSVG;
