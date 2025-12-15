import React, { useEffect, useRef, useState } from 'react';

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  // Use refs for position to avoid re-renders on every mousemove
  const mousePosition = useRef({ x: 0, y: 0 });
  const trailerPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Only run on devices with a fine pointer (mouse)
    const mediaQuery = window.matchMedia('(pointer: fine)');
    if (!mediaQuery.matches) return;

    const onMouseMove = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
      
      // Move the main dot instantly
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    // Check for hover targets
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if the target or its parents are interactive
      const isInteractive = target.closest('a, button, input, textarea, [role="button"], .cursor-hover');
      setIsHovering(!!isInteractive);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mouseover', onMouseOver);

    // Animation loop for the trailer (smooth lag effect)
    let animationFrameId: number;

    const animateTrailer = () => {
      // Linear interpolation (Lerp) for smooth following
      // The 0.15 factor determines the "weight" or lag of the cursor. Lower = slower/heavier.
      const dx = mousePosition.current.x - trailerPosition.current.x;
      const dy = mousePosition.current.y - trailerPosition.current.y;
      
      trailerPosition.current.x += dx * 0.15;
      trailerPosition.current.y += dy * 0.15;

      if (trailerRef.current) {
        trailerRef.current.style.transform = `translate3d(${trailerPosition.current.x}px, ${trailerPosition.current.y}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(animateTrailer);
    };

    animateTrailer();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseover', onMouseOver);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVisible]);

  // If not on a fine pointer device, render nothing
  if (typeof window !== 'undefined' && window.matchMedia && !window.matchMedia('(pointer: fine)').matches) {
    return null;
  }

  return (
    <>
      {/* Global CSS to hide default cursor only when this component is active */}
      <style>{`
        @media (pointer: fine) {
          body, a, button, input {
            cursor: none !important;
          }
        }
      `}</style>

      {/* Main Dot (The precision pointer) */}
      <div 
        ref={cursorRef}
        className={`fixed top-0 left-0 w-2 h-2 bg-burgundy rounded-full pointer-events-none z-[9999] -ml-1 -mt-1 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Trailer (The elegant ring) */}
      <div 
        ref={trailerRef}
        className={`
          fixed top-0 left-0 rounded-full pointer-events-none z-[9998] border border-coral transition-all duration-300 ease-out -ml-4 -mt-4
          ${isVisible ? 'opacity-100' : 'opacity-0'}
          ${isHovering ? 'w-12 h-12 bg-coral/10 scale-100 -ml-6 -mt-6 border-coral/50' : 'w-8 h-8 scale-75 border-coral/80'}
          ${isClicking ? 'scale-50 bg-coral/30' : ''}
        `}
      />
    </>
  );
};

export default CustomCursor;