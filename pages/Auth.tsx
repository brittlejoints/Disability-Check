import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Input from '../components/Input';
import Button from '../components/Button';
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
      <div className="min-h-[calc(100vh-6rem)] flex flex-col md:flex-row">
        
        {/* Left Side - Art/Message */}
        <div className="hidden md:flex md:w-1/2 bg-burgundy relative overflow-hidden items-center justify-center p-12 text-white">
            <div className="absolute top-0 left-0 w-full h-full opacity-30">
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-coral rounded-full blur-[100px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-peach rounded-full blur-[80px]"></div>
            </div>
            <div className="relative z-10 max-w-lg">
                <h2 className="text-5xl font-serif mb-6 leading-tight">
                    "Clarity is the first step to confidence."
                </h2>
                <p className="text-xl font-light opacity-80">
                    Join thousands of people who are taking control of their work journey and protecting their benefits.
                </p>
            </div>
        </div>

        {/* Right Side - Form OR Setup Guide */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-blush">
          <div className="w-full max-w-md fade-in-up">
            
            {!isConfigured ? (
               /* SETUP GUIDE STATE */
               <div className="bg-white p-8 rounded-3xl shadow-soft border border-taupe/20 text-center">
                  <div className="w-16 h-16 bg-taupe/20 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                    🛠️
                  </div>
                  <h2 className="text-2xl font-serif text-burgundy mb-4">Connect Your Database</h2>
                  <p className="text-slate font-light mb-8">
                    To enable Login and Cloud Sync, you need to add your Supabase API keys to the code.
                  </p>
                  
                  <div className="text-left bg-gray-50 p-4 rounded-xl border border-taupe/10 mb-8 text-sm text-slate space-y-3">
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
                  <h1 className="text-4xl font-serif text-burgundy mb-3">
                    {isLogin ? 'Welcome back' : 'Create an account'}
                  </h1>
                  <p className="text-slate font-light text-lg">
                    {isLogin ? 'Sign in to access your saved history.' : 'Start tracking your work journey securely.'}
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

                <form className="space-y-6" onSubmit={handleAuth}>
                  <Input 
                    label="Email" 
                    type="email" 
                    placeholder="jane@example.com" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="bg-transparent"
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

                  <Button fullWidth type="submit" disabled={loading} className="py-4 text-lg shadow-lg shadow-coral/20">
                    {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                  </Button>
                </form>

                <div className="mt-8 text-center">
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

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;