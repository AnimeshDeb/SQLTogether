// import { useEffect, useState, useMemo, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { supabase } from '../supabase'; // Adjust path if needed

// // Interface matching the homework table schema
// interface Homework {
//   id: number;
//   title: string;
//   week: number;
//   difficulty: string;
//   topics: string[];
//   prompt: string;
// }

// export default function Assignments() {
//   const navigate = useNavigate();

//   const [assignments, setAssignments] = useState<Homework[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [activeWeek, setActiveWeek] = useState<string>('');
  
//   const isScrollingRef = useRef(false);
//   const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   // Fetch session and homework data
//   useEffect(() => {
//     const loadSessionAndData = async () => {
//       const {
//         data: { session },
//         error: authError,
//       } = await supabase.auth.getSession();
      
//       if (authError || !session) {
//         navigate('/auth');
//         return;
//       }

//       // Fetch the homework problems from Supabase
//       const { data, error } = await supabase
//         .from('homework')
//         .select('id, title, week, difficulty, topics, prompt')
//         .order('week', { ascending: true })
//         .order('id', { ascending: true }); // Keep problems ordered within the week

//       if (data && !error) {
//         setAssignments(data as Homework[]);
//       } else {
//         console.error("Error fetching homework:", error);
//       }
//       setIsLoading(false);
//     };

//     loadSessionAndData();
//   }, [navigate]);

//   // Group assignments by week
//   const groupedAssignments = useMemo(() => {
//     return assignments.reduce((acc, hw) => {
//       const weekKey = `Week ${hw.week}`;
//       if (!acc[weekKey]) acc[weekKey] = [];
//       acc[weekKey].push(hw);
//       return acc;
//     }, {} as Record<string, Homework[]>);
//   }, [assignments]);

//   const weeks = useMemo(() => Object.keys(groupedAssignments), [groupedAssignments]);

//   // SCROLL SPY
//   useEffect(() => {
//     if (weeks.length === 0) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (isScrollingRef.current) return;
//         const visibleEntries = entries.filter((entry) => entry.isIntersecting);
//         if (visibleEntries.length > 0) {
//           setActiveWeek(visibleEntries[0].target.id);
//         }
//       },
//       { rootMargin: '-10% 0px -60% 0px', threshold: 0 },
//     );

//     const sections = document.querySelectorAll('.week-section');
//     sections.forEach((section) => observer.observe(section));

//     return () => {
//       sections.forEach((section) => observer.unobserve(section));
//     };
//   }, [weeks]);

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     navigate('/auth');
//   };

//   const scrollToWeek = (week: string) => {
//     isScrollingRef.current = true;
//     setActiveWeek(week);

//     const element = document.getElementById(week);
//     if (element) element.scrollIntoView({ behavior: 'smooth' });

//     if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
//     scrollTimeoutRef.current = setTimeout(() => {
//       isScrollingRef.current = false;
//     }, 800);
//   };

