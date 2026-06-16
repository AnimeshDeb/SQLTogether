import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const initialEmail = location.state?.userEmail || '';
  const [email, setUserEmail] = useState(initialEmail);

  // onAuthStateChange runs every time user lands on page. So after user clicks magic link, they land on page and if first time user 'SIGNED_IN' is checked or
  // if returning user 'INITIAL_SESSION' is checked
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
          setIsLoading(true); // Show a loading state during the redirect
          setTimeout(() => navigate('/home'), 1500);
        }
      },
    );

    // cleanup
    return () => subscription.unsubscribe();
  }, [navigate]);

  // responsible for sending magic link for both signup and signin. Point to be noted that magic link doesnt need to be sent if i am returning user...
  const handleMagicLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: window.location.origin + '/home',
      },
    });

    setIsLoading(false);

    if (error) {
      console.error('Magic link error: ', error.message);
      alert(error.message);
    } else {
      setIsSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f111a] text-slate-100 font-sans flex items-center justify-center p-6 selection:bg-emerald-500/30 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#141620] border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            {/* Geometric Cat Logo */}
            <svg
              className="w-5 h-5 text-slate-900"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Head Silhouette */}
              <path
                d="M12 21c-4.97 0-9-3.134-9-7a6.98 6.98 0 0 1 1.73-4.57L3 4.5 8.07 6.3A10.36 10.36 0 0 1 12 5.5c1.42 0 2.78.21 4 .58L21 4.5l-1.73 4.93A6.98 6.98 0 0 1 21 14c0 3.866-4.03 7-9 7z"
                fill="currentColor"
              />

              {/* The Eyes (Solid Circles) */}
              {/* Note: stroke="none" prevents the global SVG stroke from outlining the dots in dark gray */}
              <circle cx="9" cy="12.5" r="1.2" fill="#10b981" stroke="none" />
              <circle cx="15" cy="12.5" r="1.2" fill="#10b981" stroke="none" />

              {/* Tiny Nose */}
              <polygon
                points="12,15 11,14 13,14"
                fill="#10b981"
                stroke="none"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {isSent ? 'Check Your Inbox' : isSignUp ? 'Sign Up' : 'Log In'}
          </h2>
        </div>

        {isSent ? (
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <p className="text-sm text-slate-400 mb-6">
              We sent a magic link to{' '}
              <span className="text-emerald-400">{email}</span>. Click it to log
              in.
            </p>
            <button
              onClick={() => setIsSent(false)}
              className="text-xs text-slate-500 hover:text-emerald-400"
            >
              Back to login
            </button>
          </div>
        ) : (
          <>
            <div className="flex bg-[#0f111a] p-1 rounded-lg border border-slate-800 mb-8">
              <button
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${isSignUp ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500'}`}
              >
                Sign Up
              </button>
              <button
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${!isSignUp ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500'}`}
              >
                Sign In
              </button>
            </div>

            <form className="space-y-5" onSubmit={handleMagicLink}>
              {/* {isSignUp && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Player Name</label>
                  <input type="text" placeholder="SQL_Slayer" className="w-full bg-[#0f111a] border border-slate-700 rounded-lg px-4 py-3 text-sm focus:border-emerald-500 text-white transition-colors" />
                </div>
              )} */}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  required
                  value={email}
                  onChange={(e) => setUserEmail(e.target.value)}
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-[#0f111a] border border-slate-700 rounded-lg px-4 py-3 text-sm focus:border-emerald-500 text-white transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-sm font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                ) : (
                  <>
                    {isSignUp
                      ? 'Send Magic Link to Sign Up'
                      : 'Send Login Link'}
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
