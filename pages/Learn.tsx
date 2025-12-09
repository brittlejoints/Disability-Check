import React from 'react';
import Layout from '../components/Layout';
import { THRESHOLDS_2025 } from '../constants';
import { formatCurrency } from '../utils/logic';

const Learn: React.FC = () => {
  return (
    <Layout>
      <div className="pt-24 pb-16 px-4 border-b border-taupe/20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-serif text-burgundy mb-6 fade-in-up">The Rules, Simplified</h1>
          <p className="text-xl text-slate font-light leading-relaxed fade-in-up delay-100">
            The path to working while on SSDI involves three distinct phases. Understanding them is the key to protecting your benefits.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-24 space-y-32">
        {/* Phase 1 */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start fade-in-up">
          <div className="md:col-span-3 text-coral font-serif text-8xl md:text-9xl opacity-20 font-bold leading-none -mt-4">
            01
          </div>
          <div className="md:col-span-9">
            <h2 className="text-4xl font-serif text-burgundy mb-6">Trial Work Period (TWP)</h2>
            <div className="prose prose-lg text-slate font-light">
              <p className="text-xl text-charcoal mb-6">
                The TWP allows you to test your ability to work for at least <strong>9 months</strong>. During this period, you will receive your full disability benefits regardless of how much you earn.
              </p>
              <ul className="space-y-4 mb-8 list-none pl-0">
                <li className="flex gap-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-coral mt-2.5 flex-shrink-0"></span>
                  <span>A "service month" is any month you earn more than <strong>{formatCurrency(THRESHOLDS_2025.twp)}</strong>.</span>
                </li>
                <li className="flex gap-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-coral mt-2.5 flex-shrink-0"></span>
                  <span>The 9 months do not have to be consecutive.</span>
                </li>
                <li className="flex gap-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-coral mt-2.5 flex-shrink-0"></span>
                  <span>Completes when you accumulate 9 service months within a rolling 60-month window.</span>
                </li>
              </ul>
              <p className="text-burgundy italic border-l-2 border-coral pl-6 py-2">
                Insight: You can earn as much as you want during these 9 months without losing your check.
              </p>
            </div>
          </div>
        </section>

        {/* Phase 2 */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start fade-in-up">
          <div className="md:col-span-3 text-epeBlue font-serif text-8xl md:text-9xl opacity-20 font-bold leading-none -mt-4">
            02
          </div>
          <div className="md:col-span-9">
            <h2 className="text-4xl font-serif text-burgundy mb-6">Extended Period of Eligibility (EPE)</h2>
             <div className="prose prose-lg text-slate font-light">
              <p className="text-xl text-charcoal mb-6">
                After your TWP ends, a <strong>36-month</strong> safety net begins. Benefits are paid for months your earnings are below the Substantial Gainful Activity (SGA) level.
              </p>
              <ul className="space-y-4 mb-8 list-none pl-0">
                <li className="flex gap-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-epeBlue mt-2.5 flex-shrink-0"></span>
                  <span>If you earn over <strong>{formatCurrency(THRESHOLDS_2025.sga)}</strong>, you will not receive a benefit check for that month.</span>
                </li>
                <li className="flex gap-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-epeBlue mt-2.5 flex-shrink-0"></span>
                  <span>If your earnings drop below SGA, benefits can restart automatically.</span>
                </li>
              </ul>
              <p className="text-epeBlue italic border-l-2 border-epeBlue pl-6 py-2">
                Insight: This is your safety net. Work more if you can, but benefits are there if you can't.
              </p>
            </div>
          </div>
        </section>

        {/* Phase 3 */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start fade-in-up">
          <div className="md:col-span-3 text-charcoal font-serif text-8xl md:text-9xl opacity-10 font-bold leading-none -mt-4">
            03
          </div>
          <div className="md:col-span-9">
            <h2 className="text-4xl font-serif text-burgundy mb-6">Post-Eligibility</h2>
            <div className="prose prose-lg text-slate font-light">
              <p className="text-xl text-charcoal mb-6">
                 After the 36-month EPE ends, your benefits will continue only if you are still disabled and your earnings remain below the SGA level.
              </p>
              <p>
                If you earn above SGA after this point, your benefits may terminate. However, expedited reinstatement is available for 5 years if your disability prevents you from working again.
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Learn;