//   // Helper function to color-code difficulty levels
//   const getDifficultyStyles = (difficulty: string) => {
//     switch (difficulty.toLowerCase()) {
//       case 'easy':
//         return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
//       case 'medium':
//         return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
//       case 'hard':
//         return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
//       default:
//         return 'text-slate-400 bg-slate-800 border-slate-700';
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-[#0f111a] flex items-center justify-center">
//         <div className="text-emerald-500 font-mono animate-pulse flex flex-col items-center gap-4">
//           <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
//           Loading Assignments...
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#0f111a] text-slate-100 p-4 sm:p-8 font-sans selection:bg-emerald-500/30">
//       {/* Header Area */}
//       <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 lg:mb-12 border-b border-slate-800 pb-6 gap-4">
//         <div className="flex items-center gap-4">
//           <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer" onClick={() => navigate('/')}>
//             {/* Geometric Cat Logo */}
//             <svg
//               className="w-5 h-5 text-slate-900"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2.5"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             >
//               <path
//                 d="M12 21c-4.97 0-9-3.134-9-7a6.98 6.98 0 0 1 1.73-4.57L3 4.5 8.07 6.3A10.36 10.36 0 0 1 12 5.5c1.42 0 2.78.21 4 .58L21 4.5l-1.73 4.93A6.98 6.98 0 0 1 21 14c0 3.866-4.03 7-9 7z"
//                 fill="currentColor"
//               />
//               <circle cx="9" cy="12.5" r="1.2" fill="#10b981" stroke="none" />
//               <circle cx="15" cy="12.5" r="1.2" fill="#10b981" stroke="none" />
//               <polygon points="12,15 11,14 13,14" fill="#10b981" stroke="none" />
//             </svg>
//           </div>
//           <div>
//             <h1 className="text-3xl font-black text-white tracking-tight">
//               Data<span className="text-emerald-400">Kibble</span>
//             </h1>
//             <p className="text-slate-400 font-mono text-xs mt-1">
//               Follow the path to master SQL.
//             </p>
//           </div>
//         </div>
//         <div className="flex items-center gap-4 self-start sm:self-auto">
//           <button
//             onClick={() => navigate('/home')}
//             className="text-emerald-500 hover:text-emerald-400 text-sm font-bold transition-colors px-4 py-2 rounded-md hover:bg-emerald-500/10"
//           >
//             Back to Curriculum
//           </button>
//           <button
//             onClick={handleLogout}
//             className="text-slate-500 hover:text-red-400 text-sm font-bold transition-colors px-4 py-2 rounded-md hover:bg-red-500/10"
//           >
//             Logout
//           </button>
//         </div>
//       </div>

//       {/* Main Layout */}
//       <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 relative">
//         {/* Sidebar */}
//         <div className="w-full lg:w-64 shrink-0 lg:sticky lg:top-8 h-fit z-20 top-0 bg-[#0f111a]/95 backdrop-blur-md lg:bg-transparent -mx-4 px-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0 py-4 lg:py-0 border-b border-slate-800 lg:border-none">
//           <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 hide-scrollbar">
//             <h3 className="hidden lg:flex text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 pl-4">
//               Schedule Tabs
//             </h3>
//             {weeks.map((week) => {
//               const isActive = activeWeek === week;
//               return (
//                 <button
//                   key={week}
//                   onClick={() => scrollToWeek(week)}
//                   className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 font-bold text-sm tracking-wide whitespace-nowrap shrink-0 lg:shrink w-auto lg:w-full group
//                     ${
//                       isActive
//                         ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
//                         : 'text-slate-400 border border-transparent hover:bg-slate-800/50 hover:text-slate-200'
//                     }`}
//                 >
//                   <div className="flex items-center gap-3">
//                     <svg
//                       className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-400'}`}
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
//                       />
//                     </svg>
//                     {week}
//                   </div>
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* Content */}
//         <div className="flex-1 max-w-4xl space-y-24">
//           {weeks.map((week) => {
//             const currentAssignments = groupedAssignments[week];

//             return (
//               <div
//                 key={week}
//                 id={week}
//                 className="relative week-section scroll-mt-24 lg:scroll-mt-8"
//               >
//                 {/* Section Header */}
//                 <div className="flex items-center gap-4 mb-8">
//                   <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-800"></div>
//                   <h2 className="text-2xl font-black text-white tracking-widest uppercase">
//                     {week} ASSIGNMENTS
//                   </h2>
//                   <div className="h-px w-8 lg:flex-1 bg-gradient-to-l from-transparent to-slate-800"></div>
//                 </div>

//                 {/* Problem Cards */}
//                 <div className="flex flex-col gap-5">
//                   {currentAssignments.map((hw) => (
//                     <div
//                       key={hw.id}
//                       onClick={() => navigate(`/homework/${hw.id}`)}
//                       className="group relative bg-[#141620]/50 border border-slate-800 rounded-lg p-6 cursor-pointer transition-all hover:-translate-y-1 hover:border-emerald-500/30 shadow-lg"
//                     >
//                       {/* Top Row: Difficulty & Title */}
//                       <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
//                         <div className="flex-1">
//                           <div className="flex items-center gap-3 mb-2">
//                             <span
//                               className={`text-[10px] px-2.5 py-0.5 rounded-full border font-black tracking-widest ${getDifficultyStyles(
//                                 hw.difficulty
//                               )}`}
//                             >
//                               {hw.difficulty.toUpperCase()}
//                             </span>
//                           </div>
//                           <h4 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
//                             {hw.title}
//                           </h4>
//                         </div>
                        
