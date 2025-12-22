import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { CalculatorIcon, WarningIcon } from '../components/AccessibleIcons';
import { ProtectivePlot, JourneyPlot, ConnectionPlot, GrowthPlot } from '../components/GeometricIllustrations';

const Home: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const parallaxRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const rect = parallaxRef.current.getBoundingClientRect();
        // Only update if the section is visible
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          setScrollY(window.scrollY - parallaxRef.current.offsetTop);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-4 pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 opacity-40 -mr-20 -mt-10 select-none pointer-events-none hidden xl:block animate-fade-in-up">
           <GrowthPlot ariaLabel="Growth decoration" className="rounded-full shadow-soft" />
        </div>

        <div className="max-w-4xl mx-auto relative z-20 fade-in-up">
          <span className="text-coral font-bold tracking-[0.3em] text-[10px] uppercase mb-8 block">Clarity for SSDI Recipients</span>
          <h1 className="text-7xl md:text-9xl font-serif font-light text-burgundy mb-10 tracking-tight leading-[1.05]">
            Know your status.<br />
            <span className="font-script text-coral">Keep your benefits.</span>
          </h1>
          <p className="max-w-xl mx-auto text-xl text-charcoal/70 leading-relaxed font-light mb-14 fade-in-up delay-100">
            Social Security rules are a maze. We provide the map. Track your work journey with confidence and peace of mind.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 fade-in-up delay-200">
            <Link to="/dashboard">
              <Button className="px-14 py-5 text-xl bg-burgundy text-white hover:bg-coral transition-all rounded-full shadow-luxury">
                Start Tracking
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-[10%] left-[5%] w-72 h-72 hidden xl:block fade-in-up delay-300">
           <JourneyPlot ariaLabel="A guided journey" className="rounded-[3rem] shadow-luxury" />
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-40 bg-white/50 backdrop-blur-xl relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center mb-40">
            <div className="lg:col-span-5 fade-in-up">
              <div className="relative">
                <ProtectivePlot ariaLabel="Protection illustration" className="w-full h-auto rounded-[4rem] shadow-soft border border-taupe/10" />
                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white p-6 rounded-[2rem] shadow-luxury hidden md:block">
                   <p className="text-xs font-bold text-coral uppercase tracking-widest mb-2">Safety</p>
                   <p className="text-sm text-slate font-light">The EPE phase acts as your 36-month safety net.</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7 space-y-12 fade-in-up delay-100">
               <h2 className="text-5xl md:text-6xl font-serif text-burgundy leading-tight">Your history is yours.<br/><span className="italic text-coral">Keep it safe.</span></h2>
               <p className="text-2xl text-slate font-light leading-relaxed max-w-2xl">
                 We don't just track numbers. We visualize the rules that govern your independence, translating complex SSA manuals into simple, actionable tiles.
               </p>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8">
                  <div className="space-y-4">
                    <CalculatorIcon size={40} className="text-coral" />
                    <h4 className="text-2xl font-serif text-burgundy">Prorated Math</h4>
                    <p className="text-slate font-light">We handle the "When Earned" rule automatically so you don't have to.</p>
                  </div>
                  <div className="space-y-4">
                    <WarningIcon size={40} className="text-warningOrange" />
                    <h4 className="text-2xl font-serif text-burgundy">Limit Alerts</h4>
                    <p className="text-slate font-light">Real-time warnings as you approach SGA or TWP income thresholds.</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1 space-y-10 fade-in-up">
               <h2 className="text-5xl font-serif text-burgundy">Clarity in the palm of your hand.</h2>
               <p className="text-xl text-slate font-light leading-relaxed">
                 Access your dashboard from any device. Our clean, mobile-optimized interface ensures you can log income as it happens.
               </p>
               <Link to="/income-guide">
                  <Button variant="outline" className="px-10 py-4 border-burgundy text-burgundy hover:bg-burgundy/5 rounded-full">
                    Learn about Reporting
                  </Button>
               </Link>
            </div>
            <div className="lg:col-span-6 order-1 lg:order-2 fade-in-up delay-100">
                <ConnectionPlot ariaLabel="Connection illustration" className="w-full h-auto rounded-[3rem] shadow-luxury" />
            </div>
          </div>
        </div>
      </section>

      {/* NEW Parallax Illustration CTA Section */}
      <section 
        ref={parallaxRef}
        className="py-64 text-center relative overflow-hidden bg-blush border-t border-taupe/10"
      >
        {/* Parallax Background Layers */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40 transition-transform duration-75 ease-out"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        >
          {/* Layer 1: Large Abstract Segments */}
          <div className="absolute top-0 left-0 w-full h-full">
             <div className="absolute top-10 left-10 w-96 h-96 bg-coral/5 rounded-[5rem] rotate-12"></div>
             <div className="absolute bottom-0 right-10 w-[40rem] h-[40rem] bg-epeBlue/5 rounded-full -mb-40"></div>
          </div>
        </div>

        <div 
          className="absolute inset-0 pointer-events-none transition-transform duration-100 ease-out"
          style={{ transform: `translateY(${scrollY * -0.2}px)` }}
        >
          {/* Layer 2: Floating Geometric Plots */}
          <div className="absolute top-1/4 left-[10%] w-48 h-48 opacity-30">
            <GrowthPlot ariaLabel="" className="rounded-2xl" />
          </div>
          <div className="absolute bottom-1/4 right-[10%] w-64 h-64 opacity-20">
            <JourneyPlot ariaLabel="" className="rounded-full" />
          </div>
        </div>

        {/* Foreground Content */}
        <div className="max-w-4xl mx-auto px-4 relative z-10 fade-in-up">
          <span className="text-coral font-bold tracking-[0.5em] text-[10px] uppercase mb-8 block">Your Journey</span>
          <h2 className="text-7xl md:text-8xl font-serif text-burgundy mb-12 leading-tight">
            Independence starts<br />
            <span className="italic">with awareness.</span>
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/dashboard">
              <Button className="px-16 py-6 text-xl bg-burgundy text-white hover:bg-coral rounded-full shadow-luxury transition-all">
                Access Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Texture Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-noise opacity-[0.03]"></div>
      </section>
    </Layout>
  );
};

export default Home;