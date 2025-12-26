import * as React from 'react';
import Layout from '../components/Layout';
import { THRESHOLDS_2025 } from '../constants';
import { formatCurrency } from '../utils/logic';
import { JourneyPlot, ProtectivePlot, GrowthPlot } from '../components/GeometricIllustrations';

const Learn: React.FC = () => {
  return (
    <Layout>
      <div className="pt-32 pb-24 px-4 border-b border-taupe/20 bg-gradient-to-b from-blush to-white">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-coral font-bold tracking-[0.4em] text-[10px] uppercase mb-6 block">Educational Primer</span>
          <h1 className="text-6xl md:text-8xl font-serif font-light text-burgundy mb-10 tracking-tight leading-[1.1] fade-in-up">
            The Phases of <span className="font-script text-coral">Progress</span>
          </h1>
          <p className="text-xl text-slate font-light leading-relaxed fade-in-up delay-100 max-w-2xl mx-auto">
            The path to working while on SSDI is structured into three specific safety nets. Understanding them transforms fear into strategy.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-32 space-y-48">
        
        {/* Phase 1 */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center fade-in-up">
          <div className="lg:col-span-5">
             <div className="relative">
                <JourneyPlot ariaLabel="Journey through the night illustration" className="w-full h-auto rounded-[3rem] shadow-luxury" />
                <div className="absolute -top-6 -left-6 bg-burgundy text-white px-6 py-2 rounded-full font-serif text-lg">Phase 01</div>
             </div>
          </div>
          <div className="lg:col-span-7">
            <h2 className="text-5xl font-serif text-burgundy mb-8">Trial Work Period (TWP)</h2>
            <div className="prose prose-lg text-slate font-light max-w-none">
              <p className="text-xl text-charcoal mb-8 leading-relaxed">
                The TWP is your experimental phase. For <strong>9 months</strong>, you can earn any amount without impacting your monthly benefit check.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                 <div className="p-6 bg-white rounded-2xl border border-taupe/10 shadow-sm">
                    <span className="text-xs font-bold text-coral uppercase tracking-widest mb-2 block">Threshold</span>
                    <p className="text-lg text-burgundy font-medium">A "service month" is triggered when you earn over <strong>{formatCurrency(THRESHOLDS_2025.twp)}</strong>.</p>
                 </div>
                 <div className="p-6 bg-white rounded-2xl border border-taupe/10 shadow-sm">
                    <span className="text-xs font-bold text-coral uppercase tracking-widest mb-2 block">Rolling Window</span>
                    <p className="text-lg text-burgundy font-medium">You must complete 9 months within a 60-month window.</p>
                 </div>
              </div>
              <p className="text-burgundy italic border-l-2 border-coral pl-6 py-3 bg-coral/5 rounded-r-xl">
                Insight: This is the time to build your confidence without financial risk.
              </p>
            </div>
          </div>
        </section>

        {/* Phase 2 */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center fade-in-up delay-100">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <h2 className="text-5xl font-serif text-burgundy mb-8">Extended Period of Eligibility (EPE)</h2>
            <div className="prose prose-lg text-slate font-light max-w-none">
              <p className="text-xl text-charcoal mb-8 leading-relaxed">
                After the 9th month, your <strong>36-month safety net</strong> begins. Benefits are only paused for months you earn above the "Substantial" limit.
              </p>
              <ul className="space-y-6 mb-10 list-none pl-0">
                <li className="flex gap-5">
                  <span className="w-12 h-12 rounded-full bg-epeBlue/10 text-epeBlue flex items-center justify-center flex-shrink-0 font-bold">1</span>
                  <span>If earnings are below <strong>{formatCurrency(THRESHOLDS_2025.sga)}</strong>, you receive your full benefit check.</span>
                </li>
                <li className="flex gap-5">
                  <span className="w-12 h-12 rounded-full bg-epeBlue/10 text-epeBlue flex items-center justify-center flex-shrink-0 font-bold">2</span>
                  <span>If earnings exceed the limit, the check is suspended, but the safety net remains active.</span>
                </li>
              </ul>
              <div className="p-8 bg-epeBlue/5 rounded-3xl border border-epeBlue/10">
                 <p className="text-epeBlue font-serif text-xl italic leading-relaxed">
                   "Think of EPE as a toggle switch. If your work slows down, your benefits restart automatically."
                 </p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 order-1 lg:order-2">
             <div className="relative">
                <ProtectivePlot ariaLabel="Safety net illustration" className="w-full h-auto rounded-[3rem] shadow-luxury" />
                <div className="absolute -top-6 -right-6 bg-epeBlue text-white px-6 py-2 rounded-full font-serif text-lg">Phase 02</div>
             </div>
          </div>
        </section>

        {/* Phase 3 */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center fade-in-up delay-200">
          <div className="lg:col-span-5">
             <div className="relative">
                <GrowthPlot ariaLabel="Sustainable growth illustration" className="w-full h-auto rounded-[3rem] shadow-luxury" />
                <div className="absolute -top-6 -left-6 bg-successGreen text-white px-6 py-2 rounded-full font-serif text-lg">Phase 03</div>
             </div>
          </div>
          <div className="lg:col-span-7">
            <h2 className="text-5xl font-serif text-burgundy mb-8">Post-Eligibility Balance</h2>
            <div className="prose prose-lg text-slate font-light max-w-none">
              <p className="text-xl text-charcoal mb-8 leading-relaxed">
                Once the 36-month EPE ends, benefits continue as long as you remain disabled and earn below the SGA limit.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                 <div className="p-6 bg-white rounded-2xl border border-taupe/10 shadow-sm">
                    <h4 className="text-lg font-bold text-burgundy mb-3">Termination Rule</h4>
                    <p className="text-sm leading-relaxed">Earning over SGA after your EPE ends can lead to benefit termination, as the "automatic toggle" safety net has concluded.</p>
                 </div>
                 <div className="p-6 bg-white rounded-2xl border border-taupe/10 shadow-sm">
                    <h4 className="text-lg font-bold text-burgundy mb-3">Expedited Reinstatement</h4>
                    <p className="text-sm leading-relaxed">If you stop working within 5 years of termination, you can request benefits restart (EXR) without a new application.</p>
                 </div>
              </div>
              <p className="text-burgundy italic border-l-2 border-coral pl-6 py-3 bg-coral/5 rounded-r-xl">
                Goal: Transitioning to long-term stability where work and wellness coexist.
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Learn;