//                         {/* Play Icon (Optional, visual indicator that it's clickable) */}
//                         <div className="hidden sm:flex w-10 h-10 shrink-0 rounded-full items-center justify-center border border-slate-700 bg-slate-800 group-hover:bg-emerald-500 group-hover:border-emerald-400 transition-colors">
//                           <svg
//                             className="w-4 h-4 text-slate-400 group-hover:text-slate-900 ml-0.5"
//                             fill="currentColor"
//                             viewBox="0 0 24 24"
//                           >
//                             <path d="M8 5v14l11-7z" />
//                           </svg>
//                         </div>
//                       </div>

//                       {/* Prompt / Description snippet */}
//                       <p className="text-slate-400 text-sm line-clamp-2 mb-5">
//                         {hw.prompt}
//                       </p>

//                       {/* Topics Array Badges */}
//                       <div className="flex flex-wrap gap-2">
//                         {hw.topics.map((topic, index) => (
//                           <span
//                             key={index}
//                             className="text-xs font-mono font-medium text-slate-300 bg-slate-800/50 px-2.5 py-1 rounded-md border border-slate-700/50"
//                           >
//                             {topic}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//       <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
//     </div>
//   );
// }



import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase'; // Adjust path if needed
import { type Homework } from '../store/assignmentsStore';

