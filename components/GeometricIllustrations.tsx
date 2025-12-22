import * as React from 'react';

/**
 * MODULAR PLOT SYSTEM
 * Re-imagined as high-end editorial mosaic tiles.
 * Features: Grainy textures, segmented backgrounds, human-natural themes.
 */

const GrainFilter = ({ id }: { id: string }) => (
  <filter id={id}>
    <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
    <feComposite operator="in" in2="SourceGraphic" />
  </filter>
);

interface PlotProps {
  className?: string;
  ariaLabel: string;
}

/**
 * THE PROTECTIVE PLOT (Umbrella & Progress)
 * Inspired by the "person in wheelchair under umbrella" reference.
 */
export const ProtectivePlot: React.FC<PlotProps> = ({ className, ariaLabel }) => (
  <svg viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-label={ariaLabel}>
    <defs><GrainFilter id="grain-protective" /></defs>
    <rect width="400" height="600" fill="#FFF5F2" />
    
    <g filter="url(#grain-protective)">
      {/* Background Segments */}
      <path d="M0 0H200V600H0V0Z" fill="#FFE5D9" fillOpacity="0.4" />
      <path d="M200 300H400V600H200V300Z" fill="#4A7C9C" fillOpacity="0.1" />
      
      {/* The Umbrella */}
      <g transform="translate(40, 60)">
        <path d="M10 140C10 62.6801 72.6801 0 150 0C227.32 0 290 62.6801 290 140H10Z" fill="#E67E50" />
        <path d="M80 0V140" stroke="#FFF5F2" strokeWidth="1" opacity="0.3" />
        <path d="M150 0V140" stroke="#FFF5F2" strokeWidth="1" opacity="0.3" />
        <path d="M220 0V140" stroke="#FFF5F2" strokeWidth="1" opacity="0.3" />
        <rect x="145" y="140" width="10" height="360" fill="#2D1B1F" />
      </g>
      
      {/* The Person (Wheelchair Stylized) */}
      <g transform="translate(100, 320)">
        <circle cx="100" cy="50" r="30" fill="#4A1520" />
        <path d="M50 160V100C50 85 65 80 80 80H120C135 80 150 85 150 100V160" stroke="#2D1B1F" strokeWidth="12" strokeLinecap="round" />
        <circle cx="100" cy="180" r="70" stroke="#2D1B1F" strokeWidth="12" />
        <path d="M100 110V250" stroke="#2D1B1F" strokeWidth="12" strokeLinecap="round" />
      </g>

      {/* Ground Segments */}
      <rect x="0" y="550" width="400" height="50" fill="#4A1520" />
      <path d="M0 550L400 450V550H0Z" fill="#C95233" fillOpacity="0.2" />
    </g>
  </svg>
);

/**
 * THE JOURNEY PLOT (Night & Guidance)
 * Inspired by the "blind person with dog under moon" reference.
 */
export const JourneyPlot: React.FC<PlotProps> = ({ className, ariaLabel }) => (
  <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-label={ariaLabel}>
    <defs><GrainFilter id="grain-journey" /></defs>
    <rect width="400" height="400" fill="#2D1B1F" />
    
    <g filter="url(#grain-journey)">
      {/* Night Sky Segments */}
      <path d="M0 0H400V200H0V0Z" fill="#1A0F11" />
      <circle cx="320" cy="80" r="45" fill="#FACC15" />
      <circle cx="295" cy="70" r="45" fill="#1A0F11" />
      
      {/* Path */}
      <path d="M0 300H400V400H0V300Z" fill="#FFE5D9" fillOpacity="0.2" />
      <path d="M0 320L400 380V400H0V320Z" fill="#FFE5D9" fillOpacity="0.1" />

      {/* Stylized Figure */}
      <g transform="translate(120, 150)">
        <path d="M40 0C51 0 60 9 60 20V150H20V20C20 9 29 0 40 0Z" fill="white" />
        <path d="M40 150L10 230" stroke="white" strokeWidth="8" strokeLinecap="round" />
        {/* The Dog */}
        <rect x="70" y="120" width="60" height="30" rx="4" fill="white" />
        <circle cx="120" cy="115" r="8" fill="white" />
        <rect x="80" y="150" width="8" height="20" fill="white" />
        <rect x="110" y="150" width="8" height="20" fill="white" />
      </g>
    </g>
  </svg>
);

/**
 * THE CONNECTION PLOT (Hand & Device)
 * Inspired by the "hand holding phone with chart" reference.
 */
