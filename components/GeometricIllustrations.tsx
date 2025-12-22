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
 */
export const ProtectivePlot: React.FC<PlotProps> = ({ className, ariaLabel }) => (
  <svg viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} transition-transform duration-700 hover:scale-[1.02]`} role="img" aria-label={ariaLabel}>
    <defs><GrainFilter id="grain-protective" /></defs>
    <rect width="400" height="600" fill="#FFF5F2" />
    
    <g filter="url(#grain-protective)">
      <path d="M0 0H200V600H0V0Z" fill="#FFE5D9" fillOpacity="0.4" />
      <path d="M200 300H400V600H200V300Z" fill="#4A7C9C" fillOpacity="0.1" />
      
      <g transform="translate(40, 60)">
        <path d="M10 140C10 62.6801 72.6801 0 150 0C227.32 0 290 62.6801 290 140H10Z" fill="#E67E50">
            <animate attributeName="d" dur="10s" repeatCount="indefinite" values="M10 140C10 62.6801 72.6801 0 150 0C227.32 0 290 62.6801 290 140H10Z; M10 140C10 50 72.6801 10 150 10C227.32 10 290 50 290 140H10Z; M10 140C10 62.6801 72.6801 0 150 0C227.32 0 290 62.6801 290 140H10Z" />
        </path>
        <rect x="145" y="140" width="10" height="360" fill="#2D1B1F" />
      </g>
      
      <g transform="translate(100, 320)">
        <circle cx="100" cy="50" r="30" fill="#4A1520" />
        <path d="M50 160V100C50 85 65 80 80 80H120C135 80 150 85 150 100V160" stroke="#2D1B1F" strokeWidth="12" strokeLinecap="round" />
        <circle cx="100" cy="180" r="70" stroke="#2D1B1F" strokeWidth="12" />
      </g>

      <rect x="0" y="550" width="400" height="50" fill="#4A1520" />
    </g>
  </svg>
);

/**
 * THE JOURNEY PLOT (Night & Guidance)
 */
export const JourneyPlot: React.FC<PlotProps> = ({ className, ariaLabel }) => (
  <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} transition-transform duration-700 hover:scale-[1.02]`} role="img" aria-label={ariaLabel}>
    <defs><GrainFilter id="grain-journey" /></defs>
    <rect width="400" height="400" fill="#2D1B1F" />
    
    <g filter="url(#grain-journey)">
      <path d="M0 0H400V200H0V0Z" fill="#1A0F11" />
      <circle cx="320" cy="80" r="45" fill="#FACC15">
         <animate attributeName="opacity" dur="4s" repeatCount="indefinite" values="0.8; 1; 0.8" />
      </circle>
      <circle cx="295" cy="70" r="45" fill="#1A0F11" />
      
      <path d="M0 300H400V400H0V300Z" fill="#FFE5D9" fillOpacity="0.2" />

      <g transform="translate(120, 150)">
        <path d="M40 0C51 0 60 9 60 20V150H20V20C20 9 29 0 40 0Z" fill="white" />
        <path d="M40 150L10 230" stroke="white" strokeWidth="8" strokeLinecap="round" />
        <rect x="70" y="120" width="60" height="30" rx="4" fill="white" />
        <circle cx="120" cy="115" r="8" fill="white" />
      </g>
    </g>
  </svg>
);

/**
 * THE CONNECTION PLOT (Hand & Device)
 */
