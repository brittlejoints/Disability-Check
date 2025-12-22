import * as React from 'react';
import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Income Help', path: '/income-guide' },
    { name: 'Rules', path: '/learn' },
    { name: 'About', path: '/about' },
  ];

  const isActive = (path: string) => location.pathname === path;
  
  const hideFooter = ['/auth', '/onboarding'].includes(location.pathname);

  const Logo = ({ size = "md" }: { size?: "sm" | "md" }) => {
    const isSm = size === "sm";
    const blobShape = '48% 52% 65% 35% / 38% 38% 62% 62%';
    
    return (
      <div className="flex items-center gap-2 group">
        <div className="relative">
          <div 
            className={`
              ${isSm ? 'w-6 h-6' : 'w-7 h-7'} 
              relative flex items-center justify-center 
              bg-burgundy group-hover:bg-coral 
              transition-all duration-700 ease-in-out
              group-hover:scale-110 group-hover:rotate-[3deg]
              shadow-sm overflow-hidden
            `}
            style={{ borderRadius: blobShape }}
          >
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-white transition-transform duration-500 group-hover:scale-105`} 
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path 
                d="M6 12.5C6.5 13.5 8 15.5 10 17.5C10.5 17 14 11.5 19 6.5" 
                stroke="currentColor" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <span className={`font-serif ${isSm ? 'text-base' : 'text-lg'} font-bold text-burgundy tracking-tight group-hover:text-coral transition-colors duration-500`}>
          Disability Check
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-blush text-charcoal">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-burgundy focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">
        Skip to main content
      </a>

      <header className="absolute top-0 w-full z-50" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" aria-label="Disability Check Home">
                <Logo />
              </Link>
            </div>

            <nav className="hidden md:flex space-x-10" aria-label="Main Navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={isActive(link.path) ? 'page' : undefined}
                  className={`text-sm font-medium transition-colors duration-300 relative
                    ${isActive(link.path) 
                      ? 'text-burgundy' 
                      : 'text-charcoal/60 hover:text-coral'
                    }`}
                >
                  {link.name}
                  {isActive(link.path) && (
                      <span className="absolute -bottom-2 left-0 w-full h-px bg-burgundy" aria-hidden="true"></span>
                  )}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-6">
              <Link to="/auth">
                <button className="text-sm font-medium text-burgundy hover:text-coral transition-colors focus:ring-2 focus:ring-coral rounded px-2 py-1">
                  Log in
                </button>
              </Link>
            </div>

            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 text-burgundy focus:outline-none focus:ring-2 focus:ring-coral rounded-lg"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
              >
                {!isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8h16M4 16h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl absolute top-24 left-0 w-full border-b border-taupe/10 animate-fade-in-up shadow-xl">
            <nav className="pt-2 pb-6 space-y-1 px-6" aria-label="Mobile Navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block py-4 text-xl font-serif border-b border-taupe/10
                    ${isActive(link.path)
                      ? 'text-coral'
                      : 'text-charcoal'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
               <div className="pt-6">
                 <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)} className="block w-full py-3 text-burgundy font-medium text-center bg-burgundy/5 rounded-xl">
                   Log in
                 </Link>
               </div>
            </nav>
          </div>
        )}
      </header>

      <main id="main-content" className="flex-grow pt-24" tabIndex={-1}>
        {children}
      </main>

      {!hideFooter && (
        <footer className="bg-blush border-t border-taupe/10 pt-24 pb-12" role="contentinfo">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div>
              <div className="mb-6">
                <Link to="/" aria-label="Disability Check Home">
                  <Logo size="sm" />
                </Link>
              </div>
              <p className="text-sm text-slate leading-relaxed max-w-sm font-light">
                Empowering SSDI recipients to work with confidence. Understand your status, track your progress, and keep your benefits.
              </p>
            </div>
            <nav className="md:text-right" aria-label="Footer Navigation">
               <div className="flex flex-col md:flex-row gap-6 md:justify-end text-sm text-slate mb-8">
                  <a href="https://www.ssa.gov" target="_blank" rel="noopener noreferrer" className="hover:text-coral transition-colors">SSA.gov</a>
                  <Link to="/about" className="hover:text-coral transition-colors">About</Link>
                  <Link to="/learn" className="hover:text-coral transition-colors">Rules</Link>
               </div>
               <div className="text-[10px] text-slate/60 font-light leading-relaxed max-w-md md:ml-auto space-y-3" style={{ textWrap: 'pretty' } as any}>
                <p><strong>DISCLAIMER:</strong> This application is a strictly independent educational and informational resource. It is NOT affiliated with, authorized by, sponsored by, or endorsed by the Social Security Administration (SSA) or any other government agency. All calculations, phase tracking, and benefit status estimations provided by this tool are automated projections based solely on user-provided inputs and current 2025 thresholds; they do not represent official determinations or legal proof of eligibility.</p>
                <p>No information provided through this service constitutes legal, financial, medical, or professional advice. Users bear full and exclusive responsibility for verifying their own status and for reporting all work activity and income directly to the SSA in accordance with federal law. We assume no liability for any loss of benefits, overpayments, administrative penalties, or financial consequences arising from the use of this software or reliance on its estimations. Use of this application implies full acknowledgment and acceptance of these terms and limitations.</p>
               </div>
            </nav>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;