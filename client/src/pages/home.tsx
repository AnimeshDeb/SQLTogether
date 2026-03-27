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

  const [quests, setQuests] = useState<Quest[]>([]);
  const [completedQuestIds, setCompletedQuestIds] = useState<Set<string>>(
    new Set(),
  );
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set(),
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMapData = async () => {
      const {
        data: { session },
        error: authError,
      } = await supabase.auth.getSession();

      if (authError || !session) {
        navigate('/auth');
        return;
      }

      try {
        // 1. Fetch Quests
        const { data: questData, error: questError } = await supabase
          .from('quests')
          .select('id, title, category, prompt');
        if (questError) throw questError;
        if (questData) setQuests(questData as Quest[]);

        // 2. Fetch Completed Quests from DB
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('quest_id')
          .eq('user_id', session.user.id)
          .eq('is_completed', true);
        if (progressError) throw progressError;

        if (progressData) {
          setCompletedQuestIds(new Set(progressData.map((p) => p.quest_id)));
        }

        // 3. Fetch Completed Lessons from LocalStorage
        const localLessons = new Set<string>();
        // We will loop through the categories to see if they exist in localStorage
        const categories = [
          ...new Set((questData as Quest[]).map((q) => q.category)),
        ];
        categories.forEach((cat) => {
          if (
            localStorage.getItem(`lesson_completed_${cat.toUpperCase()}`) ===
            'true'
          ) {
            localLessons.add(cat.toUpperCase());
          }
        });
        setCompletedLessons(localLessons);
      } catch (err) {
        console.error('Error loading map data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f111a] flex items-center justify-center">
        <div className="text-emerald-500 font-mono animate-pulse flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          Loading Curriculum...
        </div>
      </div>
    );
  }

  // Group the quests by their category
  const groupedQuests = quests.reduce(
    (acc, quest) => {
      const cat = quest.category.toUpperCase();
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(quest);
      return acc;
    },
    {} as Record<string, Quest[]>,
  );

  return (
    <div className="min-h-screen bg-[#0f111a] text-slate-100 p-8 font-sans selection:bg-emerald-500/30">
      {/* Header Area */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-12 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-900 shadow-[0_0_15px_rgba(16,185,129,0.4)] text-lg">
              {'>_'}
            </div>
            QueryQuest Curriculum
          </h1>
          <p className="text-slate-400 mt-2 font-mono text-sm">
            Follow the path to master SQL.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-slate-500 hover:text-red-400 text-sm font-bold transition-colors px-4 py-2 rounded-md hover:bg-red-500/10"
        >
          Disconnect
        </button>
      </div>

      {/* The Curriculum Roadmap */}
      <div className="max-w-4xl mx-auto space-y-16">
        {Object.entries(groupedQuests).map(([category, categoryQuests]) => {
          const isLessonDone = completedLessons.has(category);

          return (
            <div key={category} className="relative">
              {/* Module Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-800"></div>
                <h2 className="text-2xl font-black text-white tracking-widest uppercase">
                  MODULE: {category}
                </h2>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-800"></div>
              </div>

              {/* 1. Interactive Lesson Card */}
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 pl-2">
                Step 1: Interactive Lesson
              </h3>
              <div
                onClick={() => navigate(`/lesson/${category.toLowerCase()}`)}
                className={`mb-8 group relative bg-[#141620] border rounded-xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex justify-between items-center ${
                  isLessonDone
                    ? 'border-emerald-500/50 hover:border-emerald-400'
                    : 'border-blue-500/30 hover:border-blue-500'
                }`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span
                      className={`text-xs font-bold uppercase tracking-widest ${isLessonDone ? 'text-emerald-500' : 'text-blue-500'}`}
                    >
                      {category} CONCEPT
                    </span>
                    {isLessonDone && (
                      <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                        COMPLETED
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                    Learn how {category} works
                  </h2>
                </div>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${isLessonDone ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-blue-500/10 border-blue-500/30 group-hover:bg-blue-500 group-hover:border-blue-400'}`}
                >
                  <svg
                    className={`w-5 h-5 ${isLessonDone ? 'text-emerald-400' : 'text-blue-400 group-hover:text-slate-900'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {isLessonDone ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    )}
                  </svg>
                </div>
              </div>

              {/* 2. SQL Problems Grid */}
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 pl-2">
                Step 2: SQL Problems
              </h3>
              <div className="flex flex-col gap-4 pl-4 border-l-2 border-slate-800/50 ml-2">
                {' '}
                {categoryQuests.map((quest) => {
                  const isSolved = completedQuestIds.has(quest.id);
                  return (
                    <div
                      key={quest.id}
                      onClick={() => navigate(`/quest/${quest.id}`)}
                      className={`group relative bg-[#141620]/50 border rounded-lg p-5 cursor-pointer transition-all hover:-translate-y-1 ${
                        isSolved
                          ? 'border-emerald-500/30 hover:border-emerald-400'
                          : 'border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      {isSolved && (
                        <div className="absolute top-3 right-3 w-5 h-5 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30">
                          <svg
                            className="w-3 h-3 text-emerald-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                      <h4 className="text-md font-bold text-white mb-2 pr-6">
                        {quest.title}
                      </h4>
                      <p className="text-slate-400 text-xs line-clamp-2">
                        {quest.prompt}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {quests.length === 0 && (
          <div className="py-16 text-center border-2 border-dashed border-slate-800 rounded-xl bg-[#141620]/50">
            <p className="text-slate-500 font-mono mb-2">
              No quests found in the database.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
