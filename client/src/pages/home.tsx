import React, { useEffect, useState, useMemo } from 'react';
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
  const [activeCategory, setActiveCategory] = useState<string>('');

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
        
        // Extract categories and manually add 'CORE CONCEPTS' to check local storage
        const dbCategories = [...new Set((questData as Quest[]).map((q) => q.category))];
        const allCategoriesToCheck = [...dbCategories, 'CORE CONCEPTS'];
        
        allCategoriesToCheck.forEach((cat) => {
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

  // 🌟 Memoize groupedQuests to prevent recalculating on every render
  const groupedQuests = useMemo(() => {
    const groups = quests.reduce((acc, quest) => {
      const cat = quest.category.toUpperCase();
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(quest);
      return acc;
    }, {} as Record<string, Quest[]>);

    // Manually inject "CORE CONCEPTS" so the lesson shows up even without quests
    if (!isLoading && !groups['CORE CONCEPTS']) {
      groups['CORE CONCEPTS'] = [];
    }

    return groups;
  }, [quests, isLoading]);

  // 🌟 Memoize categories to keep the array reference stable for the Scroll Spy
  const categories = useMemo(() => {
    // Preserve original database order, but force "CORE CONCEPTS" to the end
    const originalCategories = Object.keys(groupedQuests).filter(cat => cat !== 'CORE CONCEPTS');
    return [...originalCategories, 'CORE CONCEPTS'];
  }, [groupedQuests]);

  // SCROLL SPY: Automatically detect which section is in view
  useEffect(() => {
    if (categories.length === 0) return;
    
    // Set initial active tab
    if (!activeCategory && categories.length > 0) {
      setActiveCategory(categories[0]);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          setActiveCategory(visibleEntries[0].target.id);
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );

    const sections = document.querySelectorAll('.module-section');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, [categories, activeCategory]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const scrollToCategory = (category: string) => {
    const element = document.getElementById(category);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
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

  return (
    <div className="min-h-screen bg-[#0f111a] text-slate-100 p-4 sm:p-8 font-sans selection:bg-emerald-500/30">
      
      {/* Header Area */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 lg:mb-12 border-b border-slate-800 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-900 shadow-[0_0_15px_rgba(16,185,129,0.4)] text-lg">
              {'>_'}
            </div>
            QueryQuest
          </h1>
          <p className="text-slate-400 mt-2 font-mono text-sm ml-[3.25rem]">
            Follow the path to master SQL.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-slate-500 hover:text-red-400 text-sm font-bold transition-colors px-4 py-2 rounded-md hover:bg-red-500/10 self-start sm:self-auto"
        >
          Disconnect
        </button>
      </div>

      {/* Main Layout Container (Sidebar + Content) */}
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 relative">
        
        {/* 🌟 STICKY SIDEBAR NAVIGATION 🌟 */}
        <div className="w-full lg:w-64 shrink-0 lg:sticky lg:top-8 h-fit z-20 top-0 bg-[#0f111a]/95 backdrop-blur-md lg:bg-transparent -mx-4 px-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0 py-4 lg:py-0 border-b border-slate-800 lg:border-none">
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 hide-scrollbar">
            <h3 className="hidden lg:flex text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 pl-4">
              Curriculum Tabs
            </h3>
            
            {categories.map((category) => {
              const isActive = activeCategory === category;
              const isLessonDone = completedLessons.has(category);
              
              return (
                <button
                  key={category}
                  onClick={() => scrollToCategory(category)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 font-bold text-sm tracking-wide whitespace-nowrap shrink-0 lg:shrink w-auto lg:w-full group
                    ${isActive 
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-sm' 
                      : 'text-slate-400 border border-transparent hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {category}
                  </div>
                  {isLessonDone && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center ml-4">
                      <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 🌟 MAIN CURRICULUM CONTENT 🌟 */}
        <div className="flex-1 max-w-4xl space-y-24">
          {categories.map((category) => {
            const categoryQuests = groupedQuests[category];
            const isLessonDone = completedLessons.has(category);
            const isCoreConcepts = category === 'CORE CONCEPTS';

            return (
              <div 
                key={category} 
                id={category} 
                className="relative module-section scroll-mt-24 lg:scroll-mt-8"
              >
                {/* Module Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-800"></div>
                  <h2 className="text-2xl font-black text-white tracking-widest uppercase">
                    MODULE: {category}
                  </h2>
                  <div className="h-px w-8 lg:flex-1 bg-gradient-to-l from-transparent to-slate-800"></div>
                </div>

                {/* 1. Interactive Lesson Card */}
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 pl-2">
                  Step 1: Interactive Lesson
                </h3>
                <div
                  // Replaced spaces with hyphens for clean URLs
                  onClick={() => navigate(`/lesson/${category.toLowerCase().replace(/\s+/g, '-')}`)}
                  className={`mb-10 group relative bg-[#141620] border rounded-xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex justify-between items-center ${
                    isLessonDone
                      ? 'border-emerald-500/50 hover:border-emerald-400'
                      : 'border-blue-500/30 hover:border-blue-500'
                  }`}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-1">
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
                      {isCoreConcepts ? 'Review the Interview Study Guide' : `Learn how ${category} works`}
                    </h2>
                  </div>
                  <div
                    className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center border transition-colors ${isLessonDone ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-blue-500/10 border-blue-500/30 group-hover:bg-blue-500 group-hover:border-blue-400'}`}
                  >
                    <svg
                      className={`w-5 h-5 ${isLessonDone ? 'text-emerald-400' : 'text-blue-400 group-hover:text-slate-900'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {isLessonDone ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      )}
                    </svg>
                  </div>
                </div>

                {/* 2. SQL Problems Grid OR Empty State message */}
                {categoryQuests.length > 0 ? (
                  <>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 pl-2">
                      Step 2: SQL Problems
                    </h3>
                    <div className="flex flex-col gap-4 pl-2 sm:pl-4 sm:border-l-2 border-slate-800/50 sm:ml-2">
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
                                <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
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
                  </>
                ) : (
                  isCoreConcepts && (
                    <div className="pl-2 sm:pl-4 sm:border-l-2 border-indigo-500/30 sm:ml-2 py-4">
                      <p className="text-slate-400 text-sm italic flex items-center gap-2">
                        <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        This module is a pure study guide and flashcard gauntlet. There are no coding quests required!
                      </p>
                    </div>
                  )
                )}
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
      
      {/* Inline styles to hide the scrollbar for the mobile horizontal nav */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}