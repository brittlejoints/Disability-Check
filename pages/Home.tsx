import * as React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { CalculatorIcon, SuccessIcon, WarningIcon } from '../components/AccessibleIcons';

const Home: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section - Restored to Centered Editorial Layout */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-4 overflow-hidden pt-20">
        <div className="max-w-4xl mx-auto relative z-10 fade-in-up">
          <h1 className="text-6xl md:text-8xl font-serif font-light text-burgundy mb-8 tracking-tight leading-[1.1]">
            Know your status.<br />
            <span className="font-script text-coral">Keep your benefits.</span>
          </h1>
          <p className="mt-8 max-w-xl mx-auto text-xl text-charcoal/80 leading-relaxed font-light fade-in-up delay-100">
            Social Security rules shouldn't be a mystery. Track your work, understand the Trial Work Period, and move forward with confidence.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6 fade-in-up delay-200">
            <Link to="/dashboard">
              <Button className="px-10 py-4 text-lg bg-burgundy text-white hover:bg-coral transition-colors rounded-full shadow-luxury">
                Start Tracking
              </Button>
            </Link>
            <Link to="/learn">
              <Button variant="outline" className="px-10 py-4 text-lg border-burgundy text-burgundy hover:bg-burgundy/5 rounded-full">
                How it Works
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Subtle Ambient Background */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-40">
           <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-peach rounded-full blur-[120px] mix-blend-multiply"></div>
           <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-coral/20 rounded-full blur-[100px] mix-blend-multiply"></div>
        </div>
      </section>

      {/* Feature Section - Editorial Style */}
      <section className="py-32 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24">
            
            {/* Feature 1 - Visual Timeline */}
            <div className="flex flex-col items-start gap-6 fade-in-up delay-100">
              <CalculatorIcon label="Visual Timeline tool" />
              <h3 className="text-3xl font-serif text-burgundy">Visual Timeline</h3>
              <p className="text-lg text-slate leading-relaxed font-light">
                See exactly where you are in your 9-month Trial Work Period. No more guessing which months count and which don't.
              </p>
            </div>
            
            {/* Feature 2 - Privacy */}
            <div className="flex flex-col items-start gap-6 fade-in-up delay-200">
              <SuccessIcon label="Security indicator" />
              <h3 className="text-3xl font-serif text-burgundy">Your Data, Your Choice</h3>
              <p className="text-lg text-slate leading-relaxed font-light">
                Start tracking immediately as a guest with data saved to your device, or create a secure account to sync your history across devices.
              </p>
            </div>

            {/* Feature 3 - Alerts */}
            <div className="flex flex-col items-start gap-6 fade-in-up delay-300">
              <WarningIcon label="Smart Alerts indicator" />
              <h3 className="text-3xl font-serif text-burgundy">Smart Alerts</h3>
              <p className="text-lg text-slate leading-relaxed font-light">
                Context-aware guidance alerts you when you approach the 2025 TWP threshold ($1,050) or SGA limit ($1,620).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial CTA */}
      <section className="py-32">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-serif text-burgundy mb-8 fade-in-up">Ready to take control?</h2>
          <p className="text-xl text-charcoal/70 mb-12 fade-in-up delay-100 font-light">
            Join thousands of others who are navigating their return to work with clarity and confidence.
          </p>
          <div className="fade-in-up delay-200">
            <Link to="/dashboard">
              <Button className="px-12 py-4 text-xl bg-coral text-white hover:bg-terracotta rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;