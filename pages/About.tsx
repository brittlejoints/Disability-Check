import React from 'react';
import Layout from '../components/Layout';

const About: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-24">
        <h1 className="text-5xl font-serif text-burgundy mb-12 fade-in-up">About Disability Check</h1>
        
        <div className="space-y-16 fade-in-up delay-100">
          <section>
            <p className="text-xl text-charcoal leading-relaxed mb-8 font-light">
              Disability Check was built to solve a specific, high-stakes problem: <strong>Fear</strong>.
            </p>
            <p className="text-lg text-slate leading-relaxed mb-6 font-light">
              Millions of people on SSDI want to work but are terrified of accidentally triggering a benefit cutoff because the rules are opaque and confusing. We believe financial clarity is a right, not a privilege.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-b border-taupe/20 py-12">
            <div>
              <h4 className="font-serif text-2xl text-burgundy mb-4">Flexible Privacy</h4>
              <p className="text-slate font-light">
                We give you control. Use "Guest Mode" to store data only on your device, or create an account to securely sync your history to the cloud.
              </p>
            </div>
            <div>
               <h4 className="font-serif text-2xl text-burgundy mb-4">Plain English</h4>
               <p className="text-slate font-light">
                 We translate "Substantial Gainful Activity" into "Income Limit" so you actually know what's going on.
               </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-serif text-burgundy mb-8">Frequently Asked Questions</h2>
            <div className="space-y-10">
              <div>
                <h3 className="font-medium text-lg text-charcoal mb-2">Is this an official SSA tool?</h3>
                <p className="text-slate font-light">No. This is an independent educational tool. Always verify your status with the Social Security Administration directly.</p>
              </div>
              <div>
                <h3 className="font-medium text-lg text-charcoal mb-2">Does this handle SSI?</h3>
                <p className="text-slate font-light">No. Currently, Disability Check is designed specifically for <strong>SSDI (Social Security Disability Insurance)</strong>. SSI has different calculation rules.</p>
              </div>
               <div>
                <h3 className="font-medium text-lg text-charcoal mb-2">What happens if I clear my browser cache?</h3>
                <p className="text-slate font-light">If you are using Guest Mode, clearing your cache <strong>will delete</strong> your work history. We recommend creating an account to securely back up your data.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default About;