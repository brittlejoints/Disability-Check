import * as React from 'react';

/**
 * MOODBOARD IMPLEMENTATION:
 * These illustrations use the "Geometric Mosaic" style:
 * - Segmented circles and triangles
 * - High-contrast thin black outlines
 * - Vibrant secondary palette (Yellow, Teal, Purple) to complement the app's Burgundy/Coral
 */

interface IllustrationProps {
  className?: string;
  ariaLabel: string;
}

export const HeroMosaic: React.FC<IllustrationProps> = ({ className, ariaLabel }) => (
  <svg 
    viewBox="0 0 800 600" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    role="img"
    aria-label={ariaLabel}
  >
    <defs>
      <clipPath id="clipHero">
        <rect width="800" height="600" rx="40" />
      </clipPath>
    </defs>
    <g clipPath="url(#clipHero)">
      {/* Background segments */}
      <rect width="400" height="600" fill="#FFE5D9" fillOpacity="0.3" />
      <rect x="400" width="400" height="600" fill="#FFF5F2" />
      
      {/* Mosaic Path Segments - Right Side */}
      <path d="M400 0L800 400V600L400 200V0Z" fill="#E67E50" fillOpacity="0.1" />
      <path d="M800 0L400 400H600L800 200V0Z" fill="#FACC15" fillOpacity="0.2" />
      
      {/* Abstract Circular Elements (from moodboard) */}
      <circle cx="200" cy="200" r="120" stroke="#2D1B1F" strokeWidth="0.5" strokeDasharray="4 4" />
      <circle cx="200" cy="200" r="80" fill="#4A1520" fillOpacity="0.05" stroke="#2D1B1F" strokeWidth="1" />
      
      {/* Segmented Sun/Focus Point */}
      <g className="animate-pulse" style={{ animationDuration: '4s' }}>
        <path d="M600 150C600 122.386 622.386 100 650 100V150H600Z" fill="#E67E50" stroke="#2D1B1F" strokeWidth="1" />
        <path d="M650 100C677.614 100 700 122.386 700 150H650V100Z" fill="#FACC15" stroke="#2D1B1F" strokeWidth="1" />
        <path d="M700 150C700 177.614 677.614 200 650 200V150H700Z" fill="#4A7C9C" stroke="#2D1B1F" strokeWidth="1" />
        <path d="M650 200C622.386 200 600 177.614 600 150H650V200Z" fill="#4A1520" stroke="#2D1B1F" strokeWidth="1" />
      </g>
      
      {/* The "Path" triangles */}
      <path d="M0 600L200 400H400L200 600H0Z" fill="#4A7C9C" fillOpacity="0.1" stroke="#2D1B1F" strokeWidth="0.5" />
      
      {/* Small floating accents */}
      <rect x="100" y="450" width="40" height="40" rx="20" fill="#C95233" stroke="#2D1B1F" strokeWidth="1" className="animate-bounce" style={{ animationDuration: '3s' }} />
      <path d="M500 450L540 450L520 485L500 450Z" fill="#6B9E78" stroke="#2D1B1F" strokeWidth="1" />
    </g>
    <rect width="800" height="600" rx="40" stroke="#2D1B1F" strokeWidth="1" fill="none" opacity="0.1" />
  </svg>
);

export const InclusionMosaic: React.FC<IllustrationProps> = ({ className, ariaLabel }) => (
  <svg 
    viewBox="0 0 400 400" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    role="img"
    aria-label={ariaLabel}
  >
    {/* Background Grid */}
    <rect width="400" height="400" fill="white" />
    <line x1="200" y1="0" x2="200" y2="400" stroke="#D4B5A7" strokeWidth="0.5" />
    <line x1="0" y1="200" x2="400" y2="200" stroke="#D4B5A7" strokeWidth="0.5" />
    
    {/* Stylized Person in Wheelchair (Profile, like moodboard) */}
    <g transform="translate(120, 150)">
      {/* The Wheel - Mosaic Style */}
      <circle cx="40" cy="100" r="50" stroke="#2D1B1F" strokeWidth="1.5" />
      <path d="M40 50C67.6142 50 90 72.3858 90 100H40V50Z" fill="#FACC15" stroke="#2D1B1F" strokeWidth="1" />
      <circle cx="40" cy="100" r="15" fill="white" stroke="#2D1B1F" strokeWidth="1" />
      
      {/* Frame */}
      <path d="M40 50V20H100V80" stroke="#2D1B1F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* The Person */}
      <rect x="60" y="0" width="25" height="60" rx="12" fill="#E67E50" stroke="#2D1B1F" strokeWidth="1.5" />
      <circle cx="72.5" cy="-20" r="15" fill="#4A1520" stroke="#2D1B1F" strokeWidth="1.5" />
    </g>
    
    {/* Rainbow/Path Elements */}
    <path d="M0 400C0 300 100 200 200 200" stroke="#4A7C9C" strokeWidth="8" strokeLinecap="round" strokeDasharray="1 15" />
    <circle cx="350" cy="50" r="30" fill="#6B9E78" fillOpacity="0.2" stroke="#6B9E78" strokeWidth="1" />
  </svg>
);

export const ServiceMosaic: React.FC<IllustrationProps> = ({ className, ariaLabel }) => (
  <svg 
    viewBox="0 0 400 400" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    role="img"
    aria-label={ariaLabel}
  >
    {/* Mosaic Background */}
    <rect width="200" height="200" fill="#FACC15" fillOpacity="0.1" />
    <rect x="200" width="200" height="200" fill="#4A1520" fillOpacity="0.05" />
    <rect y="200" width="200" height="200" fill="#E67E50" fillOpacity="0.05" />
    
    {/* Communication/Guide Theme (Dog/Phone) */}
    <g transform="translate(100, 100)">
      {/* Abstract Phone/Guide Hand */}
      <rect x="50" y="20" width="100" height="180" rx="10" stroke="#2D1B1F" strokeWidth="2" fill="white" />
      <rect x="60" y="40" width="80" height="110" rx="4" fill="#FFE5D9" />
      
      {/* Segmented Screen Circles */}
      <circle cx="80" cy="170" r="10" fill="#E67E50" stroke="#2D1B1F" strokeWidth="1" />
      <circle cx="110" cy="170" r="10" fill="#FACC15" stroke="#2D1B1F" strokeWidth="1" />
    </g>
    
    {/* Geometric Leaf Accents */}
    <path d="M300 300C300 244.772 344.772 200 400 200V300H300Z" fill="#6B9E78" stroke="#2D1B1F" strokeWidth="1" />
  </svg>
);