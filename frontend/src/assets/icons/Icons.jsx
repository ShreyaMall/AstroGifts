import React from 'react';
import { 
  Search, Heart, User, ShoppingCart, Home,
  Gift, ShoppingBag, Star, Gamepad2, Baby,
  CircleDot, Gem, Sparkles
} from 'lucide-react';

export const FacebookIcon = () => (
  <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="18" r="18" fill="#1877F2"/>
    <path d="M22.8 18H20.1V28.5H15.8V18H13.8V14.3H15.8V11.9C15.8 9.1 17.1 7.4 20.5 7.4H23.4V11H21.6C20.3 11 20.1 11.5 20.1 12.5V14.3H23.4L22.8 18Z" fill="white"/>
  </svg>
);

export const InstagramIcon = () => (
  <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ig-grad" x1="18" y1="36" x2="18" y2="0" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F58529" />
        <stop offset="0.33" stopColor="#FEDA77" />
        <stop offset="0.66" stopColor="#DD2A7B" />
        <stop offset="1" stopColor="#8134AF" />
      </linearGradient>
    </defs>
    <circle cx="18" cy="18" r="18" fill="url(#ig-grad)"/>
    <path d="M23 10H13C11.3 10 10 11.3 10 13V23C10 24.7 11.3 26 13 26H23C24.7 26 26 24.7 26 23V13C26 11.3 24.7 10 23 10ZM24.4 23C24.4 23.8 23.8 24.4 23 24.4H13C12.2 24.4 11.6 23.8 11.6 23V13C11.6 12.2 12.2 11.6 13 11.6H23C23.8 11.6 24.4 12.2 24.4 13V23Z" fill="white"/>
    <path d="M18 13.8C15.7 13.8 13.8 15.7 13.8 18C13.8 20.3 15.7 22.2 18 22.2C20.3 22.2 22.2 20.3 22.2 18C22.2 15.7 20.3 13.8 18 13.8ZM18 20.6C16.6 20.6 15.4 19.4 15.4 18C15.4 16.6 16.6 15.4 18 15.4C19.4 15.4 20.6 16.6 20.6 18C20.6 19.4 19.4 20.6 18 20.6Z" fill="white"/>
    <circle cx="22.6" cy="13.4" r="1" fill="white"/>
  </svg>
);

export const TwitterIcon = () => (
  <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="18" r="18" fill="#1DA1F2"/>
    <path d="M26 12.4C25.4 12.7 24.7 12.9 24 13C24.8 12.5 25.3 11.8 25.6 11C24.9 11.4 24.1 11.7 23.3 11.9C22.6 11.1 21.6 10.7 20.5 10.7C18.4 10.7 16.6 12.5 16.6 14.7C16.6 15 16.6 15.3 16.7 15.6C13.4 15.4 10.5 13.8 8.6 11.4C8.2 12 8 12.7 8 13.4C8 14.8 8.7 16 9.8 16.7C9.2 16.7 8.7 16.5 8.2 16.2V16.2C8.2 18 9.4 19.5 11 19.8C10.7 19.9 10.3 19.9 10 19.9C9.8 19.9 9.6 19.9 9.3 19.8C9.8 21.2 11.2 22.3 12.8 22.3C11.6 23.3 10 23.9 8.3 23.9C8 23.9 7.7 23.9 7.4 23.8C9 24.9 10.9 25.5 13 25.5C19.7 25.5 23.4 19.9 23.4 15.1C23.4 14.9 23.4 14.8 23.4 14.6C24.2 14.1 24.8 13.3 25.3 12.5L26 12.4Z" fill="white"/>
  </svg>
);