export default function Assignments() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState<Homework[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeWeek, setActiveWeek] = useState<string>('');
  
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch session and homework data
  useEffect(() => {
    const loadSessionAndData = async () => {
      const {
        data: { session },
        error: authError,
      } = await supabase.auth.getSession();
      
      if (authError || !session) {
        navigate('/auth');
        return;
      }

      // Fetch the homework problems from Supabase
      const { data, error } = await supabase
        .from('homework')
        .select('id, title, week, difficulty, topics, prompt')
        .order('week', { ascending: true })
        .order('id', { ascending: true }); // Keep problems ordered within the week

      if (data && !error) {
        setAssignments(data as Homework[]);
      } else {
        console.error("Error fetching homework:", error);
      }
      setIsLoading(false);
    };

    loadSessionAndData();
  }, [navigate]);

  // Group assignments by week
  const groupedAssignments = useMemo(() => {
    return assignments.reduce((acc, hw) => {
      const weekKey = `Week ${hw.week}`;
      if (!acc[weekKey]) acc[weekKey] = [];
      acc[weekKey].push(hw);
      return acc;
    }, {} as Record<string, Homework[]>);
  }, [assignments]);

  const weeks = useMemo(() => Object.keys(groupedAssignments), [groupedAssignments]);

  // SCROLL SPY
  useEffect(() => {
    if (weeks.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          setActiveWeek(visibleEntries[0].target.id);
        }
      },
      { rootMargin: '-10% 0px -60% 0px', threshold: 0 },
    );

    const sections = document.querySelectorAll('.week-section');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, [weeks]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const scrollToWeek = (week: string) => {
    isScrollingRef.current = true;
    setActiveWeek(week);

    const element = document.getElementById(week);
    if (element) element.scrollIntoView({ behavior: 'smooth' });

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 800);
  };

  // Helper function to color-code difficulty levels
  const getDifficultyStyles = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'medium':
        return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'hard':
        return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f111a] flex items-center justify-center">
        <div className="text-emerald-500 font-mono animate-pulse flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          Loading Assignments...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f111a] text-slate-100 p-4 sm:p-8 font-sans selection:bg-emerald-500/30">
      {/* Header Area */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 lg:mb-12 border-b border-slate-800 pb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer" onClick={() => navigate('/')}>
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
              <path
                d="M12 21c-4.97 0-9-3.134-9-7a6.98 6.98 0 0 1 1.73-4.57L3 4.5 8.07 6.3A10.36 10.36 0 0 1 12 5.5c1.42 0 2.78.21 4 .58L21 4.5l-1.73 4.93A6.98 6.98 0 0 1 21 14c0 3.866-4.03 7-9 7z"
                fill="currentColor"
              />
              <circle cx="9" cy="12.5" r="1.2" fill="#10b981" stroke="none" />
              <circle cx="15" cy="12.5" r="1.2" fill="#10b981" stroke="none" />
              <polygon points="12,15 11,14 13,14" fill="#10b981" stroke="none" />
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
        <div className="flex items-center gap-4 self-start sm:self-auto">
          {/* Reordered buttons as requested */}
          <div className="flex flex-col gap-1 items-end">
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-400 text-sm font-bold transition-colors px-4 py-2 rounded-md hover:bg-red-500/10"
            >
              Logout
            </button>
            <button
              onClick={() => navigate('/home')}
              className="text-emerald-500 hover:text-emerald-400 text-sm font-bold transition-colors px-4 py-2 rounded-md hover:bg-emerald-500/10"
            >
              Back to Curriculum
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 relative">
        {/* Sidebar */}
        <div className="w-full lg:w-64 shrink-0 lg:sticky lg:top-8 h-fit z-20 top-0 bg-[#0f111a]/95 backdrop-blur-md lg:bg-transparent -mx-4 px-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0 py-4 lg:py-0 border-b border-slate-800 lg:border-none">
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 hide-scrollbar">
            <h3 className="hidden lg:flex text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 pl-4">
              Assignment Tabs
            </h3>
            {weeks.map((week) => {
              const isActive = activeWeek === week;
              return (
                <button
                  key={week}
                  onClick={() => scrollToWeek(week)}
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {week}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-4xl space-y-24">
          {weeks.map((week) => {
            const currentAssignments = groupedAssignments[week];

            return (
              <div
                key={week}
                id={week}
                className="relative week-section scroll-mt-24 lg:scroll-mt-8"
              >
                {/* Section Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-800"></div>
                  <h2 className="text-2xl font-black text-white tracking-widest uppercase">
                    {week} ASSIGNMENTS
                  </h2>
                  <div className="h-px w-8 lg:flex-1 bg-gradient-to-l from-transparent to-slate-800"></div>
                </div>

                {/* Problem Cards */}
                <div className="flex flex-col gap-5">
                  {currentAssignments.map((hw) => (
                    <div
                      key={hw.id}
                      onClick={() => navigate(`/homework/${hw.id}`)}
                      className="group relative bg-[#141620]/50 border border-slate-800 rounded-lg p-6 cursor-pointer transition-all hover:-translate-y-1 hover:border-emerald-500/30 shadow-lg"
                    >
                      {/* Top Row: Difficulty & Title */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`text-[10px] px-2.5 py-0.5 rounded-full border font-black tracking-widest ${getDifficultyStyles(
                                hw.difficulty
                              )}`}
                            >
                              {hw.difficulty.toUpperCase()}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {hw.title}
                          </h4>
                        </div>
                        
                        {/* Play Icon (Optional, visual indicator that it's clickable) */}
                        <div className="hidden sm:flex w-10 h-10 shrink-0 rounded-full items-center justify-center border border-slate-700 bg-slate-800 group-hover:bg-emerald-500 group-hover:border-emerald-400 transition-colors">
                          <svg
                            className="w-4 h-4 text-slate-400 group-hover:text-slate-900 ml-0.5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>

                      {/* Prompt / Description snippet */}
                      <p className="text-slate-400 text-sm line-clamp-2 mb-5">
                        {hw.prompt}
                      </p>

                      {/* Topics Array Badges */}
                      <div className="flex flex-wrap gap-2">
                        {hw.topics.map((topic, index) => (
                          <span
                            key={index}
                            className="text-xs font-mono font-medium text-slate-300 bg-slate-800/50 px-2.5 py-1 rounded-md border border-slate-700/50"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
}