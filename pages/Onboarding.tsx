import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';

const Onboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleNext = () => setStep(step + 1);
  const handleFinish = () => navigate('/dashboard');

  return (
    <Layout>
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-blush relative overflow-hidden">
        
        {/* Ambient Background */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/40 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-2xl w-full relative z-10 text-center">
          
          {/* STEP 1: WELCOME */}
          {step === 1 && (
            <div className="fade-in-up">
              <div className="w-16 h-16 bg-burgundy rounded-full flex items-center justify-center mx-auto mb-8 text-white text-2xl font-serif">
                👋
              </div>
              <h1 className="text-5xl font-serif text-burgundy mb-6">Welcome to Clarity</h1>
              <p className="text-xl text-slate font-light leading-relaxed mb-12">
                Disability Check is designed to help you navigate your return to work with clarity. 
                We track your Trial Work Period so you never have to guess about your benefits status.
              </p>
              <Button onClick={handleNext} className="px-12 py-4 text-lg rounded-full shadow-xl shadow-coral/20">
                Let's Get Started
              </Button>
            </div>
          )}

          {/* STEP 2: STATUS CHECK */}
          {step === 2 && (
            <div className="fade-in-up">
              <h2 className="text-4xl font-serif text-burgundy mb-8">Where are you starting from?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <button 
                    onClick={handleNext}
                    className="p-8 bg-white border border-transparent hover:border-coral rounded-3xl shadow-sm hover:shadow-md transition-all text-left group"
                >
                    <div className="w-12 h-12 bg-peach rounded-full flex items-center justify-center mb-4 text-coral group-hover:scale-110 transition-transform">
                        🌱
                    </div>
                    <h3 className="text-xl font-bold text-burgundy mb-2">Fresh Start</h3>
                    <p className="text-slate font-light text-sm">I haven't worked while on benefits, or it's been a long time.</p>
                </button>

                <button 
                    onClick={handleNext}
                    className="p-8 bg-white border border-transparent hover:border-coral rounded-3xl shadow-sm hover:shadow-md transition-all text-left group"
                >
                    <div className="w-12 h-12 bg-epeBlue/20 rounded-full flex items-center justify-center mb-4 text-epeBlue group-hover:scale-110 transition-transform">
                        📅
                    </div>
                    <h3 className="text-xl font-bold text-burgundy mb-2">I have history</h3>
                    <p className="text-slate font-light text-sm">I've worked some months recently and need to log them.</p>
                </button>
              </div>
              <button onClick={() => setStep(1)} className="text-slate hover:text-burgundy transition-colors text-sm">
                Back
              </button>
            </div>
          )}

          {/* STEP 3: ALL SET */}
          {step === 3 && (
            <div className="fade-in-up">
              <div className="w-20 h-20 bg-successGreen/20 text-successGreen rounded-full flex items-center justify-center mx-auto mb-8 text-3xl">
                ✓
              </div>
              <h2 className="text-4xl font-serif text-burgundy mb-6">You're all set!</h2>
              <p className="text-xl text-slate font-light leading-relaxed mb-12">
                Your dashboard is ready. Your data is secure, whether you are tracking as a guest or logged in.
              </p>
              <Button onClick={handleFinish} className="px-12 py-4 text-lg rounded-full bg-burgundy hover:bg-coral">
                Go to Dashboard
              </Button>
            </div>
          )}

          {/* Progress Dots */}
          <div className="flex justify-center gap-3 mt-16">
            {[1, 2, 3].map((s) => (
                <div 
                    key={s} 
                    className={`h-2 rounded-full transition-all duration-500 ${s === step ? 'w-8 bg-burgundy' : 'w-2 bg-taupe/40'}`}
                ></div>
            ))}
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Onboarding;