
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [needsResend, setNeedsResend] = useState(false);
  const navigate = useNavigate();

  // CHECK CONFIGURATION FIRST
  const isConfigured = isSupabaseConfigured();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setNeedsResend(false);

    if (!isConfigured || !supabase) {
      setError("Supabase is not configured. Please add keys to constants.ts");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN FLOW ---
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      } else {
        // --- SIGN UP FLOW ---
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
        });
        
        if (error) throw error;

        if (data.user && !data.session) {
          setSuccessMsg("Success! Please check your email to confirm your account.");
          setIsLogin(true);
        } else {
          navigate('/onboarding');
        }
      }
    } catch (err: any) {
      console.error(err);
      let msg = err.message || "An unexpected error occurred";
      
      // Improve error messages
      if (msg.includes("Invalid login credentials")) {
        msg = "Incorrect email or password. Please try again.";
      }
      
      setError(msg);
      
      // Check for specific "Email not confirmed" error from Supabase
      if (msg.includes("Email not confirmed")) {
        setNeedsResend(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase!.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw error;
      setSuccessMsg("Confirmation email resent! Please check your inbox.");
      setNeedsResend(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address to reset your password.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase!.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/#/auth?reset=true', // Adjust if using different routing
      });
      if (error) throw error;
      setSuccessMsg("Password reset email sent. Please check your inbox.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-6rem)] flex flex-col lg:flex-row">
        
        {/* Left Side - Art/Message */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-burgundy min-h-[600px]">
            {/* Illustration Image */}
            <img 
              src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop" 
              alt="Calm office workspace with plants and light" 
              className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
            />
            {/* Enhanced Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-burgundy via-burgundy/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-burgundy/30 to-transparent"></div>
            
            <div className="relative z-10 p-16 flex flex-col justify-end h-full text-white">
                <blockquote className="mb-12 max-w-lg">
                   <div className="mb-6 text-coral/80">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H16.017C18.2261 5 20.017 6.79086 20.017 9V15C20.017 17.2091 18.2261 19 16.017 19H14.017V21ZM5.01697 21L5.01697 18C5.01697 16.8954 5.9124 16 7.01697 16H10.017C10.5693 16 11.017 15.5523 11.017 15V9C11.017 8.44772 10.5693 8 10.017 8H6.01697C5.46468 8 5.01697 8.44772 5.01697 9V11C5.01697 11.5523 4.56925 12 4.01697 12H3.01697V5H7.01697C9.22611 5 11.017 6.79086 11.017 9V15C11.017 17.2091 9.22611 19 7.01697 19H5.01697V21Z" />
                      </svg>
                   </div>
                  <p className="text-3xl font-serif leading-relaxed italic opacity-95 mb-8">
                    "I used to worry about every paycheck. Now I know exactly where I stand, and I can focus on my work."
                  </p>
                  <footer className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-coral flex items-center justify-center text-white font-serif font-bold text-xl shadow-lg">S</div>
                     <div>
                       <span className="block font-bold text-lg">Sarah M.</span>
                       <span className="block text-sm text-peach/80">SSDI Recipient & Designer</span>
                     </div>
                  </footer>
                </blockquote>
            </div>
        </div>

        {/* Right Side - Form OR Setup Guide */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 xl:p-24 bg-blush">
          <Card variant="glass" className="w-full max-w-md fade-in-up border-none overflow-visible">
            
            {!isConfigured ? (
               /* SETUP GUIDE STATE */
               <div className="text-center">
                  <div className="w-16 h-16 bg-taupe/20 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                    🛠️
                  </div>
                  <h2 className="text-2xl font-serif text-burgundy mb-4">Connect Your Database</h2>
                  <p className="text-slate font-light mb-8">
                    To enable Login and Cloud Sync, you need to add your Supabase API keys to the code.
                  </p>
                  
                  <div className="text-left bg-gray-50/50 p-4 rounded-xl border border-taupe/10 mb-8 text-sm text-slate space-y-3">
                    <p><strong>1.</strong> Go to <a href="https://database.new" target="_blank" rel="noreferrer" className="text-coral underline">database.new</a></p>
                    <p><strong>2.</strong> Open Project Settings → API</p>
                    <p><strong>3.</strong> Copy URL & Anon Key</p>
                    <p><strong>4.</strong> Paste into <code className="bg-gray-200 px-1 py-0.5 rounded text-charcoal">constants.ts</code></p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
                      I've Added the Keys (Reload)
                    </Button>
                    <Link to="/dashboard">
                      <Button fullWidth className="bg-burgundy hover:bg-coral">
                         Continue as Guest
                      </Button>
                    </Link>
                  </div>
               </div>
            ) : (
               /* LOGIN FORM STATE */
               <>
                <div className="mb-10">
                  <span className="text-coral font-bold tracking-widest text-xs uppercase mb-3 block animate-fade-in-up">
                    {isLogin ? 'Welcome Back' : 'Start Your Journey'}
                  </span>
                  <h1 className="text-4xl md:text-5xl font-serif text-burgundy mb-4 animate-fade-in-up delay-100">
                    {isLogin ? 'Good to see you again.' : 'Peace of mind starts here.'}
                  </h1>
                  <p className="text-slate text-lg font-light leading-relaxed animate-fade-in-up delay-200">
                    {isLogin 
                      ? 'Log in to continue tracking your work months and protecting your benefits.' 
                      : 'Create a secure account to sync your history across devices and never lose your progress.'}
                  </p>
                </div>

                {successMsg && (
                  <div role="alert" aria-live="polite" className="p-6 bg-successGreen/10 border border-successGreen text-charcoal rounded-xl mb-6">
                    <h3 className="text-successGreen font-bold mb-2">Check your inbox</h3>
                    <p className="text-sm">{successMsg}</p>
                    <button 
                      onClick={() => setSuccessMsg(null)}
                      className="mt-4 text-sm font-medium underline text-successGreen hover:text-charcoal"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                <form className="space-y-6 animate-fade-in-up delay-300" onSubmit={handleAuth}>
                  <Input 
                    label="Email" 
                    type="email" 
                    placeholder="jane@example.com" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="bg-transparent"
                    autoComplete="email"
                  />
                  <div className="space-y-1">
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-semibold text-burgundy">Password</label>
                        {isLogin && (
                            <button 
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-xs text-slate hover:text-coral underline transition-colors"
                            >
                                Forgot password?
                            </button>
                        )}
                    </div>
                    <input
                      className="w-full px-4 py-3 rounded-xl border bg-white text-charcoal placeholder-slate/50 
                      focus:outline-none focus:ring-2 focus:ring-coral focus:border-coral transition-colors border-taupe"
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete={isLogin ? "current-password" : "new-password"}
                    />
                    {!isLogin && (
                        <p className="text-xs text-slate pl-1">Must be at least 6 characters</p>
                    )}
                  </div>
                  
                  {error && (
                    <div role="alert" aria-live="assertive" className="p-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl">
                      <p className="font-bold mb-1">Error</p>
                      <p>{error}</p>
                      
                      {needsResend && (
                        <button 
                          type="button"
                          onClick={handleResend}
                          className="mt-3 text-xs font-bold uppercase tracking-wide text-red-800 underline hover:text-red-950"
                        >
                          Resend Confirmation Email
                        </button>
                      )}
                    </div>
                  )}

                  <Button fullWidth type="submit" disabled={loading} className="py-4 text-lg shadow-lg shadow-coral/20 hover:shadow-xl hover:shadow-coral/30">
                    {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                  </Button>
                </form>

                <div className="mt-10 text-center animate-fade-in-up delay-300">
                  <span className="text-slate font-light">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                  </span>
                  <button 
                    onClick={() => { setIsLogin(!isLogin); setError(null); setSuccessMsg(null); setNeedsResend(false); }}
                    className="font-medium text-burgundy hover:text-coral transition-colors underline decoration-2 decoration-transparent hover:decoration-coral underline-offset-4"
                  >
                    {isLogin ? 'Sign up for free' : 'Log in'}
                  </button>
                </div>
               </>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
