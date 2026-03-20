import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { PGlite } from '@electric-sql/pglite';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';

interface Quest {
  id: string;
  category: string;
  title: string;
  prompt: string;
  setup_sql: string;
  expected_output: string | Record<string, unknown>[]; 
}

type DBRow = Record<string, string | number | boolean | null>;

export default function QuestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [quest, setQuest] = useState<Quest | null>(null);
  const [db, setDb] = useState<PGlite | null>(null);
  const [tables, setTables] = useState<Record<string, DBRow[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const [userCode, setUserCode] = useState(() => {
    const savedCode = localStorage.getItem(`quest_${id}_code`);
    return savedCode || "-- Write your SQL query here\n";
  });
  
  const [queryResult, setQueryResult] = useState<DBRow[] | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [isPassed, setIsPassed] = useState(false);
  const [alreadySolved, setAlreadySolved] = useState(false);

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initLevel = async () => {
      const { data: questData, error: questError } = await supabase
        .from('quests')
        .select('*')
        .eq('id', id)
        .single();

      if (questError || !questData) return;
      setQuest(questData as Quest);

      const { data: authData } = await supabase.auth.getSession();
      if (authData.session) {
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', authData.session.user.id)
          .eq('quest_id', id)
          .single();

        if (progressData?.is_completed) setAlreadySolved(true);
      }

      const pg = new PGlite();
      setDb(pg);

      try {
        await pg.exec(questData.setup_sql);
        const schemaResult = await pg.query(`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';`);
        const extractedTables: Record<string, DBRow[]> = {};
        const schemaRows = schemaResult.rows as { tablename: string }[];
        
        for (const row of schemaRows) {
          const tableName = row.tablename;
          const tableData = await pg.query(`SELECT * FROM ${tableName} LIMIT 5`);
          extractedTables[tableName] = tableData.rows as DBRow[];
        }
        setTables(extractedTables);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    initLevel();
    return () => { if (db) db.close(); };
  }, [id]);

  const handleCodeChange = (value: string) => {
    setUserCode(value);
    localStorage.setItem(`quest_${id}_code`, value);
  };

  const handleRunQuery = async () => {
    if (!db || !quest) return;
    setQueryError(null);
    setQueryResult(null);
    setIsPassed(false);

    try {
      const result = await db.query(userCode);
      setQueryResult(result.rows as DBRow[]);

      const expected = typeof quest.expected_output === 'string' 
        ? JSON.parse(quest.expected_output) 
        : quest.expected_output;

      if (JSON.stringify(result.rows) === JSON.stringify(expected)) {
        setIsPassed(true);
        setAlreadySolved(true);
        const { data: authData } = await supabase.auth.getSession();
        if (authData.session) {
          await supabase.from('user_progress').upsert({
            user_id: authData.session.user.id,
            quest_id: id,
            is_completed: true
          }, { onConflict: 'user_id, quest_id' });
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) setQueryError(err.message);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-[#0f111a] flex items-center justify-center text-emerald-500 font-mono animate-pulse">Booting DB...</div>;

  return (
    <div className="min-h-screen bg-[#0f111a] text-slate-100 p-6 flex flex-col gap-6">
      <div className="w-full">
        <button onClick={() => navigate('/home')} className="text-emerald-500 text-sm font-bold hover:text-emerald-400 flex items-center gap-2">
          ← Back to Map
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 flex-1">
        <div className="w-full xl:w-1/2 flex flex-col gap-6">
          <div className="bg-[#141620] border border-slate-800 rounded-xl p-6 shadow-lg relative overflow-hidden">
            {alreadySolved && <div className="absolute top-0 right-0 bg-emerald-500/10 border-b border-l border-emerald-500/30 px-4 py-1 rounded-bl-lg text-xs font-bold text-emerald-400">✓ COMPLETED</div>}
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{quest?.category}</span>
            <h1 className="text-2xl font-bold text-white mt-1 mb-4">{quest?.title}</h1>
            <p className="text-slate-400 leading-relaxed text-sm">{quest?.prompt}</p>
          </div>

          <div className="bg-[#141620] border border-slate-800 rounded-xl p-6 flex-1 overflow-auto shadow-lg min-h-[300px]">
             <h2 className="text-xs font-bold text-emerald-500 uppercase mb-4">Schema Explorer</h2>
             {Object.entries(tables).map(([name, rows]) => (
               <div key={name} className="mb-6 border border-slate-700/50 rounded-lg overflow-hidden">
                 <div className="bg-slate-800/80 px-4 py-2 text-xs font-bold text-emerald-400">{name}</div>
                 <table className="w-full text-left text-xs">
                   <thead className="bg-slate-900/80 text-slate-500">
                     <tr>{rows.length > 0 && Object.keys(rows[0]).map(c => <th key={c} className="px-4 py-2">{c}</th>)}</tr>
                   </thead>
                   <tbody>
                     {rows.map((r, i) => <tr key={i}>{Object.values(r).map((v, j) => <td key={j} className="px-4 py-2 text-slate-300 font-mono">{String(v)}</td>)}</tr>)}
                   </tbody>
                 </table>
               </div>
             ))}
          </div>
        </div>

        <div className="w-full xl:w-1/2 flex flex-col gap-6">
          <div className="bg-[#141620] border border-slate-800 rounded-xl overflow-hidden h-[350px] flex flex-col">
            <div className="bg-slate-800/50 px-4 py-3 flex justify-between items-center border-b border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase">Editor</span>
              <button onClick={handleRunQuery} className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-xs font-bold px-5 py-2 rounded-md transition-all">Run Code</button>
            </div>
            <CodeMirror value={userCode} height="100%" theme="dark" extensions={[sql()]} onChange={handleCodeChange} className="text-sm font-mono flex-1" />
          </div>

          <div className={`bg-[#141620] border ${isPassed ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'border-slate-800'} rounded-xl p-6 flex-1 flex flex-col relative min-h-[300px]`}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xs font-bold text-slate-500 uppercase">Output</h2>
              {isPassed && (
                <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-lg">
                  <span className="text-emerald-400 font-black">QUEST COMPLETE</span>
                  <button onClick={() => navigate('/home')} className="bg-emerald-500 text-slate-900 text-xs font-bold px-4 py-2 rounded">Map ➔</button>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-auto">
              {queryError && <div className="text-red-400 font-mono text-sm">ERROR: {queryError}</div>}
              {queryResult && !queryError && (
                <table className="w-full text-left text-xs border border-slate-700/50">
                  <thead className="bg-slate-900/80 text-slate-500">
                    <tr>{queryResult.length > 0 && Object.keys(queryResult[0]).map(c => <th key={c} className="px-4 py-2">{c}</th>)}</tr>
                  </thead>
                  <tbody>
                    {queryResult.map((r, i) => <tr key={i}>{Object.values(r).map((v, j) => <td key={j} className="px-4 py-2 text-slate-300 font-mono">{String(v)}</td>)}</tr>)}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}