import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

interface Quest {
  id: string;
  title: string;
  category: string;
  prompt: string;
}

export default function Home() {
  const navigate = useNavigate();
  
  // App State
  const [quests, setQuests] = useState<Quest[]>([]);
  // We use a Set here because checking if an ID exists in a Set is mathematically instant
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMapData = async () => {
      // 1. The Gatekeeper: Check if they are actually logged in
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
        navigate('/auth'); // Kick them back to login if they aren't authenticated
        return;
      }

      try {
        // 2. Fetch Global Static Data (The Quests Curriculum)
       // 2. Fetch Global Static Data (The Quests Curriculum)
        const { data: questData, error: questError } = await supabase
          .from('quests')
          .select('id, title, category, prompt')
        if (questError) throw questError;
        if (questData) setQuests(questData as Quest[]);

        // 3. Fetch User Dynamic Data (The Progress Checkmarks)
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('quest_id')
          .eq('user_id', session.user.id)
          .eq('is_completed', true);

        if (progressError) throw progressError;

        // 4. Hydrate: Convert the progress array into our fast lookup Set
        if (progressData) {
          const solvedIds = new Set(progressData.map(p => p.quest_id));
          setCompletedIds(solvedIds);
        }
      } catch (err) {
        console.error("Error loading map data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapData();
  }, [navigate]);

  // Secure Logout Handler
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f111a] flex items-center justify-center">
        <div className="text-emerald-500 font-mono animate-pulse flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          Loading Campaign Map...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f111a] text-slate-100 p-8 font-sans selection:bg-emerald-500/30">
      
      {/* Header Area */}
      <div className="max-w-5xl mx-auto flex justify-between items-center mb-12 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-900 shadow-[0_0_15px_rgba(16,185,129,0.4)] text-lg">
              {'>_'}
            </div>
            QueryQuest
          </h1>
          <p className="text-slate-400 mt-2 font-mono text-sm">Select a node to begin your journey.</p>
        </div>
        
        <button 
          onClick={handleLogout}
          className="text-slate-500 hover:text-red-400 text-sm font-bold transition-colors px-4 py-2 rounded-md hover:bg-red-500/10"
        >
          Disconnect
        </button>
      </div>

      {/* The Quest Roadmap / Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quests.map((quest) => {
          // Check if this specific quest ID exists in our completed Set
          const isSolved = completedIds.has(quest.id);

          return (
            <div 
              key={quest.id}
              onClick={() => navigate(`/quest/${quest.id}`)}
              className={`group relative bg-[#141620] border rounded-xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                isSolved 
                  ? 'border-emerald-500/50 hover:border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                  : 'border-slate-800 hover:border-slate-600'
              }`}
            >
              {/* The "Completed" Checkmark Badge */}
              {isSolved && (
                <div className="absolute top-4 right-4 w-7 h-7 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {/* Card Content */}
              <span className={`text-xs font-bold uppercase tracking-widest ${isSolved ? 'text-emerald-500' : 'text-slate-500'}`}>
                {quest.category}
              </span>
              <h2 className="text-xl font-bold text-white mt-2 mb-3 group-hover:text-emerald-400 transition-colors pr-8">
                {quest.title}
              </h2>
              <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed">
                {quest.prompt}
              </p>
              
              {/* Call to Action at bottom of card */}
              <div className={`mt-6 flex items-center text-xs font-bold transition-colors ${isSolved ? 'text-emerald-500' : 'text-slate-500 group-hover:text-emerald-400'}`}>
                {isSolved ? 'REVIEW QUEST ➔' : 'START QUEST ➔'}
              </div>
            </div>
          );
        })}

        {/* Empty State Fallback */}
        {quests.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-800 rounded-xl bg-[#141620]/50">
            <p className="text-slate-500 font-mono mb-2">No quests found in the database.</p>
            <p className="text-slate-600 text-sm">Add some levels via your Supabase dashboard to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}