export const ConnectionPlot: React.FC<PlotProps> = ({ className, ariaLabel }) => (
  <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} transition-transform duration-700 hover:scale-[1.02]`} role="img" aria-label={ariaLabel}>
    <defs><GrainFilter id="grain-connection" /></defs>
    <rect width="400" height="400" fill="#FFF5F2" />
    
    <g filter="url(#grain-connection)">
      <path d="M0 100H400" stroke="#D4B5A7" strokeWidth="0.5" />
      <path d="M100 0V400" stroke="#D4B5A7" strokeWidth="0.5" />

      <g transform="translate(120, 100)">
        <path d="M20 280C20 200 60 180 100 180C140 180 180 200 180 280" fill="#4A1520" stroke="#2D1B1F" strokeWidth="2" />
        <rect x="25" y="0" width="110" height="220" rx="16" fill="#2D1B1F" />
        <rect x="35" y="15" width="90" height="170" rx="8" fill="white" />
        
        <rect x="45" y="40" width="30" height="30" fill="#E67E50" fillOpacity="0.8">
            <animate attributeName="opacity" dur="3s" repeatCount="indefinite" values="0.4; 0.8; 0.4" />
        </rect>
      </g>
    </g>
  </svg>
);

/**
 * THE GROWTH PLOT (Plants & Sun)
 */
export const GrowthPlot: React.FC<PlotProps> = ({ className, ariaLabel }) => (
  <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} transition-transform duration-700 hover:scale-[1.02]`} role="img" aria-label={ariaLabel}>
    <defs><GrainFilter id="grain-growth" /></defs>
    <rect width="400" height="400" fill="#6B9E78" fillOpacity="0.1" />
    
    <g filter="url(#grain-growth)">
      <g transform="translate(80, 200)">
        <path d="M20 100V40C20 10 50 10 50 40V100" fill="#6B9E78" stroke="#2D1B1F" strokeWidth="2">
            <animateTransform attributeName="transform" type="translate" dur="5s" repeatCount="indefinite" values="0 0; 0 -10; 0 0" />
        </path>
        <path d="M140 100V60C140 40 170 40 170 60V100" fill="#E67E50" stroke="#2D1B1F" strokeWidth="2" />
      </g>
      <circle cx="300" cy="100" r="60" fill="#FACC15" />
    </g>
  </svg>
);

/**
 * EMPTY STATE PLOT (The Quiet Waiting Room)
 * Represents the calm before data entry.
 */
export const EmptyStatePlot: React.FC<PlotProps> = ({ className, ariaLabel }) => (
  <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} transition-all duration-1000`} role="img" aria-label={ariaLabel}>
    <defs><GrainFilter id="grain-empty" /></defs>
    <rect width="400" height="400" fill="#FFF5F2" />
    <g filter="url(#grain-empty)">
       <rect x="50" y="50" width="300" height="200" fill="white" stroke="#D4B5A7" strokeWidth="1" strokeDasharray="10 5" />
       <path d="M50 250H350V350H50V250Z" fill="#FFE5D9" fillOpacity="0.3" />
       
       {/* Quiet abstract objects */}
       <circle cx="200" cy="150" r="40" stroke="#D4B5A7" strokeWidth="0.5" opacity="0.5">
          <animate attributeName="r" dur="8s" repeatCount="indefinite" values="40; 45; 40" />
       </circle>
       <rect x="180" y="300" width="40" height="10" rx="5" fill="#4A1520" fillOpacity="0.05" />
    </g>
  </svg>
);

/**
 * MILESTONE MOSAIC (Celebration of Progress)
 * Used when a major milestone like TWP completion is reached.
 */
export const MilestoneMosaic: React.FC<PlotProps> = ({ className, ariaLabel }) => (
  <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} animate-pop`} role="img" aria-label={ariaLabel}>
    <defs><GrainFilter id="grain-milestone" /></defs>
    <rect width="400" height="400" fill="#FFF5F2" />
    <g filter="url(#grain-milestone)">
       {/* Mosaic Grid */}
       <path d="M0 0H200V200H0V0Z" fill="#E67E50" fillOpacity="0.2" />
       <path d="M200 0H400V200H200V0Z" fill="#4A7C9C" fillOpacity="0.1" />
       <path d="M0 200H200V400H0V200Z" fill="#6B9E78" fillOpacity="0.1" />
       <path d="M200 200H400V400H200V200Z" fill="#FACC15" fillOpacity="0.1" />
       
       <circle cx="200" cy="200" r="120" stroke="#4A1520" strokeWidth="1" strokeDasharray="15 10" />
       
       {/* Emerging Star Shape */}
       <path d="M200 120L220 180H280L230 215L250 280L200 240L150 280L170 215L120 180H180L200 120Z" fill="#E67E50">
          <animateTransform attributeName="transform" type="rotate" from="0 200 200" to="360 200 200" dur="20s" repeatCount="indefinite" />
       </path>
    </g>
  </svg>
);

export const InclusionMosaic: React.FC<PlotProps> = ({ className, ariaLabel }) => (
  <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} transition-transform duration-700 hover:scale-[1.02]`} role="img" aria-label={ariaLabel}>
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
