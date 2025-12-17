import React, { useState } from 'react';
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
  
  // Hide footer on specific pages for a cleaner "app-like" feel
  const hideFooter = ['/auth', '/onboarding'].includes(location.pathname);

  // Organic blob style
  const organicShape = { borderRadius: '45% 55% 70% 30% / 30% 30% 70% 70%' };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-blush text-charcoal">
      <header className="absolute top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-3 group">
                <div 
                  className="w-10 h-10 bg-burgundy flex items-center justify-center text-white font-serif font-bold text-xl group-hover:bg-coral group-hover:rotate-180 transition-all duration-700 ease-in-out shadow-sm"
                  style={organicShape}
                >
                  <span className="group-hover:-rotate-180 transition-transform duration-700">D</span>
                </div>
                <span className="font-serif text-xl font-bold text-burgundy tracking-tight group-hover:text-coral transition-colors duration-500">
                  Disability Check
                </span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-10">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors duration-300 relative
                    ${isActive(link.path) 
                      ? 'text-burgundy' 
                      : 'text-charcoal/60 hover:text-coral'
                    }`}
                >
                  {link.name}
                  {isActive(link.path) && (
                      <span className="absolute -bottom-2 left-0 w-full h-px bg-burgundy"></span>
                  )}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-6">
              <Link to="/auth">
                <button className="text-sm font-medium text-burgundy hover:text-coral transition-colors">
                  Log in
                </button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 text-burgundy focus:outline-none"
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

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl absolute top-24 left-0 w-full border-b border-taupe/10 animate-fade-in-up">
            <div className="pt-2 pb-6 space-y-1 px-6">
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
                 <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)} className="block w-full py-3 text-burgundy font-medium">
                   Log in
                 </Link>
               </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow pt-24">
        {children}
      </main>

      {!hideFooter && (
        <footer className="bg-blush border-t border-taupe/10 pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div>
              <div className="flex items-center gap-3 mb-6">
                 <div 
                   className="w-8 h-8 bg-burgundy flex items-center justify-center text-white font-serif font-bold text-sm"
                   style={organicShape}
                 >
                    D
                  </div>
                <span className="font-serif text-lg font-bold text-burgundy">Disability Check</span>
              </div>
              <p className="text-sm text-slate leading-relaxed max-w-sm font-light">
                Empowering SSDI recipients to work with confidence. Understand your status, track your progress, and keep your benefits.
              </p>
            </div>
            <div className="md:text-right">
               <div className="flex flex-col md:flex-row gap-6 md:justify-end text-sm text-slate mb-8">
                  <a href="https://www.ssa.gov" target="_blank" rel="noopener noreferrer" className="hover:text-coral transition-colors">SSA.gov</a>
                  <Link to="/about" className="hover:text-coral transition-colors">About</Link>
                  <Link to="/learn" className="hover:text-coral transition-colors">Rules</Link>
               </div>
               <p className="text-xs text-slate/50 font-light">
                This is an independent educational tool. Not affiliated with the SSA. Not responsible for status of check.
               </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;