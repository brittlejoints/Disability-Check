import * as React from 'react';
import Layout from '../components/Layout';
import { InclusionMosaic } from '../components/GeometricIllustrations';

const About: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Main Narrative */}
          <div className="lg:col-span-7 space-y-16 fade-in-up">
            <div>
              <h1 className="text-5xl md:text-6xl font-serif text-burgundy mb-12">Clarity is a right.</h1>
              <p className="text-2xl text-charcoal leading-relaxed mb-8 font-light">
                Disability Check was built to solve a specific, high-stakes problem: <strong>Fear</strong>.
              </p>
              <p className="text-lg text-slate leading-relaxed mb-6 font-light">
                Millions of people on SSDI want to work but are terrified of triggering a benefit cutoff because the rules are opaque. We believe understanding your status is the first step toward independence.
              </p>
            </div>

            <section className="grid grid-cols-1 sm:grid-cols-2 gap-12 border-t border-taupe/20 pt-12">
              <div>
                <h4 className="font-serif text-2xl text-burgundy mb-4">Flexible Privacy</h4>
                <p className="text-slate font-light leading-relaxed">
                  We give you control. Use "Guest Mode" to store data only on your device, or create an account to securely sync your history.
                </p>
              </div>
              <div>
                 <h4 className="font-serif text-2xl text-burgundy mb-4">Plain English</h4>
                 <p className="text-slate font-light leading-relaxed">
                   We translate "Substantial Gainful Activity" into "Income Limit" so you actually know what's going on.
                 </p>
              </div>
            </section>
          </div>

          {/* Editorial Illustration Column */}
          <div className="lg:col-span-5 sticky top-32 fade-in-up delay-200">
            <div className="bg-white p-8 rounded-[3rem] shadow-soft border border-taupe/10">
              <InclusionMosaic 
                ariaLabel="Abstract geometric illustration showing a path forward." 
                className="w-full h-auto mb-8"
              />
              <blockquote className="text-burgundy font-serif italic text-xl border-l-2 border-coral pl-6 py-2">
                "Navigating work and disability should feel like progress, not a risk."
              </blockquote>
            </div>
          </div>
        </div>

        {/* FAQ Section - Expanded for Trust & Clarity */}
        <div className="mt-32 pt-24 border-t border-taupe/20 fade-in-up delay-300">
          <div className="mb-16">
            <span className="text-coral font-bold tracking-[0.4em] text-[10px] uppercase mb-4 block">Knowledge Base</span>
            <h2 className="text-4xl md:text-5xl font-serif text-burgundy">Common Questions</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-16">
            <div>
              <h3 className="font-serif text-xl text-burgundy mb-4">Is this an official government tool?</h3>
              <p className="text-slate font-light leading-relaxed">No. This is a strictly <strong>independent educational resource</strong>. We are not affiliated with, authorized by, or endorsed by the Social Security Administration (SSA). This tool is meant for personal planning only; official determinations are made solely by the SSA.</p>
            </div>

            <div>
              <h3 className="font-serif text-xl text-burgundy mb-4">How accurate are these calculations?</h3>
              <p className="text-slate font-light leading-relaxed">Our logic uses <strong>2025 SSA thresholds</strong> ($1,050 for TWP and $1,620 for SGA). While the math is robust, it relies entirely on the accuracy of your input. Because SSA rules can be interpreted subjectively by caseworkers, treat these results as <em>estimations</em>, not guarantees.</p>
            </div>

            <div>
              <h3 className="font-serif text-xl text-burgundy mb-4">Can the SSA see the data I enter?</h3>
              <p className="text-slate font-light leading-relaxed">Absolutely not. Your data is private. If you are in <strong>Guest Mode</strong>, it never leaves your browser. If you have an <strong>Account</strong>, it is stored in a secure, encrypted database. We have no mechanism to share your information with any government agency.</p>
            </div>

            <div>
              <h3 className="font-serif text-xl text-burgundy mb-4">Does this handle SSI or other state benefits?</h3>
              <p className="text-slate font-light leading-relaxed">No. This tool is designed exclusively for <strong>SSDI (Social Security Disability Insurance)</strong>. SSI and other programs have completely different income calculation rules (such as resource limits and different deduction percentages) that are not currently supported.</p>
            </div>

            <div>
              <h3 className="font-serif text-xl text-burgundy mb-4">What if I am legally blind?</h3>
              <p className="text-slate font-light leading-relaxed">The SGA limit for individuals who meet the SSA definition of blindness is significantly higher (<strong>$2,590/mo in 2025</strong>) than the standard limit ($1,620). Currently, our dashboard uses the standard limit. We recommend blind users keep this higher threshold in mind when reviewing their status.</p>
            </div>

            <div>
              <h3 className="font-serif text-xl text-burgundy mb-4">How does the 60-month rolling window work?</h3>
              <p className="text-slate font-light leading-relaxed">Your 9 Trial Work months don't have to be consecutive. However, they must occur within a <strong>60-month (5-year) window</strong>. Our logic automatically looks back at your history to determine if 9 "service months" have been triggered within any 5-year block.</p>
            </div>

            <div>
              <h3 className="font-serif text-xl text-burgundy mb-4">What if I have two jobs or a side hustle?</h3>
              <p className="text-slate font-light leading-relaxed">The SSA looks at your <strong>total combined income</strong> from all work sources. You can use our built-in <strong>Income Calculator</strong> to add multiple pay stubs or project invoices together for a single month to get an accurate total for your log.</p>
            </div>

            <div>
              <h3 className="font-serif text-xl text-burgundy mb-4">What happens if I stop using the app?</h3>
              <p className="text-slate font-light leading-relaxed">If you use Guest Mode and clear your browser cache, your history <strong>will be permanently lost</strong>. We recommend creating an account to ensure your progress is saved, allowing you to return and update your log months or years later.</p>
            </div>
          </div>

          <div className="mt-20 p-8 bg-coral/5 border border-coral/10 rounded-[2.5rem] text-center">
             <p className="text-burgundy font-serif italic text-lg">Still have questions? The best source of truth is always a qualified benefits counselor or your local SSA office.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;