export const ConnectionPlot: React.FC<PlotProps> = ({ className, ariaLabel }) => (
  <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-label={ariaLabel}>
    <defs><GrainFilter id="grain-connection" /></defs>
    <rect width="400" height="400" fill="#FFF5F2" />
    
    <g filter="url(#grain-connection)">
      {/* Grid Pattern */}
      <path d="M0 100H400" stroke="#D4B5A7" strokeWidth="0.5" />
      <path d="M0 200H400" stroke="#D4B5A7" strokeWidth="0.5" />
      <path d="M0 300H400" stroke="#D4B5A7" strokeWidth="0.5" />
      <path d="M100 0V400" stroke="#D4B5A7" strokeWidth="0.5" />
      <path d="M200 0V400" stroke="#D4B5A7" strokeWidth="0.5" />
      <path d="M300 0V400" stroke="#D4B5A7" strokeWidth="0.5" />

      {/* Decorative Mosaic Shapes */}
      <path d="M0 0L100 100H0V0Z" fill="#E67E50" fillOpacity="0.1" />
      <circle cx="350" cy="50" r="30" fill="#6B9E78" fillOpacity="0.2" />

      {/* Hand Holding Phone */}
      <g transform="translate(120, 100)">
        {/* The Hand */}
        <path d="M20 280C20 200 60 180 100 180C140 180 180 200 180 280" fill="#4A1520" stroke="#2D1B1F" strokeWidth="2" />
        
        {/* The Phone */}
        <rect x="25" y="0" width="110" height="220" rx="16" fill="#2D1B1F" />
        <rect x="35" y="15" width="90" height="170" rx="8" fill="white" />
        
        {/* Screen Content - Mosaic/Charts */}
        <rect x="45" y="40" width="30" height="30" fill="#E67E50" fillOpacity="0.8" />
        <circle cx="95" cy="55" r="15" fill="#4A7C9C" fillOpacity="0.8" />
        <rect x="45" y="85" width="70" height="10" rx="2" fill="#4A1520" fillOpacity="0.1" />
        <rect x="45" y="105" width="50" height="10" rx="2" fill="#4A1520" fillOpacity="0.1" />
        
        {/* Finger crossing phone */}
        <path d="M0 150C20 150 40 160 60 160" stroke="#4A1520" strokeWidth="20" strokeLinecap="round" />
      </g>
    </g>
  </svg>
);

/**
 * THE GROWTH PLOT (Plants & Sun)
 * Inspired by the "pills/hand/plants" references.
 */
export const GrowthPlot: React.FC<PlotProps> = ({ className, ariaLabel }) => (
  <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-label={ariaLabel}>
    <defs><GrainFilter id="grain-growth" /></defs>
    <rect width="400" height="400" fill="#6B9E78" fillOpacity="0.1" />
    
    <g filter="url(#grain-growth)">
      <rect x="50" y="300" width="300" height="100" fill="#4A1520" fillOpacity="0.05" />
      
      {/* Plants */}
      <g transform="translate(80, 200)">
        <path d="M20 100V40C20 10 50 10 50 40V100" fill="#6B9E78" stroke="#2D1B1F" strokeWidth="2" />
        <path d="M80 100V20C80 -10 110 -10 110 20V100" fill="#6B9E78" stroke="#2D1B1F" strokeWidth="2" opacity="0.6" />
        <path d="M140 100V60C140 40 170 40 170 60V100" fill="#E67E50" stroke="#2D1B1F" strokeWidth="2" />
      </g>

      {/* Sun */}
      <circle cx="300" cy="100" r="60" fill="#FACC15" />
      <path d="M200 0H400V100L200 0Z" fill="white" fillOpacity="0.2" />
    </g>
  </svg>
);

// Added InclusionMosaic component to fix missing export used in About.tsx
export const InclusionMosaic: React.FC<PlotProps> = ({ className, ariaLabel }) => (
  <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-label={ariaLabel}>
    <defs><GrainFilter id="grain-inclusion" /></defs>
    <rect width="400" height="400" fill="#FFF5F2" />
    <g filter="url(#grain-inclusion)">
      <path d="M0 0H200V200H0V0Z" fill="#E67E50" fillOpacity="0.1" />
      <path d="M200 200H400V400H200V200Z" fill="#4A7C9C" fillOpacity="0.1" />
      <circle cx="200" cy="200" r="100" stroke="#4A1520" strokeWidth="2" strokeDasharray="10 5" />
      <path d="M50 350L350 50" stroke="#C95233" strokeWidth="4" strokeLinecap="round" />
      <rect x="250" y="50" width="80" height="80" rx="40" fill="#FFE5D9" />
    </g>
  </svg>
);