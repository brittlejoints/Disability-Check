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

        {/* FAQ Section - Full Width Refinement */}
        <div className="mt-32 pt-24 border-t border-taupe/20 fade-in-up delay-300">
          <h2 className="text-4xl font-serif text-burgundy mb-12">Common Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12">
            <div>
              <h3 className="font-medium text-lg text-charcoal mb-3">Is this an official SSA tool?</h3>
              <p className="text-slate font-light leading-relaxed">No. This is an independent educational tool. Always verify your status with the Social Security Administration directly.</p>
            </div>
            <div>
              <h3 className="font-medium text-lg text-charcoal mb-3">Does this handle SSI?</h3>
              <p className="text-slate font-light leading-relaxed">No. Disability Check is designed specifically for <strong>SSDI</strong>. SSI (Supplemental Security Income) has different calculation rules.</p>
            </div>
             <div>
              <h3 className="font-medium text-lg text-charcoal mb-3">What happens if I clear my browser?</h3>
              <p className="text-slate font-light leading-relaxed">In Guest Mode, clearing your cache <strong>will delete</strong> your work history. Create an account to securely back up your data.</p>
            </div>
            <div>
              <h3 className="font-medium text-lg text-charcoal mb-3">Is my income data sold?</h3>
              <p className="text-slate font-light leading-relaxed">Absolutely not. Your data is encrypted and used solely for the purpose of your personal benefit tracking.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;