export const WhatsappIcon = () => (
  <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="18" r="18" fill="#25D366"/>
    <path d="M18.1 9C13.2 9 9.1 13 9.1 18C9.1 19.9 9.7 21.7 10.7 23.2L9.4 27L13.4 25.8C14.8 26.6 16.4 27.1 18.1 27.1C23 27.1 27.1 23.1 27.1 18.1C27.1 13.2 23 9 18.1 9ZM18.1 25.6C16.6 25.6 15.2 25.2 14 24.5L13.7 24.3L11.3 25L12 22.8L11.8 22.5C11 21.2 10.6 19.7 10.6 18.1C10.6 13.9 14 10.5 18.2 10.5C22.4 10.5 25.7 13.9 25.7 18.1C25.6 22.3 22.2 25.6 18.1 25.6ZM22.2 20C22 19.9 20.9 19.4 20.7 19.3C20.5 19.2 20.4 19.1 20.2 19.4C20 19.6 19.6 20.1 19.5 20.2C19.4 20.4 19.2 20.4 19 20.3C18.8 20.2 18 19.9 17.1 19.1C16.4 18.5 15.9 17.7 15.8 17.5C15.7 17.3 15.8 17.2 15.9 17.1C16 17 16.1 16.9 16.2 16.8C16.3 16.7 16.3 16.6 16.4 16.4C16.5 16.2 16.4 16.1 16.4 16C16.3 15.9 15.8 14.7 15.6 14.2C15.4 13.7 15.2 13.8 15.1 13.8C15 13.8 14.9 13.8 14.7 13.8C14.6 13.8 14.4 13.9 14.2 14.1C14 14.3 13.5 14.8 13.5 15.8C13.5 16.8 14.2 17.8 14.3 17.9C14.4 18 15.8 20.2 18 21.1C18.5 21.3 18.9 21.5 19.3 21.6C19.8 21.8 20.3 21.7 20.7 21.6C21.2 21.5 22 21 22.2 20.5C22.4 20 22.4 19.6 22.3 19.5C22.3 19.5 22.2 19.4 22.2 20Z" fill="white"/>
  </svg>
);

export const YoutubeIcon = () => (
  <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="18" r="18" fill="#FF0000"/>
    <path d="M25 13.8C25 13.8 24.8 12.3 24.1 11.6C23.2 10.7 22.2 10.7 21.7 10.6C18.9 10.4 18 10.4 18 10.4C18 10.4 17.1 10.4 14.3 10.6C13.8 10.7 12.8 10.7 11.9 11.6C11.2 12.3 11 13.8 11 13.8C11 13.8 10.8 15.6 10.8 17.3V18.7C10.8 20.4 11 22.2 11 22.2C11 22.2 11.2 23.7 11.9 24.4C12.8 25.3 14 25.3 14.5 25.4C16.1 25.5 18 25.6 18 25.6C18 25.6 20.9 25.6 21.7 25.4C22.2 25.3 23.2 25.3 24.1 24.4C24.8 23.7 25 22.2 25 22.2C25 22.2 25.2 20.4 25.2 18.7V17.3C25.2 15.6 25 13.8 25 13.8ZM16.5 20.9V14.1L21.3 17.5L16.5 20.9Z" fill="white"/>
  </svg>
);

export const HomeIcon    = () => <Home size={20} />;
export const SearchIcon  = () => <Search size={20} />;
export const WishlistIcon= () => <Heart size={20} />;
export const UserIcon    = () => <User size={20} />;
export const CartIcon    = () => <ShoppingCart size={20} />;

// ── Gift Store Category Icons ──
export const GiftIcon        = () => <Gift size={20} />;
export const ToysIcon        = () => <Gamepad2 size={20} />;
export const AstrologyIcon   = () => <Star size={20} />;
export const DiwaliIcon      = () => <Sparkles size={20} />;
export const BirthdayIcon    = () => <Gift size={20} />;
export const HeartIcon       = () => <Heart size={20} />;
export const SoftToyIcon     = () => <Baby size={20} />;
export const BabyIcon        = () => <Baby size={20} />;
export const BoardGameIcon   = () => <Gamepad2 size={20} />;
export const RingIcon        = () => <CircleDot size={20} />;
export const PendantIcon     = () => <Gem size={20} />;
export const BraceletIcon    = () => <CircleDot size={20} />;
export const GemstoneIcon    = () => <Gem size={20} />;

// Legacy aliases (kept for any other file that may import them)
export const ChairIcon    = () => <Gift size={20} />;
export const TableIcon    = () => <ShoppingBag size={20} />;
export const SofaIcon     = () => <Gift size={20} />;
export const ArmchairIcon = () => <Gift size={20} />;
export const BedIcon      = () => <Gift size={20} />;
export const StorageIcon  = () => <ShoppingBag size={20} />;
export const TextilesIcon = () => <Gift size={20} />;
export const LightingIcon = () => <Sparkles size={20} />;
export const DecorIcon    = () => <Sparkles size={20} />;

