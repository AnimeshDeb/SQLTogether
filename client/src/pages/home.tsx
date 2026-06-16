import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useQuestStore } from '../store/questStore';

export default function Home() {
  const navigate = useNavigate();

  // 🌟 Grab global state
  const {
    quests,
    completedQuestIds,
    completedLessons,
    isLoaded,
    isLoading,
    fetchData,
  } = useQuestStore();

  const [activeCategory, setActiveCategory] = useState<string>('');
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const loadSessionAndData = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error || !session) {
        navigate('/auth');
        return;
      }
      await fetchData(session.user.id);
    };

    loadSessionAndData();
  }, [navigate, fetchData]);

  const groupedQuests = useMemo(() => {
    const groups = quests.reduce(
      (acc, quest) => {
        const cat = quest.category.toUpperCase();
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(quest);
        return acc;
      },
      {} as Record<string, typeof quests>,
    );

    if (isLoaded && !groups['CORE CONCEPTS']) {
      groups['CORE CONCEPTS'] = [];
    }
    return groups;
  }, [quests, isLoaded]);

  const categories = useMemo(() => {
    const originalCategories = Object.keys(groupedQuests).filter(
      (cat) => cat !== 'CORE CONCEPTS',
    );
    return [...originalCategories, 'CORE CONCEPTS'];
  }, [groupedQuests]);

  // SCROLL SPY
  useEffect(() => {
    if (categories.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          setActiveCategory(visibleEntries[0].target.id);
        }
      },
      { rootMargin: '-10% 0px -60% 0px', threshold: 0 },
    );

    const sections = document.querySelectorAll('.module-section');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, [categories]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const scrollToCategory = (category: string) => {
    isScrollingRef.current = true;
    setActiveCategory(category);

    const element = document.getElementById(category);
    if (element) element.scrollIntoView({ behavior: 'smooth' });

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 800);
  };

  if (isLoading || !isLoaded) {
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
        <div className="flex items-center gap-4">
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
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Data<span className="text-emerald-400">Kibble</span>
            </h1>
            <p className="text-slate-400 font-mono text-xs mt-1">
              Follow the path to master SQL.
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-slate-500 hover:text-red-400 text-sm font-bold transition-colors px-4 py-2 rounded-md hover:bg-red-500/10 self-start sm:self-auto"
        >
          Logout
        </button>
      </div>

      {/* Main Layout */}
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 relative">
        {/* Sidebar */}
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
                    ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                        : 'text-slate-400 border border-transparent hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-400'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    {category}
                  </div>
                  {isLessonDone && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center ml-4">
                      <svg
                        className="w-3 h-3 text-emerald-500"
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
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
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
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-800"></div>
                  <h2 className="text-2xl font-black text-white tracking-widest uppercase">
                    MODULE: {category}
                  </h2>
                  <div className="h-px w-8 lg:flex-1 bg-gradient-to-l from-transparent to-slate-800"></div>
                </div>

                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 pl-2">
                  Step 1: Interactive Lesson
                </h3>
                <div
                  onClick={() =>
                    navigate(
                      `/lesson/${category.toLowerCase().replace(/\s+/g, '-')}`,
                    )
                  }
                  className={`mb-10 group relative bg-[#141620] border rounded-xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex justify-between items-center ${
                    isLessonDone
                      ? 'border-emerald-500/50 hover:border-emerald-400'
                      : 'border-slate-800 hover:border-emerald-500/50'
                  }`}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <span
                        className={`text-xs font-bold uppercase tracking-widest ${isLessonDone ? 'text-emerald-500' : 'text-slate-400'}`}
                      >
                        {category} CONCEPT
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {isCoreConcepts
                        ? 'Review the Interview Study Guide'
                        : `Learn how ${category} works`}
                    </h2>
                  </div>
                  <div
                    className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center border transition-colors ${isLessonDone ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800 border-slate-700 group-hover:bg-emerald-500 group-hover:border-emerald-400'}`}
                  >
                    <svg
                      className={`w-5 h-5 ${isLessonDone ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-900'}`}
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

                {categoryQuests.length > 0 ? (
                  <>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 pl-2">
                      Step 2: SQL Problems
                    </h3>
                    <div className="flex flex-col gap-4 pl-2 sm:pl-4 sm:border-l-2 border-slate-800/50 sm:ml-2">
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
                  </>
                ) : (
                  isCoreConcepts && (
                    <div className="pl-2 sm:pl-4 sm:border-l-2 border-indigo-500/30 sm:ml-2 py-4">
                      <p className="text-slate-400 text-sm italic flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-indigo-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        This module is a study guide. There are no coding
                        problems required!
                      </p>
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
}
