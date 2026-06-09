import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { useQuestStore } from '../store/questStore';

type DBValue = string | number | boolean | null;
type DBRow = Record<string, DBValue>;

export default function QuestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 1. Grab everything from the global store
  const { 
    quests, 
    completedQuestIds, 
    dbInstance, 
    isDbBooting, 
    markQuestCompleted, 
    fetchData, 
    initEngine 
  } = useQuestStore();
  
  const quest = quests.find(q => q.id === id);
  const alreadySolved = id ? completedQuestIds.has(id) : false;

  const [tables, setTables] = useState<Record<string, DBRow[]>>({});
  const [isSettingUp, setIsSettingUp] = useState(false);
  
  const [userCode, setUserCode] = useState(() => {
    const savedCode = localStorage.getItem(`quest_${id}_code`);
    return savedCode || "-- Write your SQL query here\n";
  });
  
  const [queryResult, setQueryResult] = useState<DBRow[] | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [isPassed, setIsPassed] = useState(false);

  // 🌟 STEP 1: Hydrate store and boot engine if needed
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Self-hydration: If we refreshed or deep-linked, fetch the data!
      if (quests.length === 0 && session) {
        await fetchData(session.user.id);
      }
      
      // Ensure the engine is running
      await initEngine();
    };
    init();
  }, [id, quests.length, fetchData, initEngine]);

  // 🌟 STEP 2: Setup DB Schema when engine and quest are ready
  useEffect(() => {
    if (!dbInstance || !quest) return;

    const setupDatabase = async () => {
      setIsSettingUp(true);
      try {
        // 1. Wipe
        await dbInstance.exec(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);

        // 2. Run Setup
        await dbInstance.exec(quest.setup_sql);

        // 3. Parallel Fetch Tables
        const schemaResult = await dbInstance.query(`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';`);
        const schemaRows = schemaResult.rows as { tablename: string }[];
        
        const tablePromises = schemaRows.map(async (row) => {
          const tableName = row.tablename;
          const tableData = await dbInstance.query(`SELECT * FROM ${tableName} LIMIT 5`);
          return { tableName, rows: tableData.rows as DBRow[] };
        });

        const results = await Promise.all(tablePromises);

        const extractedTables = results.reduce((acc, curr) => {
          acc[curr.tableName] = curr.rows;
          return acc;
        }, {} as Record<string, DBRow[]>);

        setTables(extractedTables);
      } catch (err) {
        console.error("Database setup failed:", err);
      } finally {
        setIsSettingUp(false);
      }
    };

    setupDatabase();
  }, [dbInstance, quest]);

  const handleCodeChange = (value: string) => {
    setUserCode(value);
    localStorage.setItem(`quest_${id}_code`, value);
  };

  const executeAndDeduplicate = async (query: string): Promise<DBRow[]> => {
    if (!dbInstance) throw new Error("Database not initialized");
    
    const result = await dbInstance.query(query, [], { rowMode: 'array' });
    
    const safeColumnNames: string[] = [];
    const nameCounts: Record<string, number> = {};

    result.fields.forEach(field => {
      let name = field.name;
      if (nameCounts[name]) {
        nameCounts[name]++;
        name = `${name}_${nameCounts[name]}`;
      } else {
        nameCounts[name] = 1;
      }
      safeColumnNames.push(name);
    });

    const safeRows = (result.rows as DBValue[][]).map(rowArray => {
      const rowObject: DBRow = {};
      rowArray.forEach((val, index) => {
        rowObject[safeColumnNames[index]] = val;
      });
      return rowObject;
    });

    return safeRows;
  };

  const handleRunCode = async () => {
    if (!dbInstance || !quest) return;
    setQueryError(null);
    setQueryResult(null);
    setIsPassed(false);

    try {
      const actualRows = await executeAndDeduplicate(userCode);
      setQueryResult(actualRows);
    } catch (err: unknown) {
      if (err instanceof Error) setQueryError(err.message);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!dbInstance || !quest) return;
    setQueryError(null);
    setQueryResult(null);
    setIsPassed(false);

    try {
      const actualRows = await executeAndDeduplicate(userCode);
      setQueryResult(actualRows);

      const expected = (typeof quest.expected_output === 'string' 
        ? JSON.parse(quest.expected_output) 
        : quest.expected_output) as DBRow[];

      if (actualRows.length !== expected.length) {
        setQueryError(`Row count mismatch: Expected ${expected.length} rows, but got ${actualRows.length}.`);
        return;
      }

      const normalizeAndClean = (arr: DBRow[]) => arr.map(row => 
        Object.keys(row).sort().reduce((obj, key) => {
          const val = row[key];
          if (typeof val === 'string' && !isNaN(Number(val)) && val.trim() !== "") {
            obj[key] = Number(val);
          } else {
            obj[key] = val;
          }
          return obj;
        }, {} as DBRow)
      ).map(row => JSON.stringify(row)).sort();

      const actualNormalized = normalizeAndClean(actualRows);
      const expectedNormalized = normalizeAndClean(expected);

      if (JSON.stringify(actualNormalized) === JSON.stringify(expectedNormalized)) {
        setIsPassed(true);
        if (id) markQuestCompleted(id);
        
        const { data: authData } = await supabase.auth.getSession();
        if (authData.session) {
          await supabase.from('user_progress').upsert({
            user_id: authData.session.user.id,
            quest_id: id,
            is_completed: true
          }, { onConflict: 'user_id, quest_id' });
        }
      } else {
        setQueryError("Output does not match the expected result. Look closely at the required columns and rows!");
      }
    } catch (err: unknown) {
      if (err instanceof Error) setQueryError(err.message);
    }
  };

  if (isDbBooting || isSettingUp || !quest) {
    return (
      <div className="min-h-screen bg-[#0f111a] flex items-center justify-center text-emerald-500 font-mono animate-pulse">
        {isDbBooting ? "Booting PostgreSQL Engine..." : "Generating Tables..."}
      </div>
    );
  }

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
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{quest.category}</span>
            <h1 className="text-2xl font-bold text-white mt-1 mb-4">{quest.title}</h1>
            <p className="text-slate-400 leading-relaxed text-sm">{quest.prompt}</p>
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
              <div className="flex gap-3">
                <button 
                  onClick={handleRunCode} 
                  className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-4 py-2 rounded-md transition-all"
                >
                  Run Code
                </button>
                <button 
                  onClick={handleSubmitAnswer} 
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-xs font-bold px-5 py-2 rounded-md transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                >
                  Submit Answer
                </button>
              </div>
            </div>
            <CodeMirror value={userCode} height="100%" theme="dark" extensions={[sql()]} onChange={handleCodeChange} className="text-sm font-mono flex-1" />
          </div>

          <div className={`bg-[#141620] border ${isPassed ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'border-slate-800'} rounded-xl p-6 flex-1 flex flex-col relative min-h-[300px]`}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xs font-bold text-slate-500 uppercase">Output</h2>
              {isPassed && (
                <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-lg z-10">
                  <span className="text-emerald-400 font-black">QUEST COMPLETE</span>
                  <button onClick={() => navigate('/home')} className="bg-emerald-500 text-slate-900 text-xs font-bold px-4 py-2 rounded">Map ➔</button>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-auto">
              {queryError && <div className="text-red-400 font-mono text-sm mb-4">ERROR: {queryError}</div>}
              {queryResult && (
                <table className="w-full text-left text-xs border border-slate-700/50">
                  <thead className="bg-slate-900/80 text-slate-500">
                    <tr>{queryResult.length > 0 && Object.keys(queryResult[0]).map(c => <th key={c} className="px-4 py-2">{c}</th>)}</tr>
                  </thead>
                  <tbody>
                    {queryResult.map((r, i) => <tr key={i}>{Object.values(r).map((v, j) => <td key={j} className="px-4 py-2 text-slate-300 font-mono">{String(v)}</td>)}</tr>)}
                  </tbody>
                </table>
              )}
              {queryResult && queryResult.length === 0 && !queryError && (
                 <div className="text-slate-500 italic text-sm mt-4">Query executed successfully, but returned 0 rows.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}