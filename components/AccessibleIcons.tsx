import * as React from 'react';

/**
 * ACCESSIBILITY DOCUMENTATION:
 * 
 * 1. prefers-reduced-motion: All animations in this file use CSS classes 
 *    that are neutralized in index.html via media queries.
 * 2. ARIA: Icons use `role="img"` or `role="alert"` with descriptive `aria-label`.
 * 3. Color Contrast: Uses Burgundy (#4A1520) and Coral (#E67E50) which are 
 *    checked against the Blush (#FFF5F2) background for WCAG AA compliance.
 * 4. Screen Readers: Announcements for state changes should be triggered 
 *    via the `announce` utility which updates the hidden live region in index.html.
 */

interface IconProps {
  size?: number | string;
  className?: string;
  label?: string;
  animated?: boolean;
}

// Utility to announce things to screen readers without visual distraction
export const announce = (message: string) => {
  const announcer = document.getElementById('aria-announcer');
  if (announcer) {
    announcer.textContent = '';
    // Small timeout to ensure the change is registered as a "new" event by SR
    setTimeout(() => {
      announcer.textContent = message;
    }, 100);
  }
};

export const CalculatorIcon: React.FC<IconProps> = ({ 
  size = 48, 
  className = "text-coral", 
  label = "Income Calculator", 
  animated = true 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    role="img" 
    aria-label={label}
    className={`${className} ${animated ? 'hover:scale-105 transition-transform duration-300' : ''}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <rect x="7" y="5" width="10" height="4" rx="1" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1" />
    <path d="M8 13H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={animated ? "animate-pulse" : ""} />
    <path d="M12 13H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 13H16.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 17H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 17H16.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const SuccessIcon: React.FC<IconProps> = ({ 
  size = 48, 
  className = "text-successGreen", 
  label = "Success", 
  animated = true 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    role="img" 
    aria-label={label}
    className={`${className} ${animated ? 'animate-pop' : ''}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    <path 
      d="M8 12L11 15L16 9" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeDasharray="100"
      style={{ animation: animated ? 'drawPath 1s ease-out forwards' : 'none' }}
    />
  </svg>
);

export const WarningIcon: React.FC<IconProps> = ({ 
  size = 48, 
  className = "text-warningOrange", 
  label = "Warning", 
  animated = true 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    role="alert" 
    aria-label={label}
    className={`${className} ${animated ? 'animate-pulse' : ''}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="16" r="1.25" fill="currentColor"/>
  </svg>
);

export const LoadingSpinner: React.FC<IconProps> = ({ 
  size = 48, 
  className = "text-coral", 
  label = "Loading, please wait...", 
  animated = true 
}) => (
  <div role="status" aria-busy="true">
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={`${className} ${animated ? 'animate-spin' : ''}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
      <path d="M12 2C6.47715 2 2 6.47715 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
    <span className="sr-only">{label}</span>
  </div>
);

export const MilestoneIcon: React.FC<IconProps> = ({ 
  size = 48, 
  className = "text-terracotta", 
  label = "Achievement reached", 
  animated = true 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    role="img" 
    aria-label={label}
    className={`${className} ${animated ? 'animate-pop' : ''}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
    {animated && (
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" className="animate-ping-slow opacity-20" />
    )}
  </svg>
);