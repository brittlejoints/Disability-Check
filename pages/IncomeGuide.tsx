import React from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';

const IncomeGuide: React.FC = () => {
  return (
    <Layout>
      <div className="pt-24 pb-16 px-4 border-b border-taupe/20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-serif text-burgundy mb-6 fade-in-up">Calculating Your Income</h1>
          <p className="text-xl text-slate font-light leading-relaxed fade-in-up delay-100">
            For SSDI, not all income is counted the same way. Understanding the difference between Gross, Net, and "Countable" income is vital.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
        
        {/* Section 1: Employment Status */}
        <section className="fade-in-up delay-100">
            <h2 className="text-3xl font-serif text-burgundy mb-8">1. Identify Your Work Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-white border border-taupe/20">
                    <div className="w-12 h-12 bg-coral/10 text-coral rounded-full flex items-center justify-center mb-4 text-xl">
                        👔
                    </div>
                    <h3 className="text-xl font-bold text-burgundy mb-2">W-2 Employee</h3>
                    <p className="text-slate mb-4 text-sm font-light">You work for an employer who takes out taxes.</p>
                    <div className="bg-gray-50 p-4 rounded-xl border border-taupe/10">
                        <span className="block text-xs uppercase tracking-wider text-slate mb-1">SSA Counts:</span>
                        <strong className="text-lg text-charcoal">Gross Wages</strong>
                        <p className="text-xs text-slate mt-1">(The total amount <em>before</em> taxes are taken out)</p>
                    </div>
                </Card>

                <Card className="bg-white border border-taupe/20">
                    <div className="w-12 h-12 bg-epeBlue/10 text-epeBlue rounded-full flex items-center justify-center mb-4 text-xl">
                        💻
                    </div>
                    <h3 className="text-xl font-bold text-burgundy mb-2">Self-Employed</h3>
                    <p className="text-slate mb-4 text-sm font-light">Freelancer, contractor (1099), or business owner.</p>
                    <div className="bg-gray-50 p-4 rounded-xl border border-taupe/10">
                        <span className="block text-xs uppercase tracking-wider text-slate mb-1">SSA Counts:</span>
                        <strong className="text-lg text-charcoal">Net Earnings (NESE)</strong>
                        <p className="text-xs text-slate mt-1">(Gross Revenue minus Business Expenses)</p>
                    </div>
                </Card>
            </div>
        </section>

        {/* Section 2: Timing Rule */}
        <section className="fade-in-up delay-200">
             <h2 className="text-3xl font-serif text-burgundy mb-6">2. When does income count?</h2>
             <Card variant="glass" className="relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path></svg>
                </div>
                <h3 className="text-2xl font-serif text-charcoal mb-4">The "When Earned" Rule</h3>
                <p className="text-lg text-slate font-light leading-relaxed mb-6">
                    The SSA counts wages when they are <strong>earned</strong>, not necessarily when they are paid. 
                    This is a critical distinction for SSDI recipients.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/60 p-5 rounded-2xl border border-taupe/10">
                        <strong className="block text-burgundy mb-2">Example Scenario</strong>
                        <p className="text-sm text-slate">
                            You work the last week of January, but you don't get the paycheck until February 3rd.
                        </p>
                    </div>
                    <div className="bg-white/60 p-5 rounded-2xl border border-coral/20">
                        <strong className="block text-coral mb-2">How to Report</strong>
                        <p className="text-sm text-slate">
                            That income belongs to <strong>January</strong> (when you did the work), not February.
                        </p>
                    </div>
                </div>
             </Card>
        </section>

        {/* Section 3: Deductions */}
        <section className="fade-in-up delay-300">
            <h2 className="text-3xl font-serif text-burgundy mb-6">3. Special Deductions (IRWE)</h2>
            <div className="prose prose-lg text-slate font-light max-w-none">
                <p>
                    If you pay for certain items or services that you need to work because of your disability, 
                    the SSA may deduct these costs from your monthly earnings. These are called <strong>Impairment-Related Work Expenses (IRWE)</strong>.
                </p>
                <p>Common examples include:</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none pl-0 mt-6">
                    <li className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-successGreen"></div>
                        <span>Co-pays for prescriptions</span>
                    </li>
                     <li className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-successGreen"></div>
                        <span>Specialized transportation costs</span>
                    </li>
                     <li className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-successGreen"></div>
                        <span>Medical devices needed for work</span>
                    </li>
                     <li className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-successGreen"></div>
                        <span>Counseling services</span>
                    </li>
                </ul>
                <p className="mt-6 text-sm italic bg-taupe/10 p-4 rounded-lg inline-block">
                    Note: You must have receipts for these expenses, and they must be approved by the SSA to count as deductions.
                </p>
            </div>
        </section>

      </div>
    </Layout>
  );
};

export default IncomeGuide;