export const LogoIcon = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="astro-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e5be56" />
        <stop offset="50%" stopColor="#c59b27" />
        <stop offset="100%" stopColor="#8b6508" />
      </linearGradient>
      <linearGradient id="astro-sparkle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fff2c2" />
        <stop offset="100%" stopColor="#d4af37" />
      </linearGradient>
    </defs>
    
    {/* Ribbon Bow top */}
    <path d="M44 26 C35 14, 46 12, 50 24 C54 12, 65 14, 56 26 Z" fill="none" stroke="url(#astro-gold-grad)" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round"/>
    
    {/* Gift Box Lid */}
    <path d="M33 32 L67 32 L65 41 L35 41 Z" fill="none" stroke="url(#astro-gold-grad)" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round"/>
    
    {/* Gift Box Body */}
    <path d="M37 41 L39 67 C39 70, 61 70, 61 67 L63 41" fill="none" stroke="url(#astro-gold-grad)" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round"/>
    
    {/* Center Vertical Ribbon */}
    <path d="M50 32 L50 68" stroke="url(#astro-gold-grad)" strokeWidth="3.2" strokeLinecap="round"/>
    
    {/* Celestial Orbital Swoosh */}
    <path d="M26 65 C 22 84, 52 87, 77 62 C 86 51, 87 36, 77 31" fill="none" stroke="url(#astro-gold-grad)" strokeWidth="3.8" strokeLinecap="round"/>
    
    {/* Sparkles / Stars */}
    {/* Top Right Sparkle */}
    <path d="M80 20 Q80 26 86 26 Q80 26 80 32 Q80 26 74 26 Q80 26 80 20 Z" fill="url(#astro-sparkle-grad)" />
    {/* Left Sparkle */}
    <path d="M22 48 Q22 52 26 52 Q22 52 22 56 Q22 52 18 52 Q22 52 22 48 Z" fill="url(#astro-sparkle-grad)" />
    {/* Bottom Right Sparkle */}
    <path d="M75 60 Q75 63 78 63 Q75 63 75 66 Q75 63 72 63 Q75 63 75 60 Z" fill="url(#astro-sparkle-grad)" />
    {/* Small Bottom Sparkle */}
    <path d="M62 75 Q62 77 64 77 Q62 77 62 79 Q62 77 60 77 Q62 77 62 75 Z" fill="url(#astro-sparkle-grad)" />
  </svg>
);

export const GooglePlayBadge = () => (
  <svg width="135" height="40" viewBox="0 0 135 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ cursor: 'pointer' }}>
    <rect width="135" height="40" rx="5" fill="#1A1A1A"/>
    <path d="M9.835 10.155c-.244.258-.385.626-.385 1.135v17.42c0 .509.141.877.385 1.135l.056.056 9.805-9.806v-.18l-9.805-9.806-.056.046z" fill="#4285F4"/>
    <path d="M22.905 23.155l-3.21-3.21v-.18l3.21-3.21.075.042 3.826 2.176c1.09.619 1.09 1.636 0 2.256l-3.826 2.175-.075-.049z" fill="#FBBC04"/>
    <path d="M23.065 23.064l-3.37-3.37-9.86 9.86c.328.347.863.394 1.482.042l11.748-6.532z" fill="#EA4335"/>
    <path d="M23.065 16.936l-11.748-6.532c-.619-.352-1.154-.305-1.482.042l9.86 9.86 3.37-3.37z" fill="#34A853"/>
    <text x="38" y="15" fill="#fff" fontSize="9" fontFamily="sans-serif" letterSpacing="0.2">GET IT ON</text>
    <text x="37" y="30" fill="#fff" fontSize="16" fontWeight="600" fontFamily="sans-serif">Google Play</text>
  </svg>
);

export const AppStoreBadge = () => (
  <svg width="135" height="40" viewBox="0 0 135 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ cursor: 'pointer', marginLeft: '10px' }}>
    <rect width="135" height="40" rx="5" fill="#1A1A1A"/>
    <path d="M22.7 18.2c0-2.3 1.9-3.4 1.9-3.4-1.1-1.6-2.7-1.8-3.3-1.8-1.4-.1-2.7.8-3.5.8-.7 0-1.7-.8-2.9-.8-1.5 0-3 .9-3.8 2.3-1.6 2.9-.4 7.2 1.2 9.5.8 1.1 1.7 2.4 2.9 2.4 1.1-.1 1.6-.8 3-.8s1.8.8 3 .8c1.3 0 2.1-1.2 2.9-2.3.9-1.3 1.3-2.6 1.3-2.6-.1-.1-2.7-1-2.7-4.1zm-1.9-5.3c.6-.8 1-1.9.9-3-.9.1-2.1.6-2.7 1.4-.6.7-1.1 1.8-.9 2.9 1 .1 2-.5 2.7-1.3z" fill="#fff"/>
    <text x="39" y="14" fill="#fff" fontSize="9" fontFamily="sans-serif">Download on the</text>
    <text x="38" y="30" fill="#fff" fontSize="16" fontWeight="600" fontFamily="sans-serif">App Store</text>
  </svg>
);
