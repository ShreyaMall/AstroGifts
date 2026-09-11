import React from 'react';
import { 
  Search, Heart, User, ShoppingCart, 
  Armchair, Box, Bed, Archive, Shirt, 
  Lightbulb, Gamepad2, Image 
} from 'lucide-react';

export const FacebookIcon = () => <span>FB</span>;
export const TwitterIcon = () => <span>TW</span>;
export const InstagramIcon = () => <span>IG</span>;
export const YoutubeIcon = () => <span>YT</span>;

export const SearchIcon = () => <Search size={20} />;
export const WishlistIcon = () => <Heart size={20} />;
export const UserIcon = () => <User size={20} />;
export const CartIcon = () => <ShoppingCart size={20} />;
export const ChairIcon = () => <Armchair size={20} />;
export const TableIcon = () => <Box size={20} />;
export const SofaIcon = () => <Armchair size={20} />;
export const ArmchairIcon = () => <Armchair size={20} />;
export const BedIcon = () => <Bed size={20} />;
export const StorageIcon = () => <Archive size={20} />;
export const TextilesIcon = () => <Shirt size={20} />;
export const LightingIcon = () => <Lightbulb size={20} />;
export const ToysIcon = () => <Gamepad2 size={20} />;
export const DecorIcon = () => <Image size={20} />;

export const LogoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="10" height="10" fill="#b08655"/>
    <rect x="14" y="0" width="10" height="10" fill="#84af46"/>
    <rect x="0" y="14" width="10" height="10" fill="#a5a5a5"/>
    <rect x="14" y="14" width="10" height="10" fill="#e2a731"/>
  </svg>
);

export const GooglePlayBadge = () => (
  <div style={{ display: 'inline-block', padding: '5px 10px', background: '#000', color: '#fff', borderRadius: '5px' }}>
    Google Play
  </div>
);

export const AppStoreBadge = () => (
  <div style={{ display: 'inline-block', padding: '5px 10px', background: '#000', color: '#fff', borderRadius: '5px', marginLeft: '5px' }}>
    App Store
  </div>
);
