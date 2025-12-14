import React from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { Link } from 'react-router-dom';

const IncomeGuide: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <div className="pt-24 pb-16 px-4 border-b border-taupe/20 bg-gradient-to-b from-blush to-white">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-coral font-bold tracking-widest text-xs uppercase mb-4 block">Educational Resource</span>
          {/* Updated H1 to match Home page typography */}
          <h1 className="text-6xl md:text-8xl font-serif font-light text-burgundy mb-8 tracking-tight leading-[1.1] fade-in-up">
            The Art of <span className="font-script text-coral">Reporting</span>
          </h1>
          <p className="text-xl text-slate font-light leading-relaxed fade-in-up delay-100">
            Social Security math is unique. To protect your benefits, you need to understand the difference between what lands in your bank account and what the SSA actually counts.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-24">
        
        {/* SECTION 1: THE GOLDEN RULE (WHEN EARNED) */}
        <section className="fade-in-up delay-100">
          <div className="flex flex-col md:flex-row items-baseline gap-4 mb-8">
            <span className="text-coral font-serif text-8xl md:text-9xl opacity-20 font-bold leading-none -mt-4">01</span>
            <h2 className="text-4xl font-serif text-burgundy">The "When Earned" Rule</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="prose prose-lg text-slate font-light">
              <p className="text-lg text-charcoal font-medium mb-4">
                This is the most common mistake beneficiaries make.
              </p>
              <p>
                The SSA counts your income in the month the work was <em className="text-burgundy">performed</em>, not necessarily the month you received the paycheck.
              </p>
              <p>
                Why? Because SSDI is based on your <strong>ability to work</strong> (your activity), not just your cash flow.
              </p>
            </div>

            <Card variant="glass" className="bg-white/50 border border-taupe/20">
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-taupe/10">
                  <div className="bg-red-50 text-red-500 p-2 rounded-lg text-xs font-bold uppercase tracking-wide">Wrong</div>
                  <div className="text-sm text-slate">
                    "I got a $2,000 paycheck on February 3rd, so I'll enter $2,000 for February."
                  </div>
                </div>
                
                <div className="flex items-center justify-center text-taupe">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-successGreen/5 border border-successGreen/20 shadow-sm">
                  <div className="bg-successGreen text-white p-2 rounded-lg text-xs font-bold uppercase tracking-wide">Right</div>
                  <div className="text-sm text-slate">
                    "That paycheck covered work I did from Jan 20th to Jan 31st. I need to attribute that money to <strong className="text-charcoal">January</strong>, even though I held the cash in February."
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* SECTION 2: INCOME TYPES */}
        <section className="fade-in-up delay-200">
          <div className="flex flex-col md:flex-row items-baseline gap-4 mb-8">
             <span className="text-epeBlue font-serif text-8xl md:text-9xl opacity-20 font-bold leading-none -mt-4">02</span>
             <h2 className="text-4xl font-serif text-burgundy">W-2 vs. Self-Employed</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* W-2 Card */}
             <div className="group relative bg-white rounded-3xl p-8 border border-taupe/20 shadow-soft hover:shadow-luxury transition-all duration-500">
                <div className="absolute top-0 right-0 w-24 h-24 bg-coral/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-700"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="p-3 bg-coral/10 text-coral rounded-xl">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </span>
                        <h3 className="text-2xl font-serif text-burgundy">Employee (W-2)</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <span className="text-xs font-bold text-slate uppercase tracking-wider">The Metric</span>
                            <p className="text-xl text-charcoal font-medium">Gross Wages</p>
                        </div>
                        <p className="text-slate font-light leading-relaxed">
                            This is the total amount you earn <strong>before</strong> taxes, insurance, or union dues are deducted. 
                        </p>
                        <div className="bg-red-50 p-4 rounded-xl text-sm text-red-800 border-l-4 border-red-400">
                            <strong>Warning:</strong> Do not use your "Net Pay" (take-home amount). This is usually lower than Gross Wages and could lead to under-reporting.
                        </div>
                    </div>
                </div>
             </div>

             {/* SE Card */}
             <div className="group relative bg-white rounded-3xl p-8 border border-taupe/20 shadow-soft hover:shadow-luxury transition-all duration-500">
                <div className="absolute top-0 right-0 w-24 h-24 bg-epeBlue/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-700"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="p-3 bg-epeBlue/10 text-epeBlue rounded-xl">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </span>
                        <h3 className="text-2xl font-serif text-burgundy">Self-Employed</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <span className="text-xs font-bold text-slate uppercase tracking-wider">The Metric</span>
                            <p className="text-xl text-charcoal font-medium">Net Earnings (NESE)</p>
                        </div>
                        <p className="text-slate font-light leading-relaxed">
                            For freelancers and business owners, you can deduct legitimate business expenses before the SSA counts the income.
                        </p>
                        <div className="p-4 bg-gray-50 rounded-xl font-mono text-sm text-slate border border-taupe/10">
                            Gross Revenue<br/>
                            - Expenses<br/>
                            = <span className="text-burgundy font-bold">Countable Income</span>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </section>

        {/* SECTION 3: COUNTABLE INCOME & DEDUCTIONS */}
        <section className="fade-in-up delay-300">
            <div className="bg-burgundy text-white rounded-[2.5rem] p-8 md:p-12 shadow-luxury overflow-hidden relative">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white opacity-5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row items-baseline gap-4 mb-10">
                         <span className="text-peach font-serif text-8xl md:text-9xl opacity-30 font-bold leading-none -mt-4">03</span>
                         <h2 className="text-4xl font-serif text-white">Reducing Countable Income</h2>
                    </div>

                    <p className="text-xl text-peach/80 font-light mb-12 max-w-2xl">
                        Just because you earned it doesn't mean it all counts against your SGA limit. You have rights to deduct certain expenses.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* IRWE */}
                        <div>
                            <h3 className="text-2xl font-serif text-white mb-4 flex items-center gap-3">
                                <span>IRWE</span>
                                <span className="text-xs font-sans bg-white/10 px-2 py-1 rounded text-white/70">Impairment-Related Work Expenses</span>
                            </h3>
                            <p className="text-white/70 font-light mb-6">
                                Expenses for items or services which are directly related to enabling you to work despite your impairment.
                            </p>
                            <ul className="space-y-3">
                                {[
                                    "Prescription co-pays",
                                    "Specialized transportation",
                                    "Medical devices (hearing aids, wheelchairs)",
                                    "Therapy or counseling appointments",
                                    "Attendant care services"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-white/90">
                                        <svg className="w-5 h-5 text-successGreen" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* SUBSIDIES */}
                        <div>
                            <h3 className="text-2xl font-serif text-white mb-4 flex items-center gap-3">
                                <span>Subsidies</span>
                                <span className="text-xs font-sans bg-white/10 px-2 py-1 rounded text-white/70">Employer Accommodations</span>
                            </h3>
                            <p className="text-white/70 font-light mb-6">
                                If your employer pays you the same rate as others but you do less work or have extra supervision due to your disability.
                            </p>
                            <div className="bg-white/10 p-5 rounded-xl border border-white/10">
                                <p className="text-sm italic text-white/80">
                                    "I am paid $15/hr like everyone else, but my manager allows me to take extra breaks, so I only produce about $10/hr worth of work."
                                </p>
                                <div className="mt-3 pt-3 border-t border-white/10 text-xs text-peach">
                                    Result: The SSA may value your work at $10/hr for SGA purposes.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* CTA */}
        <div className="text-center pt-8 pb-16 fade-in-up delay-300">
             <h3 className="text-2xl font-serif text-burgundy mb-4">Ready to calculate?</h3>
             <Link to="/dashboard">
                <Button className="px-8 py-3 bg-coral hover:bg-terracotta text-white rounded-xl shadow-lg hover:shadow-xl transition-all">
                    Go to Dashboard
                </Button>
             </Link>
        </div>

      </div>
    </Layout>
  );
};

export default IncomeGuide;