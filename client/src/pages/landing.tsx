import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
export default function LandingPage() {
  const navigate = useNavigate();

  const [userEmail, setUserEmail] = useState('');
  const [error, setError] = useState('');
  return (
    <div className="min-h-screen bg-[#0f111a] text-slate-100 font-sans selection:bg-emerald-500/30">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center border-b border-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center font-bold text-slate-900 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            {'>_'}
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Query<span className="text-emerald-400">Quest</span>
          </span>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-16 pb-24 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-amber-500/30 rounded-full text-xs font-bold text-amber-400 bg-amber-500/10 uppercase tracking-wide">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                clipRule="evenodd"
              />
            </svg>
            Season 1 Campaign Open
          </div>

          <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            <span className="block lg:whitespace-nowrap">
              Master the SQL basics.
            </span>
            <span className="block text-emerald-400 lg:whitespace-nowrap">
              Don't let the party down.
            </span>
          </h1>

          <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-lg">
            Master database syntax through daily, bite-sized coding quests. Join
            a team, keep your streak alive, and unlock the final boss: the
            technical interview.
          </p>

          <div className="flex flex-col gap-2 max-w-lg">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={userEmail}
                onChange={(e) => {
                  e.preventDefault();
                  setUserEmail(e.target.value);
                  if (error) setError(''); // Clears the error the moment they start fixing it
                }}
                placeholder="Enter email to claim your spot..."
                className={`flex-1 bg-slate-900 border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 text-white placeholder-slate-500 transition-colors ${
                  error
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500'
                }`}
              />

              <button
                onClick={() => {
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!emailRegex.test(userEmail)) {
                    setError('Please enter a valid email to join the party.');
                    return;
                  }
                  setError('');
                  navigate('/auth', { state: { userEmail: userEmail } });
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-sm font-bold py-3 px-8 rounded-lg transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)] whitespace-nowrap"
              >
                Join the Campaign
              </button>
            </div>

            {/* This is the missing piece that actually shows the error text! */}
            {error && (
              <p className="text-sm text-red-400 font-medium ml-1">{error}</p>
            )}
          </div>
        </div>

        {/* Right Side: Interactive Editor Mockup */}
        <div className="relative">
          <div className="absolute -top-6 -right-4 bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-2xl z-10 flex items-center gap-3 transform rotate-3">
            <div className="bg-amber-500/20 p-2 rounded-lg">
              <span className="text-2xl">🔥</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Team Streak
              </p>
              <p className="text-lg font-bold text-white">Day 4 / 14</p>
            </div>
          </div>

          <div className="bg-[#1e1e2e] rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
            <div className="bg-[#181825] px-4 py-3 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                <div className="w-3 h-3 rounded-full bg-slate-600"></div>
              </div>
              <span className="text-xs font-mono text-slate-400">
                quest_04.sql
              </span>
            </div>

            <div className="p-6 font-mono text-sm leading-relaxed">
              <div className="text-slate-500 mb-4 border-l-2 border-emerald-500 pl-3">
                -- Daily Quest: <br />
                -- Retrieve all 'customer_id' and 'amount' <br />
                -- from the payments table where amount is over $50.
              </div>
              <div>
                <span className="text-pink-400">SELECT</span>{' '}
                <span className="text-white">customer_id, amount</span>
                <br />
                <span className="text-pink-400">FROM</span>{' '}
                <span className="text-amber-200">payments</span>
                <br />
                <span className="text-pink-400">WHERE</span>{' '}
                <span className="text-white">amount {'>'} </span>
                <span className="text-purple-400">50</span>
                <span className="text-white">;</span>
              </div>
            </div>

            <div className="bg-[#181825] px-6 py-4 border-t border-slate-700 flex justify-between items-center">
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Ready to execute
              </span>
              <button className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-4 rounded transition-colors flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-emerald-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                Run Code
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* --- NEW SECTION: Features & Roadmap --- */}
      <section className="border-t border-slate-800/50 bg-[#141620] py-24 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="container mx-auto px-6 max-w-5xl relative z-10">
          {/* Core Philosophy Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-24 text-center">
            <div className="p-6 rounded-2xl bg-slate-800/20 border border-slate-700/50">
              <div className="text-3xl mb-4">🧩</div>
              <h3 className="text-lg font-bold text-white mb-2">
                Bite-Sized Syntax
              </h3>
              <p className="text-sm text-slate-400">
                No massive 10-table joins on Day 1. We focus strictly on the
                fundamental commands until they become muscle memory.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/20 border border-slate-700/50">
              <div className="text-3xl mb-4">🤝</div>
              <h3 className="text-lg font-bold text-white mb-2">
                Team Accountability
              </h3>
              <p className="text-sm text-slate-400">
                Your daily quest completion drives your party's score. Don't
                learn in a vacuum—learn with a cohort that relies on you.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/20 border border-slate-700/50">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-lg font-bold text-white mb-2">
                Instant Execution
              </h3>
              <p className="text-sm text-slate-400">
                Zero database setup required. Type your code into our browser
                engine and get immediate, automated grading.
              </p>
            </div>
          </div>

          {/* The Roadmap */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              The Campaign Roadmap
            </h2>
            <p className="text-lg text-slate-400">
              A clear, step-by-step path from absolute beginner to
              interview-ready.
            </p>
          </div>

          {/* Vertical Timeline */}
          <div className="max-w-3xl mx-auto">
            {/* Level 1: Active */}
            <div className="relative pl-8 sm:pl-32 py-6 group">
              {/* Timeline Line */}
              <div className="absolute left-4 sm:left-[7.5rem] top-0 bottom-0 w-px bg-emerald-500/30 group-last:bg-transparent"></div>

              {/* Timeline Node */}
              <div className="absolute left-2 sm:left-[7.1rem] top-8 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-[#141620] shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>

              {/* Desktop Level Label */}
              <div className="hidden sm:block absolute left-0 top-7 w-20 text-right font-bold text-emerald-400 text-sm uppercase tracking-wider">
                Level 1
              </div>

              <div className="bg-slate-800/40 border border-emerald-500/30 rounded-xl p-6 transition-all hover:bg-slate-800/60">
                <span className="sm:hidden text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2 block">
                  Level 1
                </span>
                <h3 className="text-xl font-bold text-white mb-2">
                  The Building Blocks
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  Start simple. Learn how to ask the database basic questions
                  and filter the noise.
                </p>
                <div className="flex gap-2 flex-wrap font-mono text-xs">
                  <span className="px-2 py-1 rounded bg-slate-900 text-pink-400 border border-slate-700">
                    SELECT
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-900 text-pink-400 border border-slate-700">
                    WHERE
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-900 text-pink-400 border border-slate-700">
                    ORDER BY
                  </span>
                </div>
              </div>
            </div>

            {/* Level 2: Locked */}
            <div className="relative pl-8 sm:pl-32 py-6 group">
              <div className="absolute left-4 sm:left-[7.5rem] top-0 bottom-0 w-px bg-slate-700 group-last:bg-transparent"></div>
              <div className="absolute left-2 sm:left-[7.1rem] top-8 w-4 h-4 rounded-full bg-slate-700 ring-4 ring-[#141620]"></div>

              <div className="hidden sm:block absolute left-0 top-7 w-20 text-right font-bold text-slate-500 text-sm uppercase tracking-wider">
                Level 2
              </div>

              <div className="bg-slate-800/20 border border-slate-700/50 rounded-xl p-6 opacity-75">
                <span className="sm:hidden text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 block">
                  Level 2
                </span>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-slate-300">
                    Aggregation & Math
                  </h3>
                  <svg
                    className="w-5 h-5 text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm mb-4">
                  Unlock the ability to summarize massive datasets into
                  meaningful metrics.
                </p>
                <div className="flex gap-2 flex-wrap font-mono text-xs opacity-60">
                  <span className="px-2 py-1 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    GROUP BY
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    HAVING
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    COUNT()
                  </span>
                </div>
              </div>
            </div>

            {/* Level 3: Locked */}
            <div className="relative pl-8 sm:pl-32 py-6 group">
              <div className="absolute left-4 sm:left-[7.5rem] top-0 bottom-0 w-px bg-slate-700 group-last:bg-transparent"></div>
              <div className="absolute left-2 sm:left-[7.1rem] top-8 w-4 h-4 rounded-full bg-slate-700 ring-4 ring-[#141620]"></div>

              <div className="hidden sm:block absolute left-0 top-7 w-20 text-right font-bold text-slate-500 text-sm uppercase tracking-wider">
                Level 3
              </div>

              <div className="bg-slate-800/20 border border-slate-700/50 rounded-xl p-6 opacity-75">
                <span className="sm:hidden text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 block">
                  Level 3
                </span>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-slate-300">
                    The Relational Realm
                  </h3>
                  <svg
                    className="w-5 h-5 text-slate-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm mb-4">
                  Learn how to weave different tables together to answer complex
                  business questions.
                </p>
                <div className="flex gap-2 flex-wrap font-mono text-xs opacity-60">
                  <span className="px-2 py-1 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    INNER JOIN
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    LEFT JOIN
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    COALESCE()
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
