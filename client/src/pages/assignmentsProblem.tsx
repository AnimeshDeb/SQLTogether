import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHomeworkStore, type Homework } from '../store/assignmentsStore';
import { PGlite } from '@electric-sql/pglite';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { supabase } from '../supabase';

// --- Explicit Type Definitions ---
type CellValue = string | number | boolean | null | Date | undefined;
type RowData = Record<string, CellValue>;

interface OutputRow extends RowData {
  _isError?: boolean;
}

// Extend the base Homework interface to strictly type the new DB fields
interface DetailedHomework extends Homework {
  // Can be a flat array (old format) or an object mapping table names to arrays (new format)
  original_source_table?: RowData[] | Record<string, RowData[]>;
  table_schemas: Record<string, Record<string, string>>;
}

export default function HomeworkProblem() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { homework, fetchHomework, isLoaded } = useHomeworkStore();
  const dbRef = useRef<PGlite | null>(null);

  // Strongly typed state
  const [userCode, setUserCode] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [outputRows, setOutputRows] = useState<OutputRow[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sourceTables, setSourceTables] = useState<Record<string, RowData[]>>({});
  const [dbReady, setDbReady] = useState<boolean>(false);

  // DYNAMIC TEST STATE: Stores the expected data and source tables for the failing test case
  const [activeExpectedRows, setActiveExpectedRows] = useState<RowData[]>([]);
  const [activeSourceTables, setActiveSourceTables] = useState<Record<string, RowData[]>>({});

  const [testResults, setTestResults] = useState<{
    passed: number;
    total: number;
    hasRun: boolean;
    failedTestDetails: { setup: string; actual: RowData[]; expected: RowData[] } | null;
  }>({ passed: 0, total: 4, hasRun: false, failedTestDetails: null });

  const isPassed: boolean = testResults.hasRun && testResults.passed === testResults.total;

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      // Redirect to home if no session
      if (error || !session) {
        navigate('/');
      }
    };

    checkSession();
  }, [navigate]);

  // 1. Fetch data if arriving directly via URL
  useEffect(() => {
    fetchHomework();
  }, [fetchHomework]);

  // 2. Find the specific problem and navigation context
  const quest = useMemo<DetailedHomework | undefined>(() => {
    return homework.find((hw: Homework) => hw.id === Number(id)) as DetailedHomework | undefined;
  }, [homework, id]);

  // 🌟 DYNAMIC GRADING FLAG: Checks if 'ORDER BY' is required
  const requiresOrder = useMemo(() => {
    if (!quest?.topics) return false;
    return quest.topics.some((topic: string) => topic.toLowerCase().includes('order by'));
  }, [quest]);

  // Dynamically derive the correct column order for EXPECTED tables
  const orderedKeys = useMemo(() => {
    const rows = activeExpectedRows.length > 0 ? activeExpectedRows : (quest?.expected_output as RowData[]) || [];
    if (rows.length > 0) {
      return Object.keys(rows[0]);
    }
    return [];
  }, [quest, activeExpectedRows]);

  // Dynamically derive actual keys for YOUR RESULT table
  const actualKeys = useMemo(() => {
    if (outputRows && outputRows.length > 0) {
      return Object.keys(outputRows[0]).filter((k) => k !== '_isError');
    }
    return orderedKeys;
  }, [outputRows, orderedKeys]);

  const currentWeekAssignments = useMemo<Homework[]>(() => {
    if (!quest) return [];
    return homework
      .filter((hw: Homework) => hw.week === quest.week)
      .sort((a: Homework, b: Homework) => a.id - b.id);
  }, [homework, quest]);

  const currentIndex: number = currentWeekAssignments.findIndex((hw: Homework) => hw.id === Number(id));
  const hasPrevious: boolean = currentIndex > 0;
  const hasNext: boolean = currentIndex < currentWeekAssignments.length - 1;
  const prevQuest: Homework | null = hasPrevious ? currentWeekAssignments[currentIndex - 1] : null;
  const nextQuest: Homework | null = hasNext ? currentWeekAssignments[currentIndex + 1] : null;

  // --- INSTANT LOADING OPTIMIZATION ---
  // Safely parse original_source_table whether it's a flat array or a multi-table object
  useEffect(() => {
    if (quest?.original_source_table && quest.table_schemas) {
      if (Array.isArray(quest.original_source_table)) {
        // Legacy Support: Flat array for a single table
        const schemaKeys = Object.keys(quest.table_schemas);
        if (schemaKeys.length > 0) {
          const tableName = schemaKeys[0];
          setSourceTables({ [tableName]: quest.original_source_table });
        }
      } else if (typeof quest.original_source_table === 'object') {
        // New Support: Object containing multiple arrays
        setSourceTables(quest.original_source_table as Record<string, RowData[]>);
      }
    } else {
      setSourceTables({});
    }
  }, [quest]);

  // 3. Reset states and Initialize Persistent DB
  useEffect(() => {
    const savedCode: string | null = localStorage.getItem(`homework_${id}_code`);
    setUserCode(savedCode || '-- Write your SQL query here\n');
    setOutputRows(null);
    setErrorMessage(null);
    setTestResults({ passed: 0, total: 4, hasRun: false, failedTestDetails: null });
    setActiveExpectedRows([]);
    setActiveSourceTables({});
    setDbReady(false);

    if (!quest) return;

    const seedDb = async (): Promise<void> => {
      try {
        if (!dbRef.current) {
          dbRef.current = new PGlite();
        }

        await dbRef.current.exec(`DROP SCHEMA public CASCADE; CREATE SCHEMA public;`);
        await dbRef.current.exec(quest.setup_sql);

        setDbReady(true);
      } catch (err: unknown) {
        console.error('Failed to seed background database:', err);
      }
    };

    seedDb();

    return () => {
      if (dbRef.current) {
        dbRef.current.close();
        dbRef.current = null;
      }
    };
  }, [id, quest]);

  const handleCodeChange = (value: string): void => {
    setUserCode(value);
    localStorage.setItem(`homework_${id}_code`, value);
  };

  if (!isLoaded || !quest) {
    return (
      <div className="min-h-screen bg-[#0f111a] flex items-center justify-center text-emerald-500 font-mono animate-pulse">
        Loading Assignment Data...
      </div>
    );
  }

  // --- ONE-TO-ONE NORMALIZATION ---
  const normalizeValue = (val: CellValue, colName?: string): string => {
    if (val === null || val === undefined) return 'null';

    let isDateType = false;
    if (colName && quest) {
      Object.values(quest.table_schemas).forEach((schema) => {
        if (schema[colName] === 'date') isDateType = true;
      });
    }

    if (val instanceof Date) {
      const d = val;
      const pad = (n: number) => n.toString().padStart(2, '0');

      if (isDateType) {
        return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
      } else {
        const yyyy = d.getFullYear();
        const mm = pad(d.getMonth() + 1);
        const dd = pad(d.getDate());
        const hh = pad(d.getHours());
        const min = pad(d.getMinutes());
        const ss = pad(d.getSeconds());
        return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
      }
    }

    return String(val);
  };

  // 🌟 DYNAMIC GRADING ENGINE
  // strictMode: if true, forces strict column count, exact column order, and no extra columns.
 // 🌟 DYNAMIC GRADING ENGINE
  // strictMode: if true, forces strict column count, exact column order, and no extra columns.
  const checkAnswer = (
    actual: RowData[],
    expected: RowData[],
    strictMode: boolean = false,
  ): boolean => {
    // 1. SAFELY HANDLE EMPTY ARRAYS
    if (!actual || !expected) return false;
    if (actual.length === 0 && expected.length === 0) return true;
    if (actual.length !== expected.length) return false;

    // 2. STRICT COLUMN & ORDER CHECK (Only runs on Submit)
    if (strictMode) {
      const expKeys = Object.keys(expected[0]);
      const actKeys = Object.keys(actual[0]);

      if (JSON.stringify(expKeys) !== JSON.stringify(actKeys)) {
        return false;
      }
    }

    // 3. DATA VALIDATION LOOP
    let isStrictMatch = true;
    for (let i = 0; i < expected.length; i++) {
      const expRow = expected[i];
      const actRow = actual[i];

      for (const key of Object.keys(expRow)) {
        if (
          normalizeValue(expRow[key] as CellValue, key) !==
          normalizeValue(actRow[key] as CellValue, key)
        ) {
          isStrictMatch = false;
          break;
        }
      }
      if (!isStrictMatch) break;
    }

    if (requiresOrder || isStrictMatch) return isStrictMatch;

    // 4. LOOSE CHECK (If order is NOT required and NOT in strictMode)
    const expectedKeys = Object.keys(expected[0] || {});

    const stringifyRequired = (row: RowData) => {
      const subset: Record<string, string> = {};
      expectedKeys.forEach((key) => {
        subset[key] = normalizeValue(row[key] as CellValue, key);
      });
      return JSON.stringify(subset, Object.keys(subset).sort());
    };

    const expectedStrings = expected.map(stringifyRequired).sort();
    const actualStrings = actual.map(stringifyRequired).sort();

    return JSON.stringify(expectedStrings) === JSON.stringify(actualStrings);
  };
  // 🌟 DYNAMIC ROW FLAGGING
  const flagErrorRows = (actual: RowData[], expected: RowData[]): OutputRow[] => {
    const expectedKeys = expected.length > 0 ? Object.keys(expected[0]) : [];

    if (requiresOrder) {
      return actual.map((row, i) => {
        let isError = false;
        const expRow = expected[i];
        if (!expRow) {
          isError = true;
        } else {
          for (const key of expectedKeys) {
            if (normalizeValue(row[key], key) !== normalizeValue(expRow[key] as CellValue, key)) {
              isError = true;
              break;
            }
          }
        }
        return { ...row, _isError: isError };
      });
    } else {
      const stringifyRequired = (row: RowData) => {
        const subset: Record<string, string> = {};
        expectedKeys.forEach(key => {
          subset[key] = normalizeValue(row[key] as CellValue, key);
        });
        return JSON.stringify(subset, Object.keys(subset).sort());
      };

      const expectedStrings = expected.map(stringifyRequired);
      return actual.map((row) => {
        const rowStr = stringifyRequired(row);
        return { ...row, _isError: !expectedStrings.includes(rowStr) };
      });
    }
  };

  const runCode = async (isSubmit: boolean): Promise<void> => {
    if (!dbRef.current || !dbReady) return;

    setIsExecuting(true);
    setErrorMessage(null);

    // Clear debug panels
    setOutputRows(null);
    setTestResults({ passed: 0, total: 4, hasRun: false, failedTestDetails: null });
    setActiveExpectedRows([]);
    setActiveSourceTables({});

    try {
      const result = await dbRef.current.query(userCode);
      const actualRows = result.rows as RowData[];

      if (!isSubmit) {
        setOutputRows(actualRows as OutputRow[]);
        setIsExecuting(false);
        return;
      }

      const expectedRows = quest.expected_output as RowData[];
      let passedCount: number = 0;
      let failureData = null;

      const isVisiblePass: boolean = checkAnswer(actualRows, expectedRows, isSubmit);
      if (isVisiblePass) {
        passedCount++;
        setOutputRows(actualRows as OutputRow[]);
      } else {
        const tables: Record<string, RowData[]> = {};
        for (const tName of Object.keys(quest.table_schemas)) {
            const sourceRes = await dbRef.current.query(`SELECT * FROM "${tName}"`);
            tables[tName] = sourceRes.rows as RowData[];
        }

        failureData = { setup: 'Primary Problem Data', actual: actualRows, expected: expectedRows };
        setActiveExpectedRows(expectedRows);
        setActiveSourceTables(tables);
        setOutputRows(flagErrorRows(actualRows, expectedRows));
      }

      const runHiddenTest = async (
        setup: string,
        expected: RowData[]
      ): Promise<{ success: boolean; actual: RowData[]; sourceTables: Record<string, RowData[]> }> => {
        if (!setup) return { success: false, actual: [], sourceTables: {} };
        try {
          const testDb = new PGlite();
          await testDb.exec(setup);
          
          const tables: Record<string, RowData[]> = {};
          for (const tName of Object.keys(quest.table_schemas)) {
              const sourceRes = await testDb.query(`SELECT * FROM "${tName}"`);
              tables[tName] = sourceRes.rows as RowData[];
          }

          const res = await testDb.query(userCode);
          const actRows = res.rows as RowData[];
          await testDb.close();

          const success = checkAnswer(actRows, expected);

          return { success, actual: actRows, sourceTables: tables };
        } catch (e: unknown) {
          console.log('Error at assignmentsProblem: ', e);
          return { success: false, actual: [], sourceTables: {} };
        }
      };

      const tests = [
        { setup: quest.test_setup_sql_1, exp: quest.test_expected_output_1 as RowData[] },
        { setup: quest.test_setup_sql_2, exp: quest.test_expected_output_2 as RowData[] },
        { setup: quest.test_setup_sql_3, exp: quest.test_expected_output_3 as RowData[] },
      ];

      for (const test of tests) {
        const result = await runHiddenTest(test.setup, test.exp);
        if (result.success) {
          passedCount++;
        } else {
          failureData = { setup: test.setup, actual: result.actual, expected: test.exp };
          setActiveExpectedRows(test.exp);
          setActiveSourceTables(result.sourceTables);
          setOutputRows(flagErrorRows(result.actual, test.exp));
        }
      }

      setTestResults({
        passed: passedCount,
        total: 4,
        hasRun: true,
        failedTestDetails: failureData,
      });
    } catch (error: unknown) {
      const msg: string = error instanceof Error ? error.message : 'Syntax Error in SQL Query';
      setErrorMessage(msg);
      setTestResults({ passed: 0, total: 4, hasRun: true, failedTestDetails: null });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f111a] text-slate-100 p-6 flex flex-col gap-6 font-sans">
      <div className="w-full flex justify-between items-center">
        <button
          onClick={() => navigate('/assignments')}
          className="text-emerald-500 text-sm font-bold hover:text-emerald-400 flex items-center gap-2"
        >
          ← Back to Assignments
        </button>

        <div className="flex gap-4">
          <button
            onClick={() => prevQuest && navigate(`/homework/${prevQuest.id}`)}
            disabled={!hasPrevious}
            className="text-slate-400 text-sm font-bold hover:text-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <button
            onClick={() => nextQuest && navigate(`/homework/${nextQuest.id}`)}
            disabled={!hasNext}
            className="text-slate-400 text-sm font-bold hover:text-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="w-full xl:w-1/2 flex flex-col gap-6">
          <div className="bg-[#141620] border border-slate-800 rounded-xl p-6 shadow-lg relative overflow-hidden">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-1">
              WEEK {quest.week} <span className="w-1 h-1 bg-slate-600 rounded-full"></span> {quest.difficulty}
            </span>
            <h1 className="text-2xl font-bold text-white mb-4">{quest.title}</h1>
            <p className="text-slate-400 leading-relaxed text-sm whitespace-pre-wrap mb-6">{quest.prompt}</p>
          </div>

          <div className="bg-[#141620] border border-slate-800 rounded-xl p-6 shadow-lg min-h-[300px]">
            <h2 className="text-xs font-bold text-emerald-500 uppercase mb-4">Schema Explorer</h2>

            {Object.entries(quest.table_schemas).map(([tableName, columns]) => (
              <div key={tableName} className="mb-6 border border-slate-700/50 rounded-lg overflow-hidden">
                <div className="bg-slate-800/80 px-4 py-2 text-xs font-bold text-emerald-400">{tableName}</div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-500">
                    <tr>
                      <th className="px-4 py-2">Column Name</th>
                      <th className="px-4 py-2">Data Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(columns).map(([colName, colType]) => (
                      <tr key={colName} className="border-t border-slate-800/50">
                        <td className="px-4 py-2 text-slate-300 font-mono">{colName}</td>
                        <td className="px-4 py-2 text-slate-500 font-mono">{colType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          <div className="bg-[#141620] border border-slate-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xs font-bold text-cyan-400 uppercase mb-4">Source Tables Data Snippet</h2>
            {Object.keys(sourceTables).length === 0 ? (
              <div className="text-slate-600 font-mono text-xs italic">No matching mock records found.</div>
            ) : (
              Object.entries(sourceTables).map(([tableName, rows]) => (
                <div
                  key={tableName}
                  className="mb-6 border border-slate-700/50 rounded-lg overflow-hidden bg-[#0f111a]/30"
                >
                  <div className="bg-slate-800/40 px-4 py-2 text-xs font-mono font-bold text-cyan-400 border-b border-slate-800/50">
                    {tableName} (Sample Rows)
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/40 text-slate-500 border-b border-slate-800/50">
                        <tr>
                          {rows.length > 0 &&
                            Object.keys(rows[0]).map((colName: string) => (
                              <th key={colName} className="px-4 py-2 font-medium font-mono">
                                {colName}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {rows.map((row: RowData, rowIndex: number) => (
                          <tr key={rowIndex}>
                            {Object.values(row).map((val: CellValue, colIndex: number) => {
                              const colName = Object.keys(row)[colIndex];
                              return (
                                <td key={colIndex} className="px-4 py-2 text-slate-300 font-mono whitespace-nowrap">
                                  {val !== null && val !== undefined ? (
                                    normalizeValue(val, colName)
                                  ) : (
                                    <span className="text-slate-600 italic">null</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}

            <h2 className="text-xs font-bold text-amber-500 uppercase mt-8 mb-4">Expected Output Shape</h2>
            <div className="border border-slate-700/50 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-500">
                  <tr>
                    {orderedKeys.map((col: string) => (
                      <th key={col} className="px-4 py-2 font-medium">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 bg-[#0f111a]/50">
                  {(quest.expected_output as RowData[]).slice(0, 5).map((row: RowData, i: number) => (
                    <tr key={i}>
                      {orderedKeys.map((col: string, j: number) => (
                        <td key={j} className="px-4 py-2 text-slate-400 font-mono">
                          {row[col] !== null && row[col] !== undefined ? (
                            normalizeValue(row[col] as CellValue, col)
                          ) : (
                            <span className="text-slate-600 italic">null</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="w-full xl:w-1/2 flex flex-col gap-6">
          <div className="bg-[#141620] border border-slate-800 rounded-xl overflow-hidden h-[400px] flex flex-col shadow-lg flex-none">
            <div className="bg-slate-800/50 px-4 py-3 flex justify-between items-center border-b border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase">Editor</span>
              <div className="flex gap-3">
                <button
                  onClick={() => runCode(false)}
                  disabled={isExecuting || !dbReady}
                  className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-4 py-2 rounded-md transition-all disabled:opacity-50"
                >
                  Run Code
                </button>
                <button
                  onClick={() => runCode(true)}
                  disabled={isExecuting || !dbReady}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-xs font-bold px-5 py-2 rounded-md transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                >
                  Submit Answer
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <CodeMirror
                value={userCode}
                height="100%"
                minHeight="100%"
                theme="dark"
                extensions={[sql()]}
                onChange={handleCodeChange}
                className="text-sm font-mono h-full"
              />
            </div>
          </div>

          <div
            className={`bg-[#141620] border ${
              isPassed ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'border-slate-800'
            } rounded-xl p-6 flex-1 flex flex-col relative overflow-hidden shadow-lg`}
          >
            {isExecuting && (
              <div className="absolute inset-0 bg-[#0f111a]/90 flex items-center justify-center z-50 text-emerald-500 font-bold animate-pulse">
                Validating...
              </div>
            )}

            <div className="flex justify-between items-start mb-4 flex-none">
              <h2 className="text-xs font-bold text-slate-500 uppercase">Output</h2>

              {testResults.hasRun && !isPassed && (
                <div className="text-rose-400 text-xs font-bold bg-rose-500/10 px-3 py-1.5 rounded border border-rose-500/20">
                  Tests Passed: {testResults.passed} / {testResults.total}
                </div>
              )}

              {isPassed && (
                <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-lg z-10">
                  <span className="text-emerald-400 font-black">PASSED ALL TESTS</span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-auto">
              {errorMessage && (
                <div className="text-rose-400 font-mono text-sm mb-4 whitespace-pre-wrap">ERROR: {errorMessage}</div>
              )}

              {/* FAILED HIDDEN TEST HEADER */}
              {testResults.hasRun && !isPassed && testResults.failedTestDetails && (
                <div className="mb-4 p-4 bg-rose-900/10 border border-rose-500/30 rounded-lg">
                  <h3 className="text-xs font-bold text-rose-500 uppercase mb-2">Failed Hidden Test Setup</h3>
                  <div className="text-xs text-rose-400">
                    Your query returned {testResults.failedTestDetails.actual.length} rows, but expected{' '}
                    {testResults.failedTestDetails.expected.length}.
                  </div>
                </div>
              )}

              {outputRows && (
                <div className="mb-8">
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Your Result</h3>
                  <table className="w-full text-left text-xs border border-slate-700/50">
                    <thead className="bg-slate-900/80 text-slate-500">
                      <tr>
                        {actualKeys.map((col: string) => (
                          <th key={col} className="px-4 py-2">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {outputRows.map((r: OutputRow, i: number) => (
                        <tr
                          key={i}
                          className={`border-t border-slate-800/50 ${
                            r._isError ? 'bg-rose-500/20 text-rose-300' : ''
                          }`}
                        >
                          {actualKeys.map((col: string) => (
                            <td key={col} className="px-4 py-2 font-mono">
                              {r[col] !== null && r[col] !== undefined ? (
                                normalizeValue(r[col], col)
                              ) : (
                                <span className="text-slate-600 italic">null</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TEST CASE SOURCE TABLES */}
              {testResults.hasRun && !isPassed && testResults.failedTestDetails && Object.keys(activeSourceTables).length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xs font-bold text-cyan-400 uppercase mb-2">Test Case Source Tables</h3>
                  {Object.entries(activeSourceTables).map(([tableName, rows]) => {
                    const keys = rows.length > 0 ? Object.keys(rows[0]) : [];
                    return (
                      <div key={tableName} className="mb-4">
                        <div className="bg-cyan-900/40 px-4 py-2 text-xs font-mono font-bold text-cyan-400 border-b border-cyan-800/50 rounded-t-lg">
                          {tableName}
                        </div>
                        <table className="w-full text-left text-xs border border-cyan-700/30">
                          <thead className="bg-cyan-900/20 text-cyan-500">
                            <tr>
                              {keys.map((col: string) => (
                                <th key={col} className="px-4 py-2">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-cyan-900/5">
                            {rows.map((r, i) => (
                              <tr key={i} className="text-slate-400">
                                {keys.map((col) => (
                                  <td key={col} className="px-4 py-2 font-mono">
                                    {r[col] !== null && r[col] !== undefined ? (
                                      normalizeValue(r[col], col)
                                    ) : (
                                      <span className="text-cyan-800 italic">null</span>
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* DYNAMIC EXPECTED RESULT TABLE */}
              {testResults.hasRun && !isPassed && (
                <div className="mt-4">
                  <h3 className="text-xs font-bold text-emerald-500 uppercase mb-2">
                    Correct Result (Missing Rows Highlighted)
                  </h3>
                  <table className="w-full text-left text-xs border border-emerald-700/30">
                    <thead className="bg-emerald-900/20 text-emerald-500">
                      <tr>
                        {orderedKeys.map((col: string) => (
                          <th key={col} className="px-4 py-2">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-emerald-900/5">
                      {activeExpectedRows.map((r: Record<string, unknown>, i: number) => {
                        const isPresent = requiresOrder
                          ? outputRows &&
                            outputRows[i] &&
                            Object.keys(r).every(
                              (key) =>
                                normalizeValue(outputRows[i][key] as CellValue, key) ===
                                normalizeValue(r[key] as CellValue, key)
                            )
                          : outputRows?.some((or) =>
                              Object.keys(r).every(
                                (key) =>
                                  normalizeValue(or[key] as CellValue, key) ===
                                  normalizeValue(r[key] as CellValue, key)
                              )
                            );

                        return (
                          <tr
                            key={i}
                            className={`${!isPresent ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400'}`}
                          >
                            {orderedKeys.map((col: string) => (
                              <td key={col} className="px-4 py-2 font-mono">
                                {r[col] !== null && r[col] !== undefined ? (
                                  normalizeValue(r[col] as CellValue, col)
                                ) : (
                                  <span className="text-emerald-800 italic">null</span>
                                )}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}