import React, { useState, useEffect } from 'react';
import {
  useParams,
  useNavigate,
  type NavigateFunction,
} from 'react-router-dom';
import { supabase } from '../supabase';
import { motion, AnimatePresence } from 'framer-motion';


// ==========================================
// 1. STRICT TYPESCRIPT INTERFACES
// ==========================================
interface LessonModuleProps {
  firstQuestId: string | null;
  onComplete: () => void;
  navigate: NavigateFunction;
}

interface WhereStepData {
  title: string;
  prompt: string;
  table: string;
  data: Record<string, string | number>[];
  options: { cols: string[]; ops: string[]; vals: string[] };
  expected: { col: string; op: string; val: string };
}

interface OrderByStepData {
  title: string;
  prompt: string;
  isMulti: boolean;
  expected: { col1: string; dir1: string; col2?: string; dir2?: string };
}

interface AggStepData {
  title: string;
  prompt: string;
  type: 'agg' | 'groupby';
  expected: { aggFunc: string; col: string; groupByCol?: string };
}

// ==========================================
// MODULE 1: THE "SELECT" LESSON
// ==========================================
const SelectLesson: React.FC<LessonModuleProps> = ({
  
  onComplete,
  navigate,
}) => {
  const [firstQuestId, setFirstQuestId]=useState("")
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>(
    'idle',
  );

  const toggleColumn = (colName: string) => {
    setFeedback('idle');
    setSelectedColumns((prev) =>
      prev.includes(colName)
        ? prev.filter((c) => c !== colName)
        : [...prev, colName],
    );
  };

  const handleSubmit = () => {
    const isCorrect =
      selectedColumns.length === 1 && selectedColumns.includes('order_details');
    if (isCorrect) {
      setFeedback('correct');
      onComplete();
    } else {
      setFeedback('wrong');
    }
  };
  useEffect(() => {
  const fetchFirstQuest = async () => {
    // 1. Ask Supabase for the ID of the first quest in this category
    const { data, error } = await supabase
      .from('quests')
      .select('id')
      .ilike('title', 'The First Query') // Use ilike for case-insensitive matching
      .limit(1)
      .single();

    if (error) {
      console.error('Could not find first quest:', error);
      return;
    }

    // 2. Save that ID to state!
    if (data) {
      setFirstQuestId(data.id);
    }
  };

  fetchFirstQuest();
}, []);

  return (
    <div className="w-full flex flex-col gap-12 pb-32">
      <div className="max-w-3xl">
        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
          Interactive Lesson
        </span>
        <h1 className="text-4xl font-black text-white mt-2 mb-6">
          The <span className="text-indigo-400 font-bold">SELECT</span>{' '}
          Statement
        </h1>
      </div>

      <div className="max-w-5xl bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 md:p-8 shadow-2xl">
        <div className="text-zinc-300 leading-relaxed space-y-5 text-lg">
          <p>
            The{' '}
            <code className="bg-zinc-950 border border-zinc-800 text-indigo-400 font-bold px-2 py-0.5 rounded font-mono text-base">
              SELECT
            </code>{' '}
            keyword tells the database <strong>which columns</strong> of data
            you want to look at.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mt-4">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
          Syntax Example
        </h3>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 font-mono text-base shadow-inner">
          <div className="text-indigo-400 font-bold">
            SELECT <span className="text-white font-normal">*</span>
          </div>
          <div className="text-indigo-400 font-bold">
            FROM <span className="text-amber-400 font-normal">table_name</span>;
          </div>
        </div>
      </div>

      <hr className="border-zinc-800/50" />
      <div className="w-full flex flex-col xl:flex-row gap-8">
        <div className="w-full xl:w-1/2 flex flex-col gap-6">
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 md:p-8 shadow-2xl h-full">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="bg-indigo-600 text-white w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black shadow-lg">
                1
              </span>{' '}
              Example Problem
            </h2>
            <p className="text-zinc-400 mb-6 text-lg">
              Return all{' '}
              <strong className="text-amber-400 font-mono text-base">
                order_details
              </strong>{' '}
              for each customer from the{' '}
              <strong className="text-amber-400 font-mono text-base">
                customers
              </strong>{' '}
              table by clicking on the column in the table and then clicking
              'Submit Query.'
            </p>
            <div className="border border-zinc-800/50 rounded-lg overflow-hidden bg-zinc-900/20 shadow-md">
              <div className="bg-zinc-950/80 px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50">
                Table: customers
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-base cursor-pointer">
                  <thead className="bg-zinc-950/50 border-b border-zinc-800/50">
                    <tr>
                      {['cust_id', 'name', 'order_details'].map((col) => (
                        <th
                          key={col}
                          onClick={() => toggleColumn(col)}
                          className={`px-4 py-3 font-mono font-bold uppercase tracking-tight italic transition-colors ${selectedColumns.includes(col) ? 'text-indigo-400 bg-indigo-500/10' : 'text-zinc-500 hover:text-indigo-300 hover:bg-zinc-800/50'}`}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50 opacity-50 pointer-events-none">
                    <tr className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-base text-zinc-300">
                        101
                      </td>
                      <td className="px-4 py-3 font-mono text-base text-zinc-300">
                        Alice
                      </td>
                      <td className="px-4 py-3 font-mono text-base text-zinc-300">
                        2x Widget A
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full xl:w-1/2 flex flex-col">
          <div
            className={`bg-zinc-900/40 backdrop-blur-xl border-2 rounded-2xl overflow-hidden flex flex-col flex-1 shadow-2xl transition-colors duration-300 ${feedback === 'correct' ? 'border-emerald-500' : feedback === 'wrong' ? 'border-red-500' : 'border-zinc-800/50'}`}
          >
            <div className="bg-zinc-950/80 px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                Your Query
              </span>
            </div>
            <div className="p-8 flex-1 bg-zinc-950/40 font-mono text-base flex flex-col justify-center gap-4">
              <div>
                <span className="text-indigo-400 font-bold">SELECT</span>{' '}
                <span className="text-amber-400">
                  {selectedColumns.length > 0
                    ? selectedColumns.join(', ')
                    : '...'}
                </span>
                <br />
                <span className="text-indigo-400 font-bold">FROM</span>{' '}
                <span className="text-amber-400">customers</span>;
              </div>
            </div>
            <div className="p-6 border-t border-zinc-800 bg-zinc-950/80">
              {feedback === 'idle' && (
                <button
                  onClick={handleSubmit}
                  disabled={selectedColumns.length === 0}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white font-bold py-4 rounded-xl transition-all text-lg"
                >
                  Submit Query
                </button>
              )}
              {feedback === 'wrong' && (
                <div className="flex flex-col gap-4">
                  <div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/30 text-center font-bold text-lg">
                    Not quite! Look at the requested column.
                  </div>
                  <button
                    onClick={() => setFeedback('idle')}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl transition-all text-lg"
                  >
                    Try Again
                  </button>
                </div>
              )}
              {feedback === 'correct' && (
                <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-lg border border-emerald-500/30 text-center font-bold text-lg">
                  Perfect!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={() =>
            firstQuestId
              ? navigate(`/quest/${firstQuestId}`)
              : navigate('/home')
          }
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-12 rounded-xl transition-all flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] text-lg"
        >
          Now Try It Yourself ➔
        </button>
      </div>
    </div>
  );
};

// ==========================================
// MODULE 2: THE "WHERE" LESSON
// ==========================================


// Make sure LessonModuleProps and WhereStepData are imported/defined in your file!

const InteractiveWhereExample = ({
  step,
  index,
  onPass,
  isCompleted,
}: {
  step: WhereStepData;
  index: number;
  onPass: () => void;
  isCompleted: boolean;
}) => {
  const [selectedCol, setSelectedCol] = useState('');
  const [selectedOp, setSelectedOp] = useState('');
  const [selectedVal, setSelectedVal] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>(
    'idle',
  );

  const handleSubmit = () => {
    if (
      selectedCol === step.expected.col &&
      selectedOp === step.expected.op &&
      selectedVal === step.expected.val
    ) {
      setFeedback('correct');
      onPass();
    } else {
      setFeedback('wrong');
    }
  };

  const handleReset = () => {
    setFeedback('idle');
    setSelectedCol('');
    setSelectedOp('');
    setSelectedVal('');
  };

  return (
    <div className="w-full flex flex-col xl:flex-row gap-8 mb-12">
      <div className="w-full xl:w-1/2 flex flex-col gap-6">
        <div
          className={`bg-zinc-900/40 backdrop-blur-xl border ${isCompleted ? 'border-emerald-500/50' : 'border-zinc-800/50'} rounded-2xl p-6 md:p-8 shadow-2xl h-full transition-all`}
        >
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
            <span
              className={`${isCompleted ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'} w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black transition-colors shadow-lg`}
            >
              {isCompleted ? '✓' : index + 1}
            </span>
            {step.title}
          </h2>
          <p className="text-zinc-400 mb-6 text-lg leading-relaxed">
            {step.prompt}
          </p>

          <div className="border border-zinc-800/50 rounded-lg overflow-hidden bg-zinc-900/20 shadow-md">
            <div className="bg-zinc-950/80 px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50">
              Table: {step.table}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-base">
                <thead className="bg-zinc-950/50 border-b border-zinc-800/50">
                  <tr>
                    {Object.keys(step.data[0]).map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {step.data.map((row, i) => {
                    const rowValue = row[step.expected.col];
                    const expectedValue = step.expected.val.replace(/'/g, '');
                    let shouldFade = false;
                    
                    if (feedback === 'correct') {
                      if (step.expected.op === '=')
                        shouldFade = String(rowValue) !== expectedValue;
                      else if (step.expected.op === '>')
                        shouldFade = Number(rowValue) <= Number(expectedValue);
                      else if (step.expected.op === '<')
                        shouldFade = Number(rowValue) >= Number(expectedValue);
                      else if (step.expected.op === '>=')
                        shouldFade = Number(rowValue) < Number(expectedValue);
                      else if (step.expected.op === '<=')
                        shouldFade = Number(rowValue) > Number(expectedValue);
                      else if (step.expected.op === 'IS')
                        shouldFade = String(rowValue) !== 'NULL';
                      else if (step.expected.op === 'IS NOT')
                        shouldFade = String(rowValue) === 'NULL';
                    }
                    
                    return (
                      <tr
                        key={i}
                        className={`hover:bg-zinc-800/30 transition-all duration-700 ${shouldFade ? 'opacity-10' : 'opacity-100'}`}
                      >
                        {Object.values(row).map((val, j) => (
                          <td
                            key={j}
                            className="px-4 py-3 font-mono text-base text-zinc-300 whitespace-nowrap"
                          >
                            {val === 'NULL' ? (
                              <span className="text-zinc-600 italic">NULL</span>
                            ) : (
                              val as React.ReactNode
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full xl:w-1/2 flex flex-col">
        <div
          className={`bg-zinc-900/40 backdrop-blur-xl border-2 rounded-2xl overflow-hidden flex flex-col flex-1 shadow-2xl transition-colors duration-300 ${feedback === 'correct' ? 'border-emerald-500' : feedback === 'wrong' ? 'border-red-500' : 'border-zinc-800/50'}`}
        >
          <div className="bg-zinc-950/80 px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              Query Builder
            </span>
          </div>
          <div className="p-8 flex-1 bg-zinc-950/40 font-mono text-base flex flex-col justify-center gap-6">
            <div>
              <span className="text-indigo-400 font-bold">SELECT</span>{' '}
              <span className="text-white">*</span> <br />
              <span className="text-indigo-400 font-bold">FROM</span>{' '}
              <span className="text-amber-400">{step.table}</span>
            </div>
            
            {/* 🌟 UPDATED WHERE LINE: Forced to single row with horizontal scroll 🌟 */}
            <div className="flex items-center gap-3 flex-nowrap whitespace-nowrap overflow-x-auto pb-2 hide-scrollbar bg-zinc-900 border border-zinc-800/50 p-6 rounded-xl shadow-inner">
              <span className="text-indigo-400 font-bold">WHERE</span>
              <select
                value={selectedCol}
                onChange={(e) => {
                  setSelectedCol(e.target.value);
                  setFeedback('idle');
                }}
                className="bg-zinc-950 border border-zinc-800 text-amber-400 font-mono text-base rounded-md px-3 py-2 outline-none cursor-pointer focus:border-indigo-500 transition-colors"
              >
                <option value="" disabled>
                  column
                </option>
                {step.options.cols.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={selectedOp}
                onChange={(e) => {
                  setSelectedOp(e.target.value);
                  setFeedback('idle');
                }}
                className="bg-zinc-950 border border-zinc-800 text-pink-400 font-bold font-mono text-base rounded-md px-3 py-2 outline-none cursor-pointer focus:border-indigo-500 transition-colors"
              >
                <option value="" disabled>
                  operator
                </option>
                {step.options.ops.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <select
                value={selectedVal}
                onChange={(e) => {
                  setSelectedVal(e.target.value);
                  setFeedback('idle');
                }}
                className="bg-zinc-950 border border-zinc-800 text-emerald-400 font-mono text-base rounded-md px-3 py-2 outline-none cursor-pointer focus:border-indigo-500 transition-colors"
              >
                <option value="" disabled>
                  value
                </option>
                {step.options.vals.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            {/* 🌟 END UPDATED WHERE LINE 🌟 */}
            
          </div>
          <div className="p-6 border-t border-zinc-800 bg-zinc-950/80">
            {feedback === 'idle' && (
              <button
                onClick={handleSubmit}
                disabled={!selectedCol || !selectedOp || !selectedVal}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white font-bold py-4 rounded-xl transition-all text-lg"
              >
                Run Filter
              </button>
            )}
            {feedback === 'wrong' && (
              <div className="flex flex-col gap-4">
                <div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/30 text-center font-bold text-lg">
                  Not quite! Check your logic.
                </div>
                <button
                  onClick={handleReset}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl transition-all text-lg"
                >
                  Reset Builder
                </button>
              </div>
            )}
            {feedback === 'correct' && (
              <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-lg border border-emerald-500/30 text-center font-bold text-lg">
                Great logic! Filter applied.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const WhereLesson: React.FC<LessonModuleProps> = ({
  onComplete,
  navigate,
}) => {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  
  const LESSON_STEPS: WhereStepData[] = [
    {
      title: '1. Exact Matching (=)',
      prompt: "Find the user named 'Ali' in our system logs.",
      table: 'users',
      data: [
        { id: 1, name: 'Ali', role: 'Instructor' },
        { id: 2, name: 'Alice', role: 'Student' },
        { id: 3, name: 'Bob', role: 'Student' },
      ],
      options: {
        cols: ['id', 'name', 'role'],
        ops: ['=', '>', '<'],
        vals: ['1', "'Ali'", "'Instructor'"],
      },
      expected: { col: 'name', op: '=', val: "'Ali'" },
    },
    {
      title: '2. Greater Than (>)',
      prompt:
        'Filter for toys in our inventory with a rarity score strictly greater than 80.',
      table: 'inventory',
      data: [
        { item: 'Labubu Keyring', rarity: 85 },
        { item: 'Smiski Bed', rarity: 50 },
        { item: 'Sonny Angel', rarity: 92 },
        { item: 'Dimoo Retro', rarity: 75 },
      ],
      options: {
        cols: ['item', 'rarity'],
        ops: ['=', '>', '<'],
        vals: ['50', '75', '80', '92'],
      },
      expected: { col: 'rarity', op: '>', val: '80' },
    },
    {
      title: '3. Less Than (<)',
      prompt: 'Identify cards in your MTG deck with a mana_cost less than 2.',
      table: 'mtg_deck',
      data: [
        { name: 'Lightning Bolt', mana_cost: 1 },
        { name: 'Counterspell', mana_cost: 2 },
        { name: 'Sol Ring', mana_cost: 1 },
        { name: 'Fireball', mana_cost: 5 },
      ],
      options: {
        cols: ['name', 'mana_cost'],
        ops: ['=', '<', '>'],
        vals: ['1', '2', '5'],
      },
      expected: { col: 'mana_cost', op: '<', val: '2' },
    },
    {
      title: '4. Inclusive Minimum (>=)',
      prompt:
        'The landlord needs to see units where the rent is at least $3000.',
      table: 'apartments',
      data: [
        { unit: '101', rent: 2800 },
        { unit: '202', rent: 3000 },
        { unit: '303', rent: 3500 },
        { unit: 'Penthouse', rent: 5000 },
      ],
      options: {
        cols: ['unit', 'rent'],
        ops: ['=', '>', '>=', '<='],
        vals: ['2800', '3000', '3500'],
      },
      expected: { col: 'rent', op: '>=', val: '3000' },
    },
    {
      title: '5. Inclusive Maximum (<=)',
      prompt:
        'The Park Ranger needs a list of animal rescues where the team_size was 3 or fewer.',
      table: 'rescues',
      data: [
        { id: 'R-01', type: 'Raccoon', team_size: 2 },
        { id: 'R-02', type: 'Hawk', team_size: 3 },
        { id: 'R-03', type: 'Deer', team_size: 5 },
        { id: 'R-04', type: 'Swan', team_size: 1 },
      ],
      options: {
        cols: ['id', 'type', 'team_size'],
        ops: ['=', '<', '>', '<='],
        vals: ['1', '2', '3', '5'],
      },
      expected: { col: 'team_size', op: '<=', val: '3' },
    },
    {
      title: '6. Is Null (Missing Values)',
      prompt:
        "Check our customer database to find null values, or in other words, rows that have missing information for the email column.",
      table: 'customers',
      data: [
        { id: 'C-1', name: 'Alice', email: 'alice@mail.com' },
        { id: 'C-2', name: 'Bob', email: 'NULL' },
        { id: 'C-3', name: 'Charlie', email: 'NULL' },
        { id: 'C-4', name: 'Diana', email: 'diana@mail.com' },
      ],
      options: {
        cols: ['id', 'name', 'email'],
        ops: ['=', 'IS', 'IS NOT'],
        vals: ["'alice@mail.com'", 'NULL'],
      },
      expected: { col: 'email', op: 'IS', val: 'NULL' },
    },
    {
      title: '7. Is Not Null (Existing Values)',
      prompt:
        "Check our shipping logs to find non-null values, or in other words, rows that don't have any missing information for the delivery_date column.",
      table: 'shipments',
      data: [
        { pkg: 'P-101', item: 'Laptop', delivery_date: '2023-10-01' },
        { pkg: 'P-102', item: 'Mouse', delivery_date: 'NULL' },
        { pkg: 'P-103', item: 'Keyboard', delivery_date: '2023-10-05' },
        { pkg: 'P-104', item: 'Monitor', delivery_date: 'NULL' },
      ],
      options: {
        cols: ['pkg', 'item', 'delivery_date'],
        ops: ['=', 'IS', 'IS NOT'],
        vals: ["'2023-10-01'", 'NULL'],
      },
      expected: { col: 'delivery_date', op: 'IS NOT', val: 'NULL' },
    },
  ];

  const [firstQuestId, setFirstQuestId]=useState("")
  useEffect(() => {
  const fetchFirstQuest = async () => {
    // 1. Ask Supabase for the ID of the first quest in this category
    const { data, error } = await supabase
      .from('quests')
      .select('id')
      .ilike('title', 'Coffee Shop Menu') // Use ilike for case-insensitive matching
      .limit(1)
      .single();

    if (error) {
      console.error('Could not find first quest:', error);
      return;
    }

    // 2. Save that ID to state!
    if (data) {
      setFirstQuestId(data.id);
    }
  };

  fetchFirstQuest();
}, []);

  const handleStepComplete = (index: number) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);
      if (newSet.size === LESSON_STEPS.length) onComplete();
      return newSet;
    });
  };

  return (
    <div className="w-full flex flex-col gap-12 pb-32">
      <div className="max-w-3xl">
        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
          Interactive Lesson
        </span>
        <h1 className="text-4xl font-black text-white mt-2 mb-6">
          The <span className="text-indigo-400 font-bold">WHERE</span> Clause
        </h1>
      </div>

      <div className="max-w-5xl bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 md:p-8 shadow-2xl">
        <div className="text-zinc-300 leading-relaxed space-y-5 text-lg">
          <p>
            The{' '}
            <code className="bg-zinc-950 border border-zinc-800 text-indigo-400 font-bold px-2 py-0.5 rounded font-mono text-base">
              WHERE
            </code>{' '}
            clause acts as a filter. While{' '}
            <code className="bg-zinc-950 border border-zinc-800 text-indigo-400 font-bold px-2 py-0.5 rounded font-mono text-base">
              SELECT
            </code>{' '}
            picks your <strong>vertical</strong> columns,{' '}
            <code className="bg-zinc-950 border border-zinc-800 text-indigo-400 font-bold px-2 py-0.5 rounded font-mono text-base">
              WHERE
            </code>{' '}
            picks your <strong>horizontal</strong> rows.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mt-4">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
          Syntax Examples
        </h3>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 font-mono text-base shadow-inner flex flex-col gap-6">
          <div>
            <div className="text-zinc-500 italic mb-1">
              -- Equals (Exact Match)
            </div>
            <div className="text-indigo-400 font-bold">
              SELECT <span className="text-white font-normal">*</span>
            </div>
            <div className="text-indigo-400 font-bold">
              FROM{' '}
              <span className="text-amber-400 font-normal">table_name</span>
            </div>
            <div className="text-indigo-400 font-bold">
              WHERE{' '}
              <span className="text-amber-400 font-normal">column_name</span>{' '}
              <span className="text-pink-400 font-bold">=</span>{' '}
              <span className="text-emerald-400 font-normal">value</span>;
            </div>
          </div>

          <div>
            <div className="text-zinc-500 italic mb-1">-- Greater Than</div>
            <div className="text-indigo-400 font-bold">
              SELECT <span className="text-white font-normal">*</span>
            </div>
            <div className="text-indigo-400 font-bold">
              FROM{' '}
              <span className="text-amber-400 font-normal">table_name</span>
            </div>
            <div className="text-indigo-400 font-bold">
              WHERE{' '}
              <span className="text-amber-400 font-normal">column_name</span>{' '}
              <span className="text-pink-400 font-bold">&gt;</span>{' '}
              <span className="text-emerald-400 font-normal">value</span>;
            </div>
          </div>

          <div>
            <div className="text-zinc-500 italic mb-1">-- Less Than</div>
            <div className="text-indigo-400 font-bold">
              SELECT <span className="text-white font-normal">*</span>
            </div>
            <div className="text-indigo-400 font-bold">
              FROM{' '}
              <span className="text-amber-400 font-normal">table_name</span>
            </div>
            <div className="text-indigo-400 font-bold">
              WHERE{' '}
              <span className="text-amber-400 font-normal">column_name</span>{' '}
              <span className="text-pink-400 font-bold">&lt;</span>{' '}
              <span className="text-emerald-400 font-normal">value</span>;
            </div>
          </div>

          <div>
            <div className="text-zinc-500 italic mb-1">
              -- Greater Than or Equal To
            </div>
            <div className="text-indigo-400 font-bold">
              SELECT <span className="text-white font-normal">*</span>
            </div>
            <div className="text-indigo-400 font-bold">
              FROM{' '}
              <span className="text-amber-400 font-normal">table_name</span>
            </div>
            <div className="text-indigo-400 font-bold">
              WHERE{' '}
              <span className="text-amber-400 font-normal">column_name</span>{' '}
              <span className="text-pink-400 font-bold">&gt;=</span>{' '}
              <span className="text-emerald-400 font-normal">value</span>;
            </div>
          </div>

          <div>
            <div className="text-zinc-500 italic mb-1">
              -- Less Than or Equal To
            </div>
            <div className="text-indigo-400 font-bold">
              SELECT <span className="text-white font-normal">*</span>
            </div>
            <div className="text-indigo-400 font-bold">
              FROM{' '}
              <span className="text-amber-400 font-normal">table_name</span>
            </div>
            <div className="text-indigo-400 font-bold">
              WHERE{' '}
              <span className="text-amber-400 font-normal">column_name</span>{' '}
              <span className="text-pink-400 font-bold">&lt;=</span>{' '}
              <span className="text-emerald-400 font-normal">value</span>;
            </div>
          </div>

          <div>
            <div className="text-zinc-500 italic mb-1">-- Not Equal</div>
            <div className="text-indigo-400 font-bold">
              SELECT <span className="text-white font-normal">*</span>
            </div>
            <div className="text-indigo-400 font-bold">
              FROM{' '}
              <span className="text-amber-400 font-normal">table_name</span>
            </div>
            <div className="text-indigo-400 font-bold">
              WHERE{' '}
              <span className="text-amber-400 font-normal">column_name</span>{' '}
              <span className="text-pink-400 font-bold">!=</span>{' '}
              <span className="text-emerald-400 font-normal">value</span>;
            </div>
          </div>
          
          <div>
            <div className="text-zinc-500 italic mb-1">-- Is Null (Missing Values)</div>
            <div className="text-indigo-400 font-bold">
              SELECT <span className="text-white font-normal">*</span>
            </div>
            <div className="text-indigo-400 font-bold">
              FROM{' '}
              <span className="text-amber-400 font-normal">table_name</span>
            </div>
            <div className="text-indigo-400 font-bold">
              WHERE{' '}
              <span className="text-amber-400 font-normal">column_name</span>{' '}
              <span className="text-pink-400 font-bold">IS</span>{' '}
              <span className="text-emerald-400 font-normal">NULL</span>;
            </div>
          </div>
          
          <div>
            <div className="text-zinc-500 italic mb-1">-- Is Not Null (Existing Values)</div>
            <div className="text-indigo-400 font-bold">
              SELECT <span className="text-white font-normal">*</span>
            </div>
            <div className="text-indigo-400 font-bold">
              FROM{' '}
              <span className="text-amber-400 font-normal">table_name</span>
            </div>
            <div className="text-indigo-400 font-bold">
              WHERE{' '}
              <span className="text-amber-400 font-normal">column_name</span>{' '}
              <span className="text-pink-400 font-bold">IS NOT</span>{' '}
              <span className="text-emerald-400 font-normal">NULL</span>;
            </div>
          </div>
        </div>
      </div>

      {LESSON_STEPS.map((step, index) => (
        <React.Fragment key={index}>
          <hr className="border-zinc-800/50 my-4" />
          <InteractiveWhereExample
            step={step}
            index={index}
            onPass={() => handleStepComplete(index)}
            isCompleted={completedSteps.has(index)}
          />
        </React.Fragment>
      ))}

      <div className="mt-12 flex flex-col items-center gap-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
        <h3 className="text-xl font-bold text-white">Lesson Complete?</h3>
        <button
          onClick={() =>
            firstQuestId
              ? navigate(`/quest/${firstQuestId}`)
              : navigate('/home')
          }
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-12 rounded-xl transition-all flex justify-center items-center gap-3 shadow-[0_0_20px_rgba(79,70,229,0.3)] text-lg"
        >
          Enter the Arena ➔
        </button>
      </div>
    </div>
  );
};


// ==========================================
// MODULE 3: THE "ORDER BY" LESSON
// ==========================================
const APARTMENT_DATA: Record<string, string | number>[] = [
  { unit: '4D', rent: 4500, bedrooms: 3 },
  { unit: '1A', rent: 2500, bedrooms: 1 },
  { unit: '2B', rent: 3200, bedrooms: 2 },
  { unit: '3C', rent: 2500, bedrooms: 2 },
  { unit: '5E', rent: 3200, bedrooms: 1 },
];

const InteractiveOrderByExample = ({
  step,
  index,
  onPass,
  isCompleted,
}: {
  step: OrderByStepData;
  index: number;
  onPass: () => void;
  isCompleted: boolean;
}) => {
  const [selectedCol1, setSelectedCol1] = useState('');
  const [selectedDir1, setSelectedDir1] = useState('');
  const [selectedCol2, setSelectedCol2] = useState('');
  const [selectedDir2, setSelectedDir2] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>(
    'idle',
  );

  const handleSubmit = () => {
    let isCorrect =
      selectedCol1 === step.expected.col1 &&
      selectedDir1 === step.expected.dir1;
    if (step.isMulti) {
      isCorrect =
        isCorrect &&
        selectedCol2 === step.expected.col2 &&
        selectedDir2 === step.expected.dir2;
    }
    if (isCorrect) {
      setFeedback('correct');
      onPass();
    } else {
      setFeedback('wrong');
    }
  };

  const getDisplayData = () => {
    if (feedback !== 'correct') return APARTMENT_DATA;
    return [...APARTMENT_DATA].sort((a, b) => {
      const valA = a[step.expected.col1];
      const valB = b[step.expected.col1];
      let cmp = valA > valB ? 1 : valA < valB ? -1 : 0;
      if (step.expected.dir1 === 'DESC') cmp *= -1;

      if (cmp === 0 && step.expected.col2 && step.expected.dir2) {
        const valA2 = a[step.expected.col2];
        const valB2 = b[step.expected.col2];
        let cmp2 = valA2 > valB2 ? 1 : valA2 < valB2 ? -1 : 0;
        if (step.expected.dir2 === 'DESC') cmp2 *= -1;
        return cmp2;
      }
      return cmp;
    });
  };

  const currentData = getDisplayData();
  const columns = ['unit', 'rent', 'bedrooms'];

  return (
    <div className="w-full flex flex-col xl:flex-row gap-8 mb-12">
      <div className="w-full xl:w-1/2 flex flex-col gap-6">
        <div
          className={`bg-zinc-900/40 backdrop-blur-xl border ${isCompleted ? 'border-emerald-500/50' : 'border-zinc-800/50'} rounded-2xl p-6 md:p-8 shadow-2xl h-full transition-all`}
        >
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
            <span
              className={`${isCompleted ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'} w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black transition-colors shadow-lg`}
            >
              {isCompleted ? '✓' : index + 1}
            </span>
            {step.title}
          </h2>
          <p className="text-zinc-400 mb-6 text-lg leading-relaxed">
            {step.prompt}
          </p>

          <div className="border border-zinc-800/50 rounded-lg overflow-hidden bg-zinc-900/20 shadow-md">
            <div className="bg-zinc-950/80 px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50">
              Table: apartments
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-base">
                <thead className="bg-zinc-950/50 border-b border-zinc-800/50">
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {currentData.map((row) => (
                    <motion.tr
                      layout
                      key={row.unit}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                      }}
                      className="hover:bg-zinc-800/30 transition-colors"
                    >
                      {columns.map((col, j) => (
                        <td
                          key={j}
                          className="px-4 py-3 font-mono text-base text-zinc-300"
                        >
                          {row[col]}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full xl:w-1/2 flex flex-col">
        <div
          className={`bg-zinc-900/40 backdrop-blur-xl border-2 rounded-2xl overflow-hidden flex flex-col flex-1 shadow-2xl transition-colors duration-300 ${feedback === 'correct' ? 'border-emerald-500' : feedback === 'wrong' ? 'border-red-500' : 'border-zinc-800/50'}`}
        >
          <div className="bg-zinc-950/80 px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              Query Builder
            </span>
          </div>
          <div className="p-8 flex-1 bg-zinc-950/40 font-mono text-base flex flex-col justify-center gap-6">
            <div>
              <span className="text-indigo-400 font-bold">SELECT</span>{' '}
              <span className="text-white">*</span> <br />
              <span className="text-indigo-400 font-bold">FROM</span>{' '}
              <span className="text-amber-400">apartments</span>
            </div>

            <div className="flex flex-col gap-4 bg-zinc-900 border border-zinc-800/50 p-6 rounded-xl shadow-inner">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-indigo-400 font-bold">ORDER BY</span>
                <select
                  value={selectedCol1}
                  onChange={(e) => {
                    setSelectedCol1(e.target.value);
                    setFeedback('idle');
                  }}
                  className="bg-zinc-950 border border-zinc-800 text-amber-400 font-mono text-base rounded-md px-3 py-2 outline-none cursor-pointer focus:border-indigo-500 transition-colors"
                >
                  <option value="" disabled>
                    column
                  </option>
                  {columns.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedDir1}
                  onChange={(e) => {
                    setSelectedDir1(e.target.value);
                    setFeedback('idle');
                  }}
                  className="bg-zinc-950 border border-zinc-800 text-emerald-400 font-bold font-mono text-base rounded-md px-3 py-2 outline-none cursor-pointer focus:border-indigo-500 transition-colors"
                >
                  <option value="" disabled>
                    direction
                  </option>
                  <option value="ASC">ASC</option>
                  <option value="DESC">DESC</option>
                </select>
              </div>
              {step.isMulti && (
                <div className="flex flex-wrap items-center gap-3 pl-4 md:pl-8">
                  <span className="text-zinc-500 text-lg font-black">,</span>
                  <select
                    value={selectedCol2}
                    onChange={(e) => {
                      setSelectedCol2(e.target.value);
                      setFeedback('idle');
                    }}
                    className="bg-zinc-950 border border-zinc-800 text-amber-400 font-mono text-base rounded-md px-3 py-2 outline-none cursor-pointer focus:border-indigo-500 transition-colors"
                  >
                    <option value="" disabled>
                      column
                    </option>
                    {columns.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedDir2}
                    onChange={(e) => {
                      setSelectedDir2(e.target.value);
                      setFeedback('idle');
                    }}
                    className="bg-zinc-950 border border-zinc-800 text-emerald-400 font-bold font-mono text-base rounded-md px-3 py-2 outline-none cursor-pointer focus:border-indigo-500 transition-colors"
                  >
                    <option value="" disabled>
                      direction
                    </option>
                    <option value="ASC">ASC</option>
                    <option value="DESC">DESC</option>
                  </select>
                </div>
              )}
            </div>
          </div>
          <div className="p-6 border-t border-zinc-800 bg-zinc-950/80">
            {feedback === 'idle' && (
              <button
                onClick={handleSubmit}
                disabled={
                  !selectedCol1 ||
                  !selectedDir1 ||
                  (step.isMulti && (!selectedCol2 || !selectedDir2))
                }
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white font-bold py-4 rounded-xl transition-all text-lg"
              >
                Run Sort
              </button>
            )}
            {feedback === 'wrong' && (
              <div className="flex flex-col gap-4">
                <div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/30 text-center font-bold text-lg">
                  Not quite! Check your logic.
                </div>
                <button
                  onClick={() => setFeedback('idle')}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl transition-all text-lg"
                >
                  Try Again
                </button>
              </div>
            )}
            {feedback === 'correct' && (
              <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-lg border border-emerald-500/30 text-center font-bold text-lg">
                Sorted successfully! Watch the table react.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderByLesson: React.FC<LessonModuleProps> = ({
  onComplete,
  navigate,
}) => {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const LESSON_STEPS: OrderByStepData[] = [
    {
      title: '1. Ascending Sort (ASC)',
      prompt:
        'The default sorting behavior. Sort the apartments by rent from cheapest to most expensive.',
      isMulti: false,
      expected: { col1: 'rent', dir1: 'ASC' },
    },
    {
      title: '2. Descending Sort (DESC)',
      prompt:
        'Reverse the order! Sort the apartments by the number of bedrooms, from highest to lowest.',
      isMulti: false,
      expected: { col1: 'bedrooms', dir1: 'DESC' },
    },
    {
      title: '3. Multi-Column Tie-Breakers',
      prompt:
        "Notice how some apartments have the exact same rent? Let's use a tie-breaker: First, sort by rent (ASC) to put the cheapest units at the top. Second, sort by bedrooms (DESC) so that if two units cost the exact same, the one with the most bedrooms appears first.",
      isMulti: true,
      expected: { col1: 'rent', dir1: 'ASC', col2: 'bedrooms', dir2: 'DESC' },
    },
  ];
  const [firstQuestId, setFirstQuestId]=useState("")
  useEffect(() => {
  const fetchFirstQuest = async () => {
    // 1. Ask Supabase for the ID of the first quest in this category
    const { data, error } = await supabase
      .from('quests')
      .select('id')
      .ilike('title', "Data Analyst Salaries") // Use ilike for case-insensitive matching
      .limit(1)
      .single();

    if (error) {
      console.error('Could not find first quest:', error);
      return;
    }

    // 2. Save that ID to state!
    if (data) {
      setFirstQuestId(data.id);
    }
  };

  fetchFirstQuest();
}, []);

  const handleStepComplete = (index: number) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);
      if (newSet.size === LESSON_STEPS.length) onComplete();
      return newSet;
    });
  };

  return (
    <div className="w-full flex flex-col gap-12 pb-32">
      <div className="max-w-3xl">
        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
          Interactive Lesson
        </span>
        <h1 className="text-4xl font-black text-white mt-2 mb-6">
          The <span className="text-indigo-400 font-bold">ORDER BY</span> Clause
        </h1>
      </div>

      <div className="max-w-5xl bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 md:p-8 shadow-2xl">
        <div className="text-zinc-300 leading-relaxed space-y-5 text-lg">
          <p>
            Think of your database table like a massive online store. You
            already know how to use{' '}
            <code className="bg-zinc-950 border border-zinc-800 text-indigo-400 font-bold px-2 py-0.5 rounded font-mono text-base">
              SELECT
            </code>{' '}
            to pick your vertical columns, and{' '}
            <code className="bg-zinc-950 border border-zinc-800 text-indigo-400 font-bold px-2 py-0.5 rounded font-mono text-base">
              WHERE
            </code>{' '}
            to filter your horizontal rows. But right now, those rows are
            displayed in a random order!
          </p>
          <p>
            That is where{' '}
            <code className="bg-zinc-950 border border-zinc-800 text-indigo-400 font-bold px-2 py-0.5 rounded font-mono text-base">
              ORDER BY
            </code>{' '}
            comes in. It takes your remaining rows and physically ranks them.
          </p>

          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-6 mt-6 shadow-md">
            <h3 className="text-white font-bold mb-4">The Two Directions:</h3>
            <ul className="space-y-6 text-base">
              <li className="flex items-start gap-4">
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-1 rounded text-sm font-bold font-mono mt-0.5 shadow-sm">
                  ASC
                </span>
                <div className="text-lg">
                  <strong className="text-white block mb-1">
                    Ascending (Going Up)
                  </strong>
                  Sorts numbers from smallest to largest (1 to 10), and words
                  alphabetically (A to Z). If you don't type a direction, SQL
                  will automatically use this default.
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="bg-pink-500/10 border border-pink-500/30 text-pink-400 px-2 py-1 rounded text-sm font-bold font-mono mt-0.5 shadow-sm">
                  DESC
                </span>
                <div className="text-lg">
                  <strong className="text-white block mb-1">
                    Descending (Going Down)
                  </strong>
                  Sorts numbers from largest to smallest (10 to 1), and words
                  backwards (Z to A). Essential for "Top 10" leaderboards.
                </div>
              </li>
            </ul>
          </div>

          <p className="pt-2">
            <strong>What about ties?</strong> If two apartments cost exactly
            $2,500, which one shows up first? You can use a comma to add a
            "Tie-Breaker" rule. For example:{' '}
            <em>
              "Sort by Rent lowest to highest, but if they are the same price,
              sort those specific apartments by Bedrooms highest to lowest."
            </em>
          </p>
        </div>
      </div>

      <div className="max-w-4xl mt-4">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
          Syntax Examples
        </h3>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 font-mono text-base shadow-inner flex flex-col gap-6">
          <div>
            <div className="text-zinc-500 italic mb-1">
              -- Ascending Sort (Default)
            </div>
            <div className="text-indigo-400 font-bold">
              SELECT <span className="text-white font-normal">*</span>
            </div>
            <div className="text-indigo-400 font-bold">
              FROM{' '}
              <span className="text-amber-400 font-normal">table_name</span>
            </div>
            <div className="text-indigo-400 font-bold">
              ORDER BY{' '}
              <span className="text-amber-400 font-normal">column_name</span>{' '}
              <span className="text-emerald-400 font-bold">ASC</span>;
            </div>
          </div>
          <div>
            <div className="text-zinc-500 italic mb-1">-- Descending Sort</div>
            <div className="text-indigo-400 font-bold">
              SELECT <span className="text-white font-normal">*</span>
            </div>
            <div className="text-indigo-400 font-bold">
              FROM{' '}
              <span className="text-amber-400 font-normal">table_name</span>
            </div>
            <div className="text-indigo-400 font-bold">
              ORDER BY{' '}
              <span className="text-amber-400 font-normal">column_name</span>{' '}
              <span className="text-emerald-400 font-bold">DESC</span>;
            </div>
          </div>
          <div>
            <div className="text-zinc-500 italic mb-1">
              -- Multi-Column Sort
            </div>
            <div className="text-indigo-400 font-bold">
              SELECT <span className="text-white font-normal">*</span>
            </div>
            <div className="text-indigo-400 font-bold">
              FROM{' '}
              <span className="text-amber-400 font-normal">table_name</span>
            </div>
            <div className="text-indigo-400 font-bold">
              ORDER BY{' '}
              <span className="text-amber-400 font-normal">column1</span>{' '}
              <span className="text-emerald-400 font-bold">ASC</span>
              <span className="text-zinc-500 font-bold">,</span>{' '}
              <span className="text-amber-400 font-normal">column2</span>{' '}
              <span className="text-emerald-400 font-bold">DESC</span>;
            </div>
          </div>
        </div>
      </div>

      {LESSON_STEPS.map((step, index) => (
        <React.Fragment key={index}>
          <hr className="border-zinc-800/50 my-4" />
          <InteractiveOrderByExample
            step={step}
            index={index}
            onPass={() => handleStepComplete(index)}
            isCompleted={completedSteps.has(index)}
          />
        </React.Fragment>
      ))}

      <div className="mt-12 flex flex-col items-center gap-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
        <h3 className="text-xl font-bold text-white">Lesson Complete?</h3>
        <button
          onClick={() =>
            firstQuestId
              ? navigate(`/quest/${firstQuestId}`)
              : navigate('/home')
          }
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-12 rounded-xl transition-all flex justify-center items-center gap-3 shadow-[0_0_20px_rgba(79,70,229,0.3)] text-lg"
        >
          Start ORDER BY Quests ➔
        </button>
      </div>
    </div>
  );
};

// ==========================================
// MODULE 4: THE "GROUP BY" & AGGREGATE LESSON
// ==========================================

// Make sure LessonModuleProps and AggStepData are imported/defined in your file!

const COFFEE_SALES_DATA: Record<string, string | number>[] = [
  {
    sale_id: 101,
    drink: 'Latte',
    category: 'Espresso',
    price: 5,
    quantity: 2,
    barista: 'Alice',
  },
  {
    sale_id: 102,
    drink: 'Cold Brew',
    category: 'Coffee',
    price: 6,
    quantity: 1,
    barista: 'Bob',
  },
  {
    sale_id: 103,
    drink: 'Latte',
    category: 'Espresso',
    price: 5,
    quantity: 1,
    barista: 'Charlie',
  },
  {
    sale_id: 104,
    drink: 'Green Tea',
    category: 'Tea',
    price: 4,
    quantity: 3,
    barista: 'Alice',
  },
  {
    sale_id: 105,
    drink: 'Drip',
    category: 'Coffee',
    price: 3,
    quantity: 1,
    barista: 'Bob',
  },
  {
    sale_id: 106,
    drink: 'Mocha',
    category: 'Espresso',
    price: 6,
    quantity: 2,
    barista: 'Charlie',
  },
];

const InteractiveAggExample = ({
  step,
  index,
  onPass,
  isCompleted,
}: {
  step: AggStepData;
  index: number;
  onPass: () => void;
  isCompleted: boolean;
}) => {
  const [selectedAgg, setSelectedAgg] = useState('');
  const [selectedCol, setSelectedCol] = useState('');
  // Decoupled states: One for SELECT, one for GROUP BY
  const [selectedCategoryCol, setSelectedCategoryCol] = useState('');
  const [selectedGroupCol, setSelectedGroupCol] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>(
    'idle',
  );

  const columns = Object.keys(COFFEE_SALES_DATA[0]);
  const aggFunctions = ['COUNT', 'SUM', 'AVG', 'MAX', 'MIN'];

  const handleSubmit = () => {
    let isCorrect =
      selectedAgg === step.expected.aggFunc &&
      selectedCol === step.expected.col;
      
    if (step.type === 'groupby') {
      // Must correctly select the column in BOTH dropdowns
      isCorrect = 
        isCorrect && 
        selectedCategoryCol === step.expected.groupByCol &&
        selectedGroupCol === step.expected.groupByCol;
    }
    
    if (isCorrect) {
      setFeedback('correct');
      onPass();
    } else {
      setFeedback('wrong');
    }
  };

  const calculateOutput = () => {
    if (feedback !== 'correct') return null;

    if (step.type === 'agg') {
      let result = 0;
      const values = COFFEE_SALES_DATA.map(
        (row) => Number(row[step.expected.col]) || 0,
      );

      if (step.expected.aggFunc === 'COUNT') result = COFFEE_SALES_DATA.length;
      if (step.expected.aggFunc === 'SUM')
        result = values.reduce((a, b) => a + b, 0);
      if (step.expected.aggFunc === 'AVG') {
        const sum = values.reduce((a, b) => a + b, 0);
        result = Math.round(sum / values.length);
      }
      if (step.expected.aggFunc === 'MAX') result = Math.max(...values);
      if (step.expected.aggFunc === 'MIN') result = Math.min(...values);

      const keyName =
        step.expected.aggFunc === 'AVG'
          ? 'round'
          : `${step.expected.aggFunc}(${step.expected.col})`;
      return [{ [keyName]: result }];
    }

    if (step.type === 'groupby' && step.expected.groupByCol) {
      const groups: Record<string, number[]> = {};
      COFFEE_SALES_DATA.forEach((row) => {
        const key = String(row[step.expected.groupByCol!]);
        if (!groups[key]) groups[key] = [];
        groups[key].push(Number(row[step.expected.col]) || 0);
      });

      return Object.keys(groups).map((key) => {
        const vals = groups[key];
        let res = 0;
        const sum = vals.reduce((a, b) => a + b, 0);

        if (step.expected.aggFunc === 'COUNT') res = vals.length;
        if (step.expected.aggFunc === 'SUM') res = sum;
        if (step.expected.aggFunc === 'AVG')
          res = Math.round(sum / vals.length);
        if (step.expected.aggFunc === 'MAX') res = Math.max(...vals);
        if (step.expected.aggFunc === 'MIN') res = Math.min(...vals);

        const keyName =
          step.expected.aggFunc === 'AVG'
            ? 'round'
            : `${step.expected.aggFunc}(${step.expected.col})`;
        return { [step.expected.groupByCol!]: key, [keyName]: res };
      });
    }
    return null;
  };

  const outputData = calculateOutput();

  return (
    <div className="w-full flex flex-col xl:flex-row gap-8 mb-12">
      <div className="w-full xl:w-1/2 flex flex-col gap-6">
        <div
          className={`bg-zinc-900/40 backdrop-blur-xl border ${isCompleted ? 'border-emerald-500/50' : 'border-zinc-800/50'} rounded-2xl p-6 md:p-8 shadow-2xl h-full transition-all`}
        >
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
            <span
              className={`${isCompleted ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'} w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black transition-colors shadow-lg`}
            >
              {isCompleted ? '✓' : index + 1}
            </span>
            {step.title}
          </h2>
          <p className="text-zinc-400 mb-6 text-lg leading-relaxed">
            {step.prompt}
          </p>

          <div className="border border-zinc-800/50 rounded-lg overflow-hidden bg-zinc-900/20 shadow-md">
            <div className="bg-zinc-950/80 px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50">
              Raw Table: coffee_sales
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-base">
                <thead className="bg-zinc-950/50 border-b border-zinc-800/50">
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody
                  className={`divide-y divide-zinc-800/50 transition-opacity duration-700 ${feedback === 'correct' ? 'opacity-20' : 'opacity-100'}`}
                >
                  {COFFEE_SALES_DATA.map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-zinc-800/30 transition-colors"
                    >
                      {columns.map((col, j) => (
                        <td
                          key={j}
                          className="px-4 py-3 font-mono text-base text-zinc-300 whitespace-nowrap"
                        >
                          {row[col]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {outputData && (
          <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-4 animate-in fade-in slide-in-from-top-4">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">
              SQL Output Result
            </h3>
            <div className="border border-zinc-800/50 rounded-lg overflow-hidden bg-black/40 shadow-inner">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-base">
                  <thead className="bg-black/60 border-b border-emerald-500/20">
                    <tr>
                      {Object.keys(outputData[0]).map((col) => (
                        <th
                          key={col}
                          className="px-4 py-3 font-mono font-bold text-emerald-400 uppercase tracking-tight whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-500/10">
                    {outputData.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val, j) => (
                          <td
                            key={j}
                            className="px-4 py-3 font-mono text-base text-zinc-200 font-bold whitespace-nowrap"
                          >
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-full xl:w-1/2 flex flex-col">
        <div
          className={`bg-zinc-900/40 backdrop-blur-xl border-2 rounded-2xl overflow-hidden flex flex-col flex-1 shadow-2xl transition-colors duration-300 ${feedback === 'correct' ? 'border-emerald-500' : feedback === 'wrong' ? 'border-red-500' : 'border-zinc-800/50'}`}
        >
          <div className="bg-zinc-950/80 px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              Query Builder
            </span>
          </div>
          <div className="p-8 flex-1 bg-zinc-950/40 font-mono text-base flex flex-col justify-center gap-6">
            
            <div className="flex items-center gap-3 flex-nowrap whitespace-nowrap overflow-x-auto pb-2 hide-scrollbar">
              <span className="text-indigo-400 font-bold">SELECT</span>
              
              {step.type === 'groupby' && (
                <>
                  <select
                    value={selectedCategoryCol}
                    onChange={(e) => {
                      setSelectedCategoryCol(e.target.value);
                      setFeedback('idle');
                    }}
                    className="bg-zinc-950 border border-zinc-800 text-amber-400 font-mono text-base rounded-md px-2 py-1 outline-none cursor-pointer focus:border-indigo-500 transition-colors"
                  >
                    <option value="" disabled>
                      category_col
                    </option>
                    {columns.map((c) => (
                      <option key={`select-cat-${c}`} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <span className="text-zinc-500 font-bold">,</span>
                </>
              )}
              <div className="flex items-center gap-1">
                <select
                  value={selectedAgg}
                  onChange={(e) => {
                    setSelectedAgg(e.target.value);
                    setFeedback('idle');
                  }}
                  className="bg-zinc-950 border border-zinc-800 text-indigo-400 font-bold font-mono text-base rounded-md px-2 py-1 outline-none cursor-pointer focus:border-indigo-500 transition-colors"
                >
                  <option value="" disabled>
                    AGG
                  </option>
                  {aggFunctions.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
                <span className="text-zinc-500 font-bold">(</span>
                <select
                  value={selectedCol}
                  onChange={(e) => {
                    setSelectedCol(e.target.value);
                    setFeedback('idle');
                  }}
                  className="bg-zinc-950 border border-zinc-800 text-amber-400 font-mono text-base rounded-md px-2 py-1 outline-none cursor-pointer focus:border-indigo-500 transition-colors"
                >
                  <option value="" disabled>
                    column
                  </option>
                  {columns.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <span className="text-zinc-500 font-bold">)</span>
              </div>
            </div>

            <div>
              <span className="text-indigo-400 font-bold">FROM</span>{' '}
              <span className="text-amber-400">coffee_sales</span>
            </div>

            {step.type === 'groupby' && (
              <div className="flex flex-wrap items-center gap-3 bg-zinc-900 border border-zinc-800/50 p-6 rounded-xl shadow-inner">
                <span className="text-indigo-400 font-bold">GROUP BY</span>
                <select
                  value={selectedGroupCol}
                  onChange={(e) => {
                    setSelectedGroupCol(e.target.value);
                    setFeedback('idle');
                  }}
                  className="bg-zinc-950 border border-zinc-800 text-amber-400 font-mono text-base rounded-md px-3 py-2 outline-none cursor-pointer focus:border-indigo-500 transition-colors"
                >
                  <option value="" disabled>
                    category_col
                  </option>
                  {columns.map((c) => (
                    <option key={`group-cat-${c}`} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-zinc-800 bg-zinc-950/80">
            {feedback === 'idle' && (
              <button
                onClick={handleSubmit}
                disabled={
                  !selectedAgg ||
                  !selectedCol ||
                  (step.type === 'groupby' && (!selectedCategoryCol || !selectedGroupCol))
                }
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white font-bold py-4 rounded-xl transition-all text-lg"
              >
                Run Aggregation
              </button>
            )}
            {feedback === 'wrong' && (
              <div className="flex flex-col gap-4">
                <div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/30 text-center font-bold text-lg">
                  Incorrect syntax. Make sure your SELECT category matches your GROUP BY category!
                </div>
                <button
                  onClick={() => setFeedback('idle')}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl transition-all text-lg"
                >
                  Try Again
                </button>
              </div>
            )}
            {feedback === 'correct' && (
              <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-lg border border-emerald-500/30 text-center font-bold text-lg">
                Calculation successful! Check the output.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const GroupByLesson: React.FC<LessonModuleProps> = ({
  onComplete,
  navigate,
}) => {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [firstQuestId, setFirstQuestId] = useState("");

  useEffect(() => {
    const fetchFirstQuest = async () => {
      const { data, error } = await supabase
        .from('quests')
        .select('id')
        .ilike('title', "Total Bounty Pool") 
        .limit(1)
        .single();

      if (error) {
        console.error('Could not find first quest:', error);
        return;
      }

      if (data) {
        setFirstQuestId(data.id);
      }
    };

    fetchFirstQuest();
  }, []);

  const AGG_SECTIONS = [
    {
      func: 'COUNT()',
      desc: 'Counts the number of rows that contain data. Great for finding total transactions or total employees.',
      returns: 'A single number representing the total tally of rows.',
      steps: [
        {
          title: 'Count Total Transactions',
          prompt:
            'Use COUNT on the sale_id to see how many total sales occurred.',
          type: 'agg' as const,
          expected: { aggFunc: 'COUNT', col: 'sale_id' }, // 👈 Fixed
        },
        {
          title: 'Count Drinks Made',
          prompt:
            'Use COUNT on the drink column to tally up how many drinks were prepared.',
          type: 'agg' as const,
          expected: { aggFunc: 'COUNT', col: 'drink' },
        },
        {
          title: 'Count Baristas',
          prompt:
            'Use COUNT on the barista column to see how many barista records exist in these sales.',
          type: 'agg' as const,
          expected: { aggFunc: 'COUNT', col: 'barista' },
        },
      ],
    },
    {
      func: 'SUM()',
      desc: 'Adds up all the numbers in a specific column. Essential for calculating total revenue or total inventory.',
      returns:
        'A single number representing the mathematical total of the column.',
      steps: [
        {
          title: 'Total Quantity Sold',
          prompt:
            'Use SUM to add up every number in the quantity column to see total physical items handed out.',
          type: 'agg' as const,
          expected: { aggFunc: 'SUM', col: 'quantity' },
        },
        {
          title: 'Total Base Prices',
          prompt:
            'Use SUM on the price column to add up the menu prices of the drinks sold.',
          type: 'agg' as const,
          expected: { aggFunc: 'SUM', col: 'price' },
        },
        {
          title: 'Sum of IDs (Math Practice)',
          prompt:
            "You wouldn't normally do this in real life, but use SUM on sale_id just to prove it adds the numbers together!",
          type: 'agg' as const,
          expected: { aggFunc: 'SUM', col: 'sale_id' }, // 👈 Fixed
        },
      ],
    },
    {
      func: 'AVG()',
      desc: 'Calculates the mathematical average of a column. Perfect for finding the average order value.',
      returns: 'A single decimal number representing the calculated average.',
      steps: [
        {
          title: 'Average Drink Price',
          prompt:
            'What is the average price of a drink on this list? Use AVG on the price column.',
          type: 'agg' as const,
          expected: { aggFunc: 'AVG', col: 'price' },
        },
        {
          title: 'Average Order Quantity',
          prompt:
            'How many items do people usually buy per transaction? Use AVG on the quantity column.',
          type: 'agg' as const,
          expected: { aggFunc: 'AVG', col: 'quantity' },
        },
        {
          title: 'Average ID (More Math)',
          prompt:
            'Again, silly in the real world, but test your logic by finding the AVG of the sale_id.',
          type: 'agg' as const,
          expected: { aggFunc: 'AVG', col: 'sale_id' }, // 👈 Fixed
        },
      ],
    },
    {
      func: 'MAX()',
      desc: 'Finds the absolute highest value in a column. Use this to find the most expensive item or highest score.',
      returns:
        'A single value representing the largest number (or latest date/last alphabetical word).',
      steps: [
        {
          title: 'Most Expensive Item',
          prompt:
            'Use MAX on the price column to find the cost of the most expensive drink sold.',
          type: 'agg' as const,
          expected: { aggFunc: 'MAX', col: 'price' },
        },
        {
          title: 'Largest Order Size',
          prompt:
            'Use MAX on the quantity column to find the biggest single order.',
          type: 'agg' as const,
          expected: { aggFunc: 'MAX', col: 'quantity' },
        },
        {
          title: 'Latest Transaction',
          prompt:
            'Find the most recent transaction by running MAX on the sale_id.',
          type: 'agg' as const,
          expected: { aggFunc: 'MAX', col: 'sale_id' }, // 👈 Fixed
        },
      ],
    },
    {
      func: 'MIN()',
      desc: 'Finds the absolute lowest value in a column. Used for finding the cheapest item or oldest date.',
      returns:
        'A single value representing the smallest number (or earliest date/first alphabetical word).',
      steps: [
        {
          title: 'Cheapest Drink',
          prompt:
            'Use MIN on the price column to see the cheapest drink available.',
          type: 'agg' as const,
          expected: { aggFunc: 'MIN', col: 'price' },
        },
        {
          title: 'Smallest Order',
          prompt:
            'Use MIN on the quantity column to see the smallest order size.',
          type: 'agg' as const,
          expected: { aggFunc: 'MIN', col: 'quantity' },
        },
        {
          title: 'First Transaction',
          prompt:
            'Find the very first transaction recorded by running MIN on the sale_id.',
          type: 'agg' as const,
          expected: { aggFunc: 'MIN', col: 'sale_id' }, // 👈 Fixed
        },
      ],
    },
  ];

  const GROUP_BY_SECTIONS = [
    {
      func: 'GROUP BY + COUNT()',
      desc: 'Group your data into categories, then counts the rows inside each category.',
      returns:
        'A two-column summary table: Column 1 shows the unique categories, Column 2 shows the tally for each.',
      steps: [
        {
          title: 'Transactions per Category',
          prompt:
            'How many sales happened in each category? COUNT the sale_ids, and GROUP BY category.',
          type: 'groupby' as const,
          expected: {
            aggFunc: 'COUNT',
            col: 'sale_id', // 👈 Fixed
            groupByCol: 'category',
          },
        },
        {
          title: 'Unique Drinks per Category',
          prompt:
            'How many different types of drinks belong to each category? COUNT the drink column, and GROUP BY category.',
          type: 'groupby' as const,
          expected: { aggFunc: 'COUNT', col: 'drink', groupByCol: 'category' },
        },
      ],
    },
    {
      func: 'GROUP BY + SUM()',
      desc: 'Buckets your data, then adds up the numbers in each bucket.',
      returns:
        'A two-column summary table: Column 1 shows the unique categories, Column 2 shows the mathematical total for each.',
      steps: [
        {
          title: 'Items Sold by Category',
          prompt:
            'SUM the total quantity of items sold, but GROUP BY category so we can compare Espresso to Tea.',
          type: 'groupby' as const,
          expected: { aggFunc: 'SUM', col: 'quantity', groupByCol: 'category' },
        },
        {
          title: 'Total Value Handled by Barista',
          prompt:
            'SUM the price of the drinks handled, and GROUP BY barista to see who dealt with the most expensive orders.',
          type: 'groupby' as const,
          expected: { aggFunc: 'SUM', col: 'price', groupByCol: 'barista' },
        },
      ],
    },
    {
      func: 'GROUP BY + AVG()',
      desc: 'Finds the average value for each distinct bucket.',
      returns:
        'A two-column summary table: Column 1 shows the unique categories, Column 2 shows the calculated average for each.',
      steps: [
        {
          title: 'Average Price per Category',
          prompt:
            'Calculate the AVG price, and GROUP BY category to see if Espresso is generally more expensive than Tea.',
          type: 'groupby' as const,
          expected: { aggFunc: 'AVG', col: 'price', groupByCol: 'category' },
        },
        {
          title: 'Average Order Size per Barista',
          prompt: 'Calculate the AVG quantity ordered, and GROUP BY barista.',
          type: 'groupby' as const,
          expected: { aggFunc: 'AVG', col: 'quantity', groupByCol: 'barista' },
        },
      ],
    },
    {
      func: 'GROUP BY + MAX()',
      desc: 'Finds the highest value within each bucket.',
      returns:
        'A two-column summary table: Column 1 shows the unique categories, Column 2 shows the maximum value found in each.',
      steps: [
        {
          title: 'Priciest Drink per Category',
          prompt: 'Find the MAX price, and GROUP BY category.',
          type: 'groupby' as const,
          expected: { aggFunc: 'MAX', col: 'price', groupByCol: 'category' },
        },
        {
          title: 'Largest Order per Barista',
          prompt: 'Find the MAX quantity handled, and GROUP BY barista.',
          type: 'groupby' as const,
          expected: { aggFunc: 'MAX', col: 'quantity', groupByCol: 'barista' },
        },
      ],
    },
    {
      func: 'GROUP BY + MIN()',
      desc: 'Finds the lowest value within each bucket.',
      returns:
        'A two-column summary table: Column 1 shows the unique categories, Column 2 shows the minimum value found in each.',
      steps: [
        {
          title: 'Cheapest Drink per Category',
          prompt: 'Find the MIN price, and GROUP BY category.',
          type: 'groupby' as const,
          expected: { aggFunc: 'MIN', col: 'price', groupByCol: 'category' },
        },
        {
          title: 'Smallest Order per Barista',
          prompt: 'Find the MIN quantity, and GROUP BY barista.',
          type: 'groupby' as const,
          expected: { aggFunc: 'MIN', col: 'quantity', groupByCol: 'barista' },
        },
      ],
    },
  ];

  const totalSteps =
    AGG_SECTIONS.reduce((acc, curr) => acc + curr.steps.length, 0) +
    GROUP_BY_SECTIONS.reduce((acc, curr) => acc + curr.steps.length, 0);

  const handleStepComplete = (index: number) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);
      if (newSet.size === totalSteps) onComplete();
      return newSet;
    });
  };

  let globalStepIndex = 0;

  return (
    <div className="w-full flex flex-col gap-12 pb-32">
      <div className="max-w-3xl">
        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
          Interactive Lesson
        </span>
        <h1 className="text-4xl font-black text-white mt-2 mb-6">
          Aggregations &{' '}
          <span className="text-indigo-400 font-bold">GROUP BY</span>
        </h1>
      </div>

      <div className="max-w-5xl bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 md:p-8 shadow-2xl">
        <div className="text-zinc-300 leading-relaxed space-y-5 text-lg">
          <p>
            So far, every SQL command you've learned keeps your data looking
            like a spreadsheet. But what if you don't want to see 1,000
            individual transactions? What if you just want to know the{' '}
            <strong>Total Revenue</strong> or the <strong>Average Price</strong>
            ?
          </p>
          <p>
            That is where <strong>Aggregate Functions</strong> come in. They
            take an entire column of data and "crush" it down into a single
            mathematical answer.
          </p>
        </div>
      </div>

      {/* RENDER PART 1: AGGREGATES */}
      {AGG_SECTIONS.map((section, sIdx) => (
        <div key={`agg-sec-${sIdx}`} className="mt-8">
          <div className="mb-8 border-l-4 border-indigo-500 pl-6">
            <h2 className="text-2xl font-black text-indigo-400 font-mono">
              {section.func}
            </h2>
            <p className="text-zinc-400 mt-2 text-lg">{section.desc}</p>

            <div className="mt-4 bg-zinc-950 border border-zinc-800 p-6 rounded-xl inline-flex flex-col gap-1 font-mono text-base shadow-inner">
              <div className="text-indigo-400 font-bold">
                SELECT{' '}
                <span className="text-indigo-400 font-bold">
                  {section.func.replace('()', '')}
                </span>
                (<span className="text-amber-400 font-normal">column_name</span>
                )
              </div>
              <div className="text-indigo-400 font-bold">
                FROM{' '}
                <span className="text-amber-400 font-normal">table_name</span>;
              </div>
            </div>

            <p className="text-base text-zinc-400 mt-4 italic flex items-center gap-2">
              <span className="text-indigo-500 font-black">↳</span>{' '}
              <strong>Returns:</strong> {section.returns}
            </p>
          </div>
          {section.steps.map((step) => {
            const currentIndex = globalStepIndex++;
            return (
              <InteractiveAggExample
                key={currentIndex}
                step={step}
                index={currentIndex}
                onPass={() => handleStepComplete(currentIndex)}
                isCompleted={completedSteps.has(currentIndex)}
              />
            );
          })}
        </div>
      ))}

      {/* --- NEW GROUP BY INTRODUCTION --- */}
      <div className="max-w-3xl mt-16 mb-6">
        <h1 className="text-4xl font-black text-white mb-6">
          Enter: The <span className="text-indigo-400">GROUP BY</span> Clause
        </h1>
      </div>

      <div className="max-w-5xl bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 md:p-8 shadow-2xl mb-8">
        <div className="text-zinc-300 leading-relaxed space-y-6 text-lg">
          <p>
            You just learned how to crush an entire table into a single number.
            But what if you own a Coffee Shop and want to know the total drinks
            made <strong>per Barista</strong>? You don't want one giant number;
            you want separate numbers for our Baristas, Alice and Bob.
          </p>

          <p>
            Let's look at a raw, un-grouped <code>coffee_sales</code> table:
          </p>

          {/* Raw Table */}
          <div className="border border-zinc-800/50 rounded-xl overflow-hidden bg-zinc-900/20 shadow-lg">
            <div className="bg-zinc-950/80 px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50">
              Raw Table: coffee_sales
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-base">
                <thead className="bg-zinc-950/50 border-b border-zinc-800/50">
                  <tr>
                    <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight">
                      sale_id
                    </th>
                    <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight">
                      barista
                    </th>
                    <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight">
                      drink
                    </th>
                    <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight">
                      price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  <tr className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-base text-zinc-500">
                      101
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-zinc-300">
                      Alice
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-zinc-300">
                      Latte
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-emerald-400">
                      5
                    </td>
                  </tr>
                  <tr className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-base text-zinc-500">
                      102
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-zinc-300">
                      Bob
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-zinc-300">
                      Mocha
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-emerald-400">
                      6
                    </td>
                  </tr>
                  <tr className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-base text-zinc-500">
                      103
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-zinc-300">
                      Alice
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-zinc-300">
                      Espresso
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-emerald-400">
                      3
                    </td>
                  </tr>
                  <tr className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-base text-zinc-500">
                      104
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-zinc-300">
                      Bob
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-zinc-300">
                      Latte
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-emerald-400">
                      5
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="h-px bg-zinc-800/50 my-6"></div>

          {/* STEP 1 */}
          <h4 className="text-indigo-400 font-bold uppercase tracking-widest text-sm">
            Step 1: Divide into Groups
          </h4>
          <p>
            Because we want to find the number of drinks per barista, we know the end result must list the Baristas as well as the number of drinks per Barista. So the first
            step is to identify each of the different Baristas that we have
            using the 'Barista' column. We can see that we only have 'Alice' and
            'Bob' as our Baristas, but to do this in SQL we have to first do{' '}
            <code className="bg-zinc-950 border border-zinc-800 text-indigo-400 font-bold px-1.5 py-0.5 rounded font-mono text-base">
              SELECT Barista FROM Coffee_sales
            </code>{' '}
            and add at the end{' '}
            <code className="bg-zinc-950 border border-zinc-800 text-indigo-400 font-bold px-1.5 py-0.5 rounded font-mono text-base">
              GROUP BY Barista
            </code>
            . The{' '}
            <span className="text-indigo-400 font-bold font-mono">SELECT</span>{' '}
            and{' '}
            <span className="text-indigo-400 font-bold font-mono">FROM</span>{' '}
            tell SQL that we want to return the 'Barista' column, and the{' '}
            <span className="text-indigo-400 font-bold font-mono">
              GROUP BY
            </span>{' '}
            tells SQL that we want to form groups based on the 'Barista' column.
            This way we can use SQL to easily identify each of the different
            Baristas we have. Here is the code and the associated result:
          </p>
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 font-mono text-base shadow-inner flex flex-col gap-1">
            <div className="text-indigo-400 font-bold">
              SELECT <span className="text-amber-400 font-normal">Barista</span>
            </div>
            <div className="text-indigo-400 font-bold">
              FROM{' '}
              <span className="text-amber-400 font-normal">Coffee_sales</span>
            </div>
            <div className="text-indigo-400 font-bold">
              GROUP BY{' '}
              <span className="text-amber-400 font-normal">Barista</span>;
            </div>
          </div>

          <div className="border border-indigo-500/30 rounded-lg overflow-hidden bg-indigo-500/5 shadow-md w-1/2">
            <div className="bg-zinc-950/80 px-4 py-3 text-xs font-bold text-indigo-400 uppercase tracking-widest border-b border-indigo-500/20">
              Step 1 Result
            </div>
            <table className="w-full text-left text-base">
              <thead className="bg-zinc-950/50 border-b border-indigo-500/20">
                <tr>
                  <th className="px-4 py-3 font-mono font-bold text-indigo-400">
                    Barista
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-500/10">
                <tr>
                  <td className="px-4 py-3 font-mono text-zinc-300">Alice</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-zinc-300">Bob</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Notice that we returned the 'Barista' column, but it is grouped into
            categories, named 'Alice' and 'Bob,' which we wanted! Now that we
            have identified each Barista that we have, lets find the number of
            drinks they each sold.
          </p>

          <div className="h-px bg-zinc-800/50 my-6"></div>

          {/* STEP 2 */}
          <h4 className="text-emerald-400 font-bold uppercase tracking-widest text-sm">
            Step 2: Apply Math to the Groups
          </h4>
          <p>
            When asked to find the number of or how many of something exists, we
            know we can use the{' '}
            <span className="text-indigo-400 font-bold font-mono">COUNT</span>{' '}
            keyword. So we simply add this aggregate function to the code from
            step 1:{' '}
            <code className="bg-zinc-950 border border-zinc-800 text-emerald-400 font-bold px-1.5 py-0.5 rounded font-mono text-base">
              COUNT(Drink)
            </code>
            . SQL will automatically count the number of drinks for 'Alice' (2
            drinks) and 'Bob' (2 drinks) independently.
          </p>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 font-mono text-base shadow-inner flex flex-col gap-1">
            <div className="text-indigo-400 font-bold">
              SELECT <span className="text-amber-400 font-normal">Barista</span>
              <span className="text-zinc-500 font-bold">,</span>{' '}
              <span className="text-emerald-400 font-bold">COUNT</span>(
              <span className="text-amber-400 font-normal">Drink</span>)
            </div>
            <div className="text-indigo-400 font-bold">
              FROM{' '}
              <span className="text-amber-400 font-normal">Coffee_sales</span>
            </div>
            <div className="text-indigo-400 font-bold">
              GROUP BY{' '}
              <span className="text-amber-400 font-normal">Barista</span>;
            </div>
            <div className="text-zinc-500 italic mt-2">
              -- Note: You can apply other aggregations as well like SUM(),
              AVG(), etc!
            </div>
          </div>

          <div className="border border-emerald-500/30 rounded-lg overflow-hidden bg-emerald-500/5 shadow-md w-3/4">
            <div className="bg-black/60 px-4 py-3 text-xs font-bold text-emerald-500 uppercase tracking-widest border-b border-emerald-500/20">
              Final Output Result
            </div>
            <table className="w-full text-left text-base">
              <thead className="bg-black/40 border-b border-emerald-500/20">
                <tr>
                  <th className="px-4 py-3 font-mono font-bold text-emerald-400">
                    Barista
                  </th>
                  <th className="px-4 py-3 font-mono font-bold text-emerald-400">
                    COUNT(Drink)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-500/10">
                <tr>
                  <td className="px-4 py-3 font-mono font-bold text-white">
                    Alice
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                    2
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono font-bold text-white">
                    Bob
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                    2
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            And there we have it. Using the{' '}
            <span className="text-indigo-400 font-bold font-mono">
              GROUP BY
            </span>{' '}
            keyword in conjunction with{' '}
            <span className="text-indigo-400 font-bold font-mono">COUNT</span>,
            we were able to find the number of drinks each Barista sold!{' '}
          </p>

          {/* TIP SECTION */}
          <p className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-lg text-indigo-300 mt-8">
            <strong>Tip:</strong> Whenever you see the words{' '}
            <strong>'per', 'each', 'for each', or 'by'</strong> in a SQL
            problem, it means you have to use GROUP BY!
          </p>
        </div>
      </div>
      {/* --- END NEW GROUP BY INTRODUCTION --- */}

      {/* RENDER PART 2: GROUP BY */}
      {GROUP_BY_SECTIONS.map((section, sIdx) => (
        <div key={`gb-sec-${sIdx}`} className="mt-8">
          <div className="mb-8 border-l-4 border-indigo-500 pl-6">
            <h2 className="text-2xl font-black text-indigo-400 font-mono">
              {section.func}
            </h2>
            <p className="text-zinc-400 mt-2 text-lg">{section.desc}</p>

            <div className="mt-4 bg-zinc-950 border border-zinc-800 p-6 rounded-xl inline-flex flex-col gap-1 font-mono text-base shadow-inner">
              <div className="text-indigo-400 font-bold">
                SELECT{' '}
                <span className="text-amber-400 font-normal">category_col</span>
                <span className="text-zinc-500 font-bold">,</span>{' '}
                <span className="text-indigo-400 font-bold">
                  {section.func.split(' ')[3].replace('()', '')}
                </span>
                (<span className="text-amber-400 font-normal">data_col</span>)
              </div>
              <div className="text-indigo-400 font-bold">
                FROM{' '}
                <span className="text-amber-400 font-normal">table_name</span>
              </div>
              <div className="text-indigo-400 font-bold">
                GROUP BY{' '}
                <span className="text-amber-400 font-normal">category_col</span>
                ;
              </div>
            </div>

            <p className="text-base text-zinc-400 mt-4 italic flex items-center gap-2">
              <span className="text-indigo-500 font-black">↳</span>{' '}
              <strong>Returns:</strong> {section.returns}
            </p>
          </div>
          {section.steps.map((step) => {
            const currentIndex = globalStepIndex++;
            return (
              <InteractiveAggExample
                key={currentIndex}
                step={step}
                index={currentIndex}
                onPass={() => handleStepComplete(currentIndex)}
                isCompleted={completedSteps.has(currentIndex)}
              />
            );
          })}
        </div>
      ))}

      <div className="mt-12 flex flex-col items-center gap-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
        <h3 className="text-xl font-bold text-white">
          Massive Lesson Complete!
        </h3>
        <button
          onClick={() =>
            firstQuestId
              ? navigate(`/quest/${firstQuestId}`)
              : navigate('/home')
          }
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-12 rounded-xl transition-all flex justify-center items-center gap-3 shadow-[0_0_20px_rgba(79,70,229,0.3)] text-lg"
        >
          Enter the Arena: Start GROUP BY Quests ➔
        </button>
      </div>
    </div>
  );
};

// ==========================================
// MODULE 5: THE "LEFT JOIN" LESSON
// ==========================================
const JOIN_EXAMPLES = [
  {
    title: 'Customers and Food Orders',
    prompt:
      "Let's connect our customers to their food orders. Link the tables using the column they both share.",
    selectText: '*',
    leftTable: {
      name: 'customers',
      columns: ['customer_id', 'name'],
      data: [
        { customer_id: 1, name: 'Alice' },
        { customer_id: 2, name: 'Bob' },
        { customer_id: 3, name: 'Charlie' },
      ],
    },
    rightTable: {
      name: 'orders',
      columns: ['order_id', 'customer_id', 'food'],
      data: [
        { order_id: 101, customer_id: 1, food: 'Pizza' },
        { order_id: 102, customer_id: 3, food: 'Burger' },
      ],
    },
    expectedLeft: 'customer_id',
    expectedRight: 'customer_id',
    outputData: [
      { customer_id: 1, name: 'Alice', order_id: 101, food: 'Pizza' },
      { customer_id: 2, name: 'Bob', order_id: 'NULL', food: 'NULL' },
      { customer_id: 3, name: 'Charlie', order_id: 102, food: 'Burger' },
    ],
  },
  {
    title: 'Employees and Departments',
    prompt:
      'Connect the employees to their departments. New hires without a department will show up with blank values!',
    selectText: '*',
    leftTable: {
      name: 'employees',
      columns: ['emp_id', 'name'],
      data: [
        { emp_id: 1, name: 'Sarah' },
        { emp_id: 2, name: 'John' },
        { emp_id: 3, name: 'David' },
      ],
    },
    rightTable: {
      name: 'departments',
      columns: ['dept_id', 'emp_id', 'dept_name'],
      data: [
        { dept_id: 80, emp_id: 1, dept_name: 'Sales' },
        { dept_id: 81, emp_id: 3, dept_name: 'Engineering' },
      ],
    },
    expectedLeft: 'emp_id',
    expectedRight: 'emp_id',
    outputData: [
      { emp_id: 1, name: 'Sarah', dept_id: 80, dept_name: 'Sales' },
      { emp_id: 2, name: 'John', dept_id: 'NULL', dept_name: 'NULL' },
      { emp_id: 3, name: 'David', dept_id: 81, dept_name: 'Engineering' },
    ],
  },
  {
    title: 'Products and Reviews',
    prompt:
      'Link the products to their reviews. Products with no reviews will still appear on the list.',
    selectText: '*',
    leftTable: {
      name: 'products',
      columns: ['product_id', 'product_name'],
      data: [
        { product_id: 1, product_name: 'Laptop' },
        { product_id: 2, product_name: 'Monitor' },
        { product_id: 3, product_name: 'Keyboard' },
      ],
    },
    rightTable: {
      name: 'reviews',
      columns: ['review_id', 'product_id', 'rating'],
      data: [
        { review_id: 901, product_id: 1, rating: 5 },
        { review_id: 902, product_id: 3, rating: 4 },
      ],
    },
    expectedLeft: 'product_id',
    expectedRight: 'product_id',
    outputData: [
      { product_id: 1, product_name: 'Laptop', review_id: 901, rating: 5 },
      {
        product_id: 2,
        product_name: 'Monitor',
        review_id: 'NULL',
        rating: 'NULL',
      },
      { product_id: 3, product_name: 'Keyboard', review_id: 902, rating: 4 },
    ],
  },
  {
    title: 'Library Books (Specific Columns)',
    prompt:
      "Let's clean up our output. Instead of SELECT *, this query explicitly asks for just the book title and its due date. Link the tables to see the clean report!",
    selectText: 'books.title, checkouts.due_date',
    leftTable: {
      name: 'books',
      columns: ['book_id', 'title'],
      data: [
        { book_id: 1, title: 'Dune' },
        { book_id: 2, title: '1984' },
        { book_id: 3, title: 'Foundation' },
      ],
    },
    rightTable: {
      name: 'checkouts',
      columns: ['checkout_id', 'book_id', 'due_date'],
      data: [
        { checkout_id: 55, book_id: 1, due_date: 'Oct 12' },
        { checkout_id: 56, book_id: 3, due_date: 'Oct 15' },
      ],
    },
    expectedLeft: 'book_id',
    expectedRight: 'book_id',
    outputData: [
      { title: 'Dune', due_date: 'Oct 12' },
      { title: '1984', due_date: 'NULL' },
      { title: 'Foundation', due_date: 'Oct 15' },
    ],
  },
  {
    title: 'Clinic Schedule (Specific Columns)',
    prompt:
      "We just want the doctor's name and the patient they are seeing. No extra IDs! Build the bridge to generate the schedule.",
    selectText: 'doctors.doc_name, appointments.patient',
    leftTable: {
      name: 'doctors',
      columns: ['doc_id', 'doc_name'],
      data: [
        { doc_id: 1, doc_name: 'Dr. House' },
        { doc_id: 2, doc_name: 'Dr. Grey' },
        { doc_id: 3, doc_name: 'Dr. Carter' },
      ],
    },
    rightTable: {
      name: 'appointments',
      columns: ['appt_id', 'doc_id', 'patient'],
      data: [
        { appt_id: 88, doc_id: 2, patient: "O'Malley" },
        { appt_id: 89, doc_id: 3, patient: 'Benton' },
      ],
    },
    expectedLeft: 'doc_id',
    expectedRight: 'doc_id',
    outputData: [
      { doc_name: 'Dr. House', patient: 'NULL' },
      { doc_name: 'Dr. Grey', patient: "O'Malley" },
      { doc_name: 'Dr. Carter', patient: 'Benton' },
    ],
  },
  {
    title: 'IT Helpdesk (Specific Columns)',
    prompt:
      'We need a daily report of our IT support staff and the specific issue they are working on. Make sure agents with no active tickets still appear on the report so we know who is available!',
    selectText: 'agents.name, tickets.issue',
    leftTable: {
      name: 'agents',
      columns: ['agent_id', 'name'],
      data: [
        { agent_id: 1, name: 'Roy' },
        { agent_id: 2, name: 'Moss' },
        { agent_id: 3, name: 'Jen' },
      ],
    },
    rightTable: {
      name: 'tickets',
      columns: ['ticket_id', 'agent_id', 'issue'],
      data: [
        { ticket_id: 404, agent_id: 1, issue: 'Server down' },
        { ticket_id: 405, agent_id: 3, issue: 'Locked out' },
      ],
    },
    expectedLeft: 'agent_id',
    expectedRight: 'agent_id',
    outputData: [
      { name: 'Roy', issue: 'Server down' },
      { name: 'Moss', issue: 'NULL' },
      { name: 'Jen', issue: 'Locked out' },
    ],
  },
];

const InteractiveJoinExample = ({
  step,
  index,
  onPass,
  isCompleted,
}: {
  step: (typeof JOIN_EXAMPLES)[0];
  index: number;
  onPass: () => void;
  isCompleted: boolean;
}) => {
  const [leftCol, setLeftCol] = useState('');
  const [rightCol, setRightCol] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>(
    'idle',
  );

  const handleSubmit = () => {
    if (leftCol === step.expectedLeft && rightCol === step.expectedRight) {
      setFeedback('correct');
      onPass();
    } else {
      setFeedback('wrong');
    }
  };

  return (
    <div className="w-full flex flex-col xl:flex-row gap-8 mb-12">
      <div className="w-full xl:w-1/3 flex flex-col gap-6">
        <div
          className={`bg-zinc-900/40 backdrop-blur-xl border ${isCompleted ? 'border-emerald-500/50' : 'border-zinc-800/50'} rounded-2xl p-6 md:p-8 shadow-2xl transition-all`}
        >
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
            <span
              className={`${isCompleted ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'} w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black transition-colors shadow-lg`}
            >
              {isCompleted ? '✓' : index + 1}
            </span>
            {step.title}
          </h2>
          <p className="text-zinc-400 mb-6 text-lg leading-relaxed">
            {step.prompt}
          </p>

          <div className="flex flex-col gap-5">
            {/* RAW LEFT TABLE */}
            <div className="border border-zinc-800/50 rounded-lg overflow-hidden bg-zinc-900/20 shadow-md">
              <div className="bg-zinc-950/80 px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50">
                Left: {step.leftTable.name}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-base">
                  <thead className="bg-zinc-950/50 border-b border-zinc-800/50">
                    <tr>
                      {step.leftTable.columns.map((c) => (
                        <th
                          key={c}
                          className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic"
                        >
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y divide-zinc-800/50 transition-opacity duration-700 ${feedback === 'correct' ? 'opacity-20' : 'opacity-100'}`}
                  >
                    {step.leftTable.data.map((row, i) => (
                      <tr
                        key={i}
                        className="hover:bg-zinc-800/30 transition-colors"
                      >
                        {step.leftTable.columns.map((c) => (
                          <td
                            key={c}
                            className="px-4 py-3 font-mono text-base text-zinc-300"
                          >
                            {String(row[c as keyof typeof row])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-center -my-2 z-10">
              <div className="bg-zinc-800 border border-zinc-700 text-indigo-400 rounded-full w-8 h-8 flex items-center justify-center font-black shadow-xl">
                ↓
              </div>
            </div>

            {/* RAW RIGHT TABLE */}
            <div className="border border-zinc-800/50 rounded-lg overflow-hidden bg-zinc-900/20 shadow-md">
              <div className="bg-zinc-950/80 px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50">
                Right: {step.rightTable.name}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-base">
                  <thead className="bg-zinc-950/50 border-b border-zinc-800/50">
                    <tr>
                      {step.rightTable.columns.map((c) => (
                        <th
                          key={c}
                          className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic"
                        >
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y divide-zinc-800/50 transition-opacity duration-700 ${feedback === 'correct' ? 'opacity-20' : 'opacity-100'}`}
                  >
                    {step.rightTable.data.map((row, i) => (
                      <tr
                        key={i}
                        className="hover:bg-zinc-800/30 transition-colors"
                      >
                        {step.rightTable.columns.map((c) => (
                          <td
                            key={c}
                            className="px-4 py-3 font-mono text-base text-zinc-300"
                          >
                            {String(row[c as keyof typeof row])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* DYNAMIC OUTPUT */}
        {feedback === 'correct' && (
          <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-4 animate-in fade-in slide-in-from-top-4">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">
              SQL Output Result
            </h3>
            <div className="border border-zinc-800/50 rounded-lg overflow-hidden bg-black/40 shadow-inner">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-base">
                  <thead className="bg-black/60 border-b border-emerald-500/20">
                    <tr>
                      {Object.keys(step.outputData[0]).map((col) => (
                        <th
                          key={col}
                          className="px-4 py-3 font-mono font-bold text-emerald-400 uppercase tracking-tight whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-500/10">
                    {step.outputData.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val, j) => (
                          <td
                            key={j}
                            className={`px-4 py-3 font-mono text-base font-bold whitespace-nowrap ${val === 'NULL' ? 'text-zinc-600 italic' : 'text-zinc-200'}`}
                          >
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🌟 RIGHT COLUMN: Expanded Editor 🌟 */}
      <div className="w-full xl:w-2/3 flex flex-col">
        <div
          className={`bg-zinc-900/40 backdrop-blur-xl border-2 rounded-2xl overflow-hidden flex flex-col h-full shadow-2xl transition-colors duration-300 ${feedback === 'correct' ? 'border-emerald-500' : feedback === 'wrong' ? 'border-red-500' : 'border-zinc-800/50'}`}
        >
          <div className="bg-zinc-950/80 px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              Query Builder
            </span>
          </div>

          <div className="p-8 flex-1 bg-zinc-950/40 font-mono text-base flex flex-col justify-center gap-6">
            <div>
              <span className="text-indigo-400 font-bold">SELECT</span>{' '}
              <span className="text-white font-normal">{step.selectText}</span>
            </div>

            <div>
              <span className="text-indigo-400 font-bold">FROM</span>{' '}
              <span className="text-amber-400 font-normal">
                {step.leftTable.name}
              </span>
            </div>

            <div>
              <span className="text-indigo-400 font-bold">LEFT JOIN</span>{' '}
              <span className="text-amber-400 font-normal">
                {step.rightTable.name}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-2 bg-zinc-900 border border-zinc-800/50 p-6 rounded-xl shadow-inner">
              <span className="text-indigo-400 font-bold">ON</span>
              <span className="text-amber-400 font-mono">
                {step.leftTable.name}.
              </span>
              <select
                value={leftCol}
                onChange={(e) => {
                  setLeftCol(e.target.value);
                  setFeedback('idle');
                }}
                className="bg-zinc-950 border border-zinc-800 text-indigo-400 font-bold rounded-md px-3 py-1.5 outline-none cursor-pointer focus:border-indigo-500 transition-colors text-base"
              >
                <option value="" disabled>
                  column
                </option>
                {step.leftTable.columns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <span className="text-pink-400 font-black">=</span>
              <span className="text-amber-400 font-mono">
                {step.rightTable.name}.
              </span>
              <select
                value={rightCol}
                onChange={(e) => {
                  setRightCol(e.target.value);
                  setFeedback('idle');
                }}
                className="bg-zinc-950 border border-zinc-800 text-indigo-400 font-bold rounded-md px-3 py-1.5 outline-none cursor-pointer focus:border-indigo-500 transition-colors text-base"
              >
                <option value="" disabled>
                  column
                </option>
                {step.rightTable.columns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-6 border-t border-zinc-800 bg-zinc-950/80">
            {feedback === 'idle' && (
              <button
                onClick={handleSubmit}
                disabled={!leftCol || !rightCol}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white font-bold py-4 rounded-xl transition-all text-lg"
              >
                Execute Join
              </button>
            )}
            {feedback === 'wrong' && (
              <div className="flex flex-col gap-4">
                <div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/30 text-center font-bold text-lg">
                  Incorrect link. Find the column they share!
                </div>
                <button
                  onClick={() => setFeedback('idle')}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl transition-all text-lg"
                >
                  Try Again
                </button>
              </div>
            )}
            {feedback === 'correct' && (
              <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-lg border border-emerald-500/30 text-center font-bold text-lg">
                Link Established! Notice the empty values showing up as NULL.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const LeftJoinLesson: React.FC<LessonModuleProps> = ({
  
  onComplete,
  navigate,
}) => {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [firstQuestId, setFirstQuestId]=useState("")
  useEffect(() => {
  const fetchFirstQuest = async () => {
    // 1. Ask Supabase for the ID of the first quest in this category
    const { data, error } = await supabase
      .from('quests')
      .select('id')
      .ilike('title', 'Active Subscriptions') // Use ilike for case-insensitive matching
      .limit(1)
      .single();

    if (error) {
      console.error('Could not find first quest:', error);
      return;
    }

    // 2. Save that ID to state!
    if (data) {
      setFirstQuestId(data.id);
    }
  };

  fetchFirstQuest();
}, []);
  const handleStepComplete = (index: number) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);
      if (newSet.size === JOIN_EXAMPLES.length) onComplete();
      return newSet;
    });
  };

  return (
    <div className="w-full flex flex-col gap-12 pb-32">
      {/* HEADER SECTION */}
      <div className="max-w-3xl">
        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
          Interactive Lesson
        </span>
        <h1 className="text-4xl font-black text-white mt-2 mb-6">
          Combining Tables:{' '}
          <span className="text-indigo-400 font-bold">LEFT JOIN</span>
        </h1>
      </div>

      {/* DESCRIPTION WITH INLINE VISUAL TABLES */}
      <div className="max-w-5xl bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 md:p-8 shadow-2xl">
        <div className="text-zinc-300 leading-relaxed space-y-5 text-lg">
          <p>
            Welcome to the real world of databases! So far, all your data has
            lived in one single table. But to keep things organized, real
            databases split data up into many different tables. To combine them
            back together, we use a{' '}
            <code className="bg-zinc-950 border border-zinc-800 text-indigo-400 font-bold px-2 py-0.5 rounded font-mono text-base">
              JOIN
            </code>
            .
          </p>

          <p>
            Let's think about it this way. Let's say we have Table A that lists
            all customers, and Table B that lists food orders that some
            customers made.
          </p>

          {/* 🌟 THE VISUAL TABLES 🌟 */}
          <div className="flex flex-col sm:flex-row gap-6 my-10 items-center justify-center bg-zinc-950/50 p-6 rounded-xl border border-zinc-800/50 shadow-inner">
            {/* Table A: Customers */}
            <div className="border border-zinc-800/50 rounded-lg overflow-hidden bg-zinc-900/20 shadow-md w-full sm:w-1/2">
              <div className="bg-zinc-950/80 px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50">
                Table A: Customers
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-base">
                  <thead className="bg-zinc-950/50 border-b border-zinc-800/50">
                    <tr>
                      <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap">
                        customer_id
                      </th>
                      <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap">
                        name
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    <tr className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-base text-amber-400 bg-amber-500/5">
                        1
                      </td>
                      <td className="px-4 py-3 font-mono text-base text-zinc-300">
                        Alice
                      </td>
                    </tr>
                    <tr className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-base text-amber-400 bg-amber-500/5">
                        2
                      </td>
                      <td className="px-4 py-3 font-mono text-base text-zinc-300">
                        Bob
                      </td>
                    </tr>
                    <tr className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-base text-amber-400 bg-amber-500/5">
                        3
                      </td>
                      <td className="px-4 py-3 font-mono text-base text-zinc-300">
                        Charlie
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Connection Indicator */}
            <div className="hidden sm:flex text-zinc-600 font-black text-2xl">
              ➕
            </div>

            {/* Table B: Orders */}
            <div className="border border-zinc-800/50 rounded-lg overflow-hidden bg-zinc-900/20 shadow-md w-full sm:w-1/2">
              <div className="bg-zinc-950/80 px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50">
                Table B: Orders
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-base">
                  <thead className="bg-zinc-950/50 border-b border-zinc-800/50">
                    <tr>
                      <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap">
                        order_id
                      </th>
                      <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap">
                        customer_id
                      </th>
                      <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap">
                        food
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    <tr className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-base text-zinc-400">
                        101
                      </td>
                      <td className="px-4 py-3 font-mono text-base text-amber-400 bg-amber-500/5">
                        1
                      </td>
                      <td className="px-4 py-3 font-mono text-base text-zinc-300">
                        Pizza
                      </td>
                    </tr>
                    <tr className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-base text-zinc-400">
                        102
                      </td>
                      <td className="px-4 py-3 font-mono text-base text-amber-400 bg-amber-500/5">
                        3
                      </td>
                      <td className="px-4 py-3 font-mono text-base text-zinc-300">
                        Burger
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <p>
            If we want a master list of <em>all</em> our customers, alongside
            what they ordered (even if they didn't order anything), we use a{' '}
            <code className="bg-zinc-950 border border-zinc-800 text-indigo-400 font-bold px-2 py-0.5 rounded font-mono text-base">
              LEFT JOIN
            </code>
            .
          </p>

          <p>
            After using a{' '}
            <code className="bg-zinc-950 border border-zinc-800 text-indigo-400 font-bold px-2 py-0.5 rounded font-mono text-base">
              LEFT JOIN
            </code>
            , all the columns of Table A get shown no matter what. If a customer
            ordered food, SQL attaches the order details to their name. If a
            customer hasn't ordered anything yet (like Bob!), SQL doesn't delete
            them from the list! It simply keeps their name and leaves the food
            order columns completely blank or empty.
          </p>

          <h3 className="text-2xl font-bold text-white mt-12 mb-4">
            The <span className="text-indigo-400 font-mono">ON</span> Clause
            (Finding the Connection)
          </h3>

          <p>
            If you just tell SQL to "join" two tables together, it will panic
            because it doesn't know which food order belongs to which customer.
          </p>

          <p>
            To connect two tables, you have to find the column name they have
            the same. Looking at the tables above, you can see that both tables
            share a{' '}
            <code className="bg-zinc-950 border border-zinc-800 text-amber-400 px-2 py-0.5 rounded font-mono text-base">
              customer_id
            </code>{' '}
            column.
          </p>

          <p>
            The{' '}
            <code className="bg-zinc-950 border border-zinc-800 text-indigo-400 font-bold px-2 py-0.5 rounded font-mono text-base">
              ON
            </code>{' '}
            clause is your bridge. You are essentially telling the database:
          </p>

          <p className="bg-zinc-950/50 border border-zinc-800/50 p-6 border-l-4 border-l-indigo-500 italic text-zinc-400 rounded-r-xl shadow-inner my-6">
            "Attach the food order to the customer{' '}
            <strong className="text-indigo-400 font-bold">ON</strong> the
            condition that the{' '}
            <code className="bg-zinc-900 border border-zinc-800 text-amber-400 px-1 py-0.5 rounded font-mono text-base">
              customer_id
            </code>{' '}
            in Table A perfectly matches the{' '}
            <code className="bg-zinc-900 border border-zinc-800 text-amber-400 px-1 py-0.5 rounded font-mono text-base">
              customer_id
            </code>{' '}
            in Table B."
          </p>

          {/* --- NEW SECTION STARTS HERE --- */}
          <h3 className="text-2xl font-bold text-white mt-12 mb-4">
            Putting It All Together
          </h3>

          <p>
            So, if we want to get a master list of all customers, showing what
            they ordered while <em>still including</em> those who haven't
            ordered anything at all, we put all the pieces together like this:
          </p>

          {/* SQL Code Block 1 (Unified Styling) */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 my-8 font-mono text-base shadow-inner">
            <div className="text-indigo-400 font-bold">
              SELECT <span className="text-white font-normal">*</span>
            </div>
            <div className="text-indigo-400 font-bold">
              FROM <span className="text-white font-normal">customers</span>
            </div>
            <div className="text-indigo-400 font-bold">
              LEFT JOIN <span className="text-white font-normal">orders</span>
            </div>
            <div className="text-indigo-400 font-bold mt-2">
              ON{' '}
              <span className="text-white font-normal">
                customers.customer_id{' '}
                <span className="text-pink-400 font-bold">=</span>{' '}
                orders.customer_id
              </span>
            </div>
          </div>

          <p>
            <strong>Notice how we write the ON clause!</strong> Both tables have
            a column called{' '}
            <code className="bg-zinc-950 border border-zinc-800 text-amber-400 px-2 py-0.5 rounded font-mono text-base">
              customer_id
            </code>{' '}
            so we join the tables on this column. Because both tables happen to
            have a column called{' '}
            <code className="bg-zinc-950 border border-zinc-800 text-amber-400 px-2 py-0.5 rounded font-mono text-base">
              customer_id
            </code>
            , SQL might get confused about which one we mean. To be safe, we
            write{' '}
            <code className="bg-zinc-950 border border-zinc-800 text-amber-400 px-2 py-0.5 rounded font-mono text-base">
              TableName.column_name
            </code>{' '}
            so the database knows exactly which column belongs to which table.
          </p>

          <h4 className="text-xl font-bold text-white mt-12 mb-4">
            The Final Result of the Above Query:
          </h4>

          {/* Result Table */}
          <div className="border border-zinc-800/50 rounded-lg overflow-hidden bg-black/40 shadow-xl mb-6">
            <div className="bg-zinc-950/80 px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800/50 flex justify-between items-center">
              <span>Query Result</span>
              <span className="bg-indigo-500/20 px-2 py-1 rounded text-indigo-300">
                3 Rows Returned
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-base">
                <thead>
                  {/* 🌟 TOP HEADER: Perfectly Matches Original Table Styling 🌟 */}
                  <tr>
                    <th
                      colSpan={2}
                      className="bg-zinc-950/80 text-zinc-300 text-center text-xs font-bold px-4 py-2 uppercase tracking-widest border-b border-r border-zinc-800/50"
                    >
                      Table A: Customers
                    </th>
                    <th
                      colSpan={3}
                      className="bg-zinc-950/80 text-zinc-300 text-center text-xs font-bold px-4 py-2 uppercase tracking-widest border-b border-zinc-800/50"
                    >
                      Table B: Orders
                    </th>
                  </tr>

                  {/* 🌟 BOTTOM HEADER: Matches Original Colors Exactly 🌟 */}
                  <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                    <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap">
                      customer_id
                    </th>
                    <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap border-r border-zinc-800/50">
                      name
                    </th>

                    <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap">
                      order_id
                    </th>
                    <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap">
                      customer_id
                    </th>
                    <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap">
                      food
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {/* Row 1 */}
                  <tr className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-base text-white">
                      1
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-white border-r border-zinc-800/50">
                      Alice
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-white">
                      101
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-white">
                      1
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-white">
                      Pizza
                    </td>
                  </tr>

                  {/* Row 2: The important LEFT JOIN row (Bob) */}
                  <tr className="bg-zinc-900/30 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-base text-white">
                      2
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-white border-r border-zinc-800/50">
                      Bob
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-zinc-600 italic">
                      NULL
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-zinc-600 italic">
                      NULL
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-zinc-600 italic">
                      NULL
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-base text-white">
                      3
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-white border-r border-zinc-800/50">
                      Charlie
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-white">
                      102
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-white">
                      3
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-white">
                      Burger
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <p className="text-base text-zinc-400 text-left">
              Notice how all the columns of the customers table gets shown
              because that's Table A in our example. For the customers who
              haven't ordered anything, it shows NULL for the Table B portion.
              Let's take a look at Bob! Because he didn't have any orders, SQL
              filled the missing order information with empty
              <code className="text-zinc-500 italic bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded font-mono mx-1">
                NULL
              </code>{' '}
              values.
            </p>

            <p className="text-base text-zinc-400 text-left pt-2">
              Also after left joining the customers and orders tables, we see
              that Alice ordered Pizza and Charlie ordered Burger!
            </p>
          </div>
          {/* --- NEW SECTION ENDS HERE --- */}
        </div>
      </div>

      {/* SYNTAX BLOCK */}
      <div className="max-w-4xl mt-4">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
          Syntax Example
        </h3>
        {/* SQL Code Block 2 (Unified Styling) */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 font-mono text-base shadow-inner flex flex-col gap-6">
          {/* Example 1: Select All */}
          <div>
            <div className="text-zinc-500 italic mb-1">
              -- Select all columns
            </div>
            <div className="text-indigo-400 font-bold">
              SELECT <span className="text-white font-normal">*</span>
            </div>
            <div className="text-indigo-400 font-bold">
              FROM <span className="text-amber-400 font-normal">table_A</span>
            </div>
            <div className="text-indigo-400 font-bold">
              LEFT JOIN{' '}
              <span className="text-amber-400 font-normal">table_B</span>
            </div>
            <div className="text-indigo-400 font-bold">
              ON{' '}
              <span className="text-amber-400 font-normal">
                table_A.column_name
              </span>{' '}
              <span className="text-pink-400 font-bold">=</span>{' '}
              <span className="text-amber-400 font-normal">
                table_B.column_name
              </span>
              ;
            </div>
          </div>

          {/* Example 2: Select Specific Columns */}
          <div>
            <div className="text-zinc-500 italic mb-1">
              -- Select specific columns
            </div>
            <div className="text-indigo-400 font-bold">
              SELECT{' '}
              <span className="text-amber-400 font-normal">
                table_A.column1
              </span>
              <span className="text-zinc-500 font-bold">, </span>
              <span className="text-amber-400 font-normal">
                table_B.column2
              </span>
            </div>
            <div className="text-indigo-400 font-bold">
              FROM <span className="text-amber-400 font-normal">table_A</span>
            </div>
            <div className="text-indigo-400 font-bold">
              LEFT JOIN{' '}
              <span className="text-amber-400 font-normal">table_B</span>
            </div>
            <div className="text-indigo-400 font-bold">
              ON{' '}
              <span className="text-amber-400 font-normal">
                table_A.column_name
              </span>{' '}
              <span className="text-pink-400 font-bold">=</span>{' '}
              <span className="text-amber-400 font-normal">
                table_B.column_name
              </span>
              ;
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE EXAMPLES */}
      <div className="mt-12">
        <h2 className="text-3xl font-black text-white mb-8">Examples</h2>
        {JOIN_EXAMPLES.map((step, idx) => (
          <InteractiveJoinExample
            key={idx}
            step={step}
            index={idx}
            onPass={() => handleStepComplete(idx)}
            isCompleted={completedSteps.has(idx)}
          />
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center gap-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
        <h3 className="text-xl font-bold text-white">
          Ready to connect the dots?
        </h3>
        <button
          onClick={() =>
            firstQuestId
              ? navigate(`/quest/${firstQuestId}`)
              : navigate('/home')
          }
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-12 rounded-xl transition-all flex justify-center items-center gap-3 shadow-[0_0_20px_rgba(79,70,229,0.3)] text-lg"
        >
          Start LEFT JOIN Quests ➔
        </button>
      </div>
    </div>
  );
};

// ==========================================
// MODULE 6: THE "INNER JOIN" LESSON
// ==========================================
const INNER_JOIN_EXAMPLES = [
  {
    title: 'Customers and Food Orders',
    prompt:
      "Let's connect our customers to their food orders. This time, use an INNER JOIN. Notice what happens to customers who haven't ordered anything!",
    selectText: '*',
    leftTable: {
      name: 'customers',
      columns: ['customer_id', 'name'],
      data: [
        { customer_id: 1, name: 'Alice' },
        { customer_id: 2, name: 'Bob' },
        { customer_id: 3, name: 'Charlie' },
      ],
    },
    rightTable: {
      name: 'orders',
      columns: ['order_id', 'customer_id', 'food'],
      data: [
        { order_id: 101, customer_id: 1, food: 'Pizza' },
        { order_id: 102, customer_id: 3, food: 'Burger' },
      ],
    },
    expectedLeft: 'customer_id',
    expectedRight: 'customer_id',
    outputData: [
      { customer_id: 1, name: 'Alice', order_id: 101, food: 'Pizza' },
      { customer_id: 3, name: 'Charlie', order_id: 102, food: 'Burger' },
    ],
  },
  {
    title: 'Employees and Departments',
    prompt:
      'Connect the employees to their departments. With an INNER JOIN, only new hires with a department will be shown.',
    selectText: '*',
    leftTable: {
      name: 'employees',
      columns: ['emp_id', 'name'],
      data: [
        { emp_id: 1, name: 'Sarah' },
        { emp_id: 2, name: 'John' },
        { emp_id: 3, name: 'David' },
      ],
    },
    rightTable: {
      name: 'departments',
      columns: ['dept_id', 'emp_id', 'dept_name'],
      data: [
        { dept_id: 80, emp_id: 1, dept_name: 'Sales' },
        { dept_id: 81, emp_id: 3, dept_name: 'Engineering' },
      ],
    },
    expectedLeft: 'emp_id',
    expectedRight: 'emp_id',
    outputData: [
      { emp_id: 1, name: 'Sarah', dept_id: 80, dept_name: 'Sales' },
      { emp_id: 3, name: 'David', dept_id: 81, dept_name: 'Engineering' },
    ],
  },
  {
    title: 'Products and Reviews',
    prompt:
      'Link the products to their reviews. Products with no reviews will be destroyed from the output.',
    selectText: '*',
    leftTable: {
      name: 'products',
      columns: ['product_id', 'product_name'],
      data: [
        { product_id: 1, product_name: 'Laptop' },
        { product_id: 2, product_name: 'Monitor' },
        { product_id: 3, product_name: 'Keyboard' },
      ],
    },
    rightTable: {
      name: 'reviews',
      columns: ['review_id', 'product_id', 'rating'],
      data: [
        { review_id: 901, product_id: 1, rating: 5 },
        { review_id: 902, product_id: 3, rating: 4 },
      ],
    },
    expectedLeft: 'product_id',
    expectedRight: 'product_id',
    outputData: [
      { product_id: 1, product_name: 'Laptop', review_id: 901, rating: 5 },
      { product_id: 3, product_name: 'Keyboard', review_id: 902, rating: 4 },
    ],
  },
  {
    title: 'Library Books (Specific Columns)',
    prompt:
      "Instead of SELECT *, let's just get the book title and its due date using an INNER JOIN. Books that don't have a checkout disappear!",
    selectText: 'books.title, checkouts.due_date',
    leftTable: {
      name: 'books',
      columns: ['book_id', 'title'],
      data: [
        { book_id: 1, title: 'Dune' },
        { book_id: 2, title: '1984' },
        { book_id: 3, title: 'Foundation' },
      ],
    },
    rightTable: {
      name: 'checkouts',
      columns: ['checkout_id', 'book_id', 'due_date'],
      data: [
        { checkout_id: 55, book_id: 1, due_date: 'Oct 12' },
        { checkout_id: 56, book_id: 3, due_date: 'Oct 15' },
      ],
    },
    expectedLeft: 'book_id',
    expectedRight: 'book_id',
    outputData: [
      { title: 'Dune', due_date: 'Oct 12' },
      { title: 'Foundation', due_date: 'Oct 15' },
    ],
  },
  {
    title: 'Clinic Schedule (Specific Columns)',
    prompt:
      "We just want the doctor's name and the patient they are seeing. Doctors with empty schedules should not be on this report.",
    selectText: 'doctors.doc_name, appointments.patient',
    leftTable: {
      name: 'doctors',
      columns: ['doc_id', 'doc_name'],
      data: [
        { doc_id: 1, doc_name: 'Dr. House' },
        { doc_id: 2, doc_name: 'Dr. Grey' },
        { doc_id: 3, doc_name: 'Dr. Carter' },
      ],
    },
    rightTable: {
      name: 'appointments',
      columns: ['appt_id', 'doc_id', 'patient'],
      data: [
        { appt_id: 88, doc_id: 2, patient: "O'Malley" },
        { appt_id: 89, doc_id: 3, patient: 'Benton' },
      ],
    },
    expectedLeft: 'doc_id',
    expectedRight: 'doc_id',
    outputData: [
      { doc_name: 'Dr. Grey', patient: "O'Malley" },
      { doc_name: 'Dr. Carter', patient: 'Benton' },
    ],
  },
  {
    title: 'IT Helpdesk (Specific Columns)',
    prompt:
      "We need a list of IT support staff and their active issues. Use an INNER JOIN so agents without tickets don't clutter the active work report.",
    selectText: 'agents.name, tickets.issue',
    leftTable: {
      name: 'agents',
      columns: ['agent_id', 'name'],
      data: [
        { agent_id: 1, name: 'Roy' },
        { agent_id: 2, name: 'Moss' },
        { agent_id: 3, name: 'Jen' },
      ],
    },
    rightTable: {
      name: 'tickets',
      columns: ['ticket_id', 'agent_id', 'issue'],
      data: [
        { ticket_id: 404, agent_id: 1, issue: 'Server down' },
        { ticket_id: 405, agent_id: 3, issue: 'Locked out' },
      ],
    },
    expectedLeft: 'agent_id',
    expectedRight: 'agent_id',
    outputData: [
      { name: 'Roy', issue: 'Server down' },
      { name: 'Jen', issue: 'Locked out' },
    ],
  },
];

const InteractiveInnerJoinExample = ({
  step,
  index,
  onPass,
  isCompleted,
}: {
  step: (typeof INNER_JOIN_EXAMPLES)[0];
  index: number;
  onPass: () => void;
  isCompleted: boolean;
}) => {
  const [leftCol, setLeftCol] = useState('');
  const [rightCol, setRightCol] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'wrong' | 'correct'>(
    'idle',
  );

  const handleSubmit = () => {
    if (leftCol === step.expectedLeft && rightCol === step.expectedRight) {
      setFeedback('correct');
      onPass();
    } else {
      setFeedback('wrong');
    }
  };

  return (
    <div className="w-full flex flex-col xl:flex-row gap-8 mb-12">
      <div className="w-full xl:w-1/3 flex flex-col gap-6">
        <div
          className={`bg-zinc-900/40 backdrop-blur-xl border ${isCompleted ? 'border-emerald-500/50' : 'border-zinc-800/50'} rounded-2xl p-6 md:p-8 shadow-2xl transition-all`}
        >
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
            <span
              className={`${isCompleted ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'} w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black transition-colors shadow-lg`}
            >
              {isCompleted ? '✓' : index + 1}
            </span>
            {step.title}
          </h2>
          <p className="text-zinc-400 mb-6 text-lg leading-relaxed">
            {step.prompt}
          </p>

          <div className="flex flex-col gap-5">
            {/* RAW LEFT TABLE */}
            <div className="border border-zinc-800/50 rounded-lg overflow-hidden bg-zinc-900/20 shadow-md">
              <div className="bg-zinc-950/80 px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50">
                Left: {step.leftTable.name}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-base">
                  <thead className="bg-zinc-950/50 border-b border-zinc-800/50">
                    <tr>
                      {step.leftTable.columns.map((c) => (
                        <th
                          key={c}
                          className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap"
                        >
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y divide-zinc-800/50 transition-opacity duration-700 ${feedback === 'correct' ? 'opacity-20' : 'opacity-100'}`}
                  >
                    {step.leftTable.data.map((row, i) => (
                      <tr
                        key={i}
                        className="hover:bg-zinc-800/30 transition-colors"
                      >
                        {step.leftTable.columns.map((c) => (
                          <td
                            key={c}
                            className="px-4 py-3 font-mono text-base text-zinc-300"
                          >
                            {String(row[c as keyof typeof row])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-center -my-2 z-10">
              <div className="bg-zinc-800 border border-zinc-700 text-indigo-400 rounded-full w-8 h-8 flex items-center justify-center font-black shadow-xl">
                ↓
              </div>
            </div>

            {/* RAW RIGHT TABLE */}
            <div className="border border-zinc-800/50 rounded-lg overflow-hidden bg-zinc-900/20 shadow-md">
              <div className="bg-zinc-950/80 px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50">
                Right: {step.rightTable.name}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-base">
                  <thead className="bg-zinc-950/50 border-b border-zinc-800/50">
                    <tr>
                      {step.rightTable.columns.map((c) => (
                        <th
                          key={c}
                          className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap"
                        >
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y divide-zinc-800/50 transition-opacity duration-700 ${feedback === 'correct' ? 'opacity-20' : 'opacity-100'}`}
                  >
                    {step.rightTable.data.map((row, i) => (
                      <tr
                        key={i}
                        className="hover:bg-zinc-800/30 transition-colors"
                      >
                        {step.rightTable.columns.map((c) => (
                          <td
                            key={c}
                            className="px-4 py-3 font-mono text-base text-zinc-300"
                          >
                            {String(row[c as keyof typeof row])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* DYNAMIC OUTPUT */}
        {feedback === 'correct' && (
          <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-4 animate-in fade-in slide-in-from-top-4">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3">
              SQL Output Result
            </h3>
            <div className="border border-zinc-800/50 rounded-lg overflow-hidden bg-black/40 shadow-inner">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-base">
                  <thead className="bg-black/60 border-b border-emerald-500/20">
                    <tr>
                      {Object.keys(step.outputData[0]).map((col) => (
                        <th
                          key={col}
                          className="px-4 py-3 font-mono font-bold text-emerald-400 uppercase tracking-tight whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-500/10">
                    {step.outputData.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val, j) => (
                          <td
                            key={j}
                            className={`px-4 py-3 font-mono text-base font-bold whitespace-nowrap ${val === 'NULL' ? 'text-zinc-600 italic' : 'text-zinc-200'}`}
                          >
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🌟 RIGHT COLUMN: Expanded Editor 🌟 */}
      <div className="w-full xl:w-2/3 flex flex-col">
        <div
          className={`bg-zinc-900/40 backdrop-blur-xl border-2 rounded-2xl overflow-hidden flex flex-col h-full shadow-2xl transition-colors duration-300 ${feedback === 'correct' ? 'border-emerald-500' : feedback === 'wrong' ? 'border-red-500' : 'border-zinc-800/50'}`}
        >
          <div className="bg-zinc-950/80 px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              Query Builder
            </span>
          </div>

          <div className="p-8 flex-1 bg-zinc-950/40 font-mono text-base flex flex-col justify-center gap-6">
            <div className="text-indigo-400 font-bold">
              SELECT{' '}
              <span className="text-white font-normal">{step.selectText}</span>
            </div>

            <div className="text-indigo-400 font-bold">
              FROM{' '}
              <span className="text-amber-400 font-normal">
                {step.leftTable.name}
              </span>
            </div>
            <div className="text-indigo-400 font-bold">
              INNER JOIN{' '}
              <span className="text-amber-400 font-normal">
                {step.rightTable.name}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-2 bg-zinc-900 border border-zinc-800/50 p-6 rounded-xl shadow-inner">
              <span className="text-indigo-400 font-bold">ON</span>
              <span className="text-amber-400 font-mono">
                {step.leftTable.name}.
              </span>
              <select
                value={leftCol}
                onChange={(e) => {
                  setLeftCol(e.target.value);
                  setFeedback('idle');
                }}
                className="bg-zinc-950 border border-zinc-800 text-indigo-400 font-bold rounded-md px-3 py-1.5 outline-none cursor-pointer focus:border-indigo-500 transition-colors text-base"
              >
                <option value="" disabled>
                  column
                </option>
                {step.leftTable.columns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <span className="text-pink-400 font-black">=</span>
              <span className="text-amber-400 font-mono">
                {step.rightTable.name}.
              </span>
              <select
                value={rightCol}
                onChange={(e) => {
                  setRightCol(e.target.value);
                  setFeedback('idle');
                }}
                className="bg-zinc-950 border border-zinc-800 text-indigo-400 font-bold rounded-md px-3 py-1.5 outline-none cursor-pointer focus:border-indigo-500 transition-colors text-base"
              >
                <option value="" disabled>
                  column
                </option>
                {step.rightTable.columns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-6 border-t border-zinc-800 bg-zinc-950/80">
            {feedback === 'idle' && (
              <button
                onClick={handleSubmit}
                disabled={!leftCol || !rightCol}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white font-bold py-4 rounded-xl transition-all text-lg"
              >
                Execute Join
              </button>
            )}
            {feedback === 'wrong' && (
              <div className="flex flex-col gap-4">
                <div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/30 text-center font-bold text-lg">
                  Incorrect link. Find the column they share!
                </div>
                <button
                  onClick={() => setFeedback('idle')}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl transition-all text-lg"
                >
                  Try Again
                </button>
              </div>
            )}
            {feedback === 'correct' && (
              <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-lg border border-emerald-500/30 text-center font-bold text-lg">
                Link Established! Notice how unmatched rows are deleted.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InnerJoinLesson: React.FC<LessonModuleProps> = ({
  
  onComplete,
  navigate,
}) => {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [firstQuestId, setFirstQuestId]=useState("")
  useEffect(() => {
  const fetchFirstQuest = async () => {
    // 1. Ask Supabase for the ID of the first quest in this category
    const { data, error } = await supabase
      .from('quests')
      .select('id')
      .ilike('title', 'Premium Users Only') // Use ilike for case-insensitive matching
      .limit(1)
      .single();

    if (error) {
      console.error('Could not find first quest:', error);
      return;
    }

    // 2. Save that ID to state!
    if (data) {
      setFirstQuestId(data.id);
    }
  };

  fetchFirstQuest();
}, []);
  const handleStepComplete = (index: number) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);
      if (newSet.size === INNER_JOIN_EXAMPLES.length) onComplete();
      return newSet;
    });
  };

  return (
    <div className="w-full flex flex-col gap-12 pb-32">
      {/* HEADER SECTION */}
      <div className="max-w-3xl">
        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
          Interactive Lesson
        </span>
        <h1 className="text-4xl font-black text-white mt-2 mb-6">
          Combining Tables:{' '}
          <span className="text-indigo-400 font-bold">INNER JOIN</span>
        </h1>
      </div>

      {/* DESCRIPTION WITH INLINE VISUAL TABLES */}
      <div className="max-w-5xl bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 md:p-8 shadow-2xl">
        <div className="text-zinc-300 leading-relaxed space-y-5 text-lg">
          <p>
            In the last lesson, we used a{' '}
            <code className="bg-zinc-950 border border-zinc-800 text-indigo-400 font-bold px-2 py-0.5 rounded font-mono text-base">
              LEFT JOIN
            </code>{' '}
            to combine our customers and orders tables. It kept{' '}
            <em>everyone</em> on the list. Even Bob, who had never ordered food,
            stayed on the list with blank{' '}
            <code className="bg-zinc-950 border border-zinc-800 text-zinc-500 italic px-2 py-0.5 rounded font-mono text-base">
              NULL
            </code>{' '}
            values.
          </p>

          <p>
            But what if Finance ONLY wants a list of customers who{' '}
            <em>actually bought something?</em> They don't care about window
            shoppers. They just want the real buyers.
          </p>

          <p>
            That is where{' '}
            <code className="bg-zinc-950 border border-zinc-800 text-indigo-400 font-bold px-2 py-0.5 rounded font-mono text-base">
              INNER JOIN
            </code>{' '}
            comes in. We only want customers who have an order. It is brutally
            honest and strict. If a row in Table A does not have a matching
            order in Table B, it is <strong>completely deleted</strong> from the
            final result.
          </p>

          {/* 🌟 THE VISUAL TABLES 🌟 */}
          <div className="flex flex-col sm:flex-row gap-6 my-10 items-center justify-center bg-zinc-950/50 p-6 rounded-xl border border-zinc-800/50 shadow-inner">
            {/* Table A: Customers */}
            <div className="border border-zinc-800/50 rounded-lg overflow-hidden bg-zinc-900/20 shadow-md w-full sm:w-1/2">
              <div className="bg-zinc-950/80 px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50">
                Table A: Customers
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-base">
                  <thead className="bg-zinc-950/50 border-b border-zinc-800/50">
                    <tr>
                      <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap">
                        customer_id
                      </th>
                      <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap">
                        name
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    <tr className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-base text-amber-400 bg-amber-500/5">
                        1
                      </td>
                      <td className="px-4 py-3 font-mono text-base text-zinc-300">
                        Alice
                      </td>
                    </tr>
                    <tr className="hover:bg-red-900/30 bg-red-950/20 transition-colors opacity-50">
                      <td className="px-4 py-3 font-mono text-base text-red-400">
                        2
                      </td>
                      <td className="px-4 py-3 font-mono text-base text-red-400">
                        Bob
                      </td>
                    </tr>
                    <tr className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-base text-amber-400 bg-amber-500/5">
                        3
                      </td>
                      <td className="px-4 py-3 font-mono text-base text-zinc-300">
                        Charlie
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Connection Indicator */}
            <div className="hidden sm:flex text-zinc-600 font-black text-2xl">
              ➕
            </div>

            {/* Table B: Orders */}
            <div className="border border-zinc-800/50 rounded-lg overflow-hidden bg-zinc-900/20 shadow-md w-full sm:w-1/2">
              <div className="bg-zinc-950/80 px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50">
                Table B: Orders
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-base">
                  <thead className="bg-zinc-950/50 border-b border-zinc-800/50">
                    <tr>
                      <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap">
                        order_id
                      </th>
                      <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap">
                        customer_id
                      </th>
                      <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap">
                        food
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    <tr className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-base text-zinc-400">
                        101
                      </td>
                      <td className="px-4 py-3 font-mono text-base text-amber-400 bg-amber-500/5">
                        1
                      </td>
                      <td className="px-4 py-3 font-mono text-base text-zinc-300">
                        Pizza
                      </td>
                    </tr>
                    <tr className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-base text-zinc-400">
                        102
                      </td>
                      <td className="px-4 py-3 font-mono text-base text-amber-400 bg-amber-500/5">
                        3
                      </td>
                      <td className="px-4 py-3 font-mono text-base text-zinc-300">
                        Burger
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-white mt-12 mb-4">
            Putting It All Together
          </h3>

          <p>
            When we use{' '}
            <code className="bg-zinc-950 border border-zinc-800 text-indigo-400 font-bold px-2 py-0.5 rounded font-mono text-base">
              INNER JOIN
            </code>
            , the database looks for a perfect match on the{' '}
            <code className="bg-zinc-950 border border-zinc-800 text-indigo-400 font-bold px-2 py-0.5 rounded font-mono text-base">
              ON
            </code>{' '}
            clause.
          </p>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 my-8 font-mono text-base shadow-inner flex flex-col gap-1">
            <div className="text-indigo-400 font-bold">
              SELECT <span className="text-white font-normal">*</span>
            </div>
            <div className="text-indigo-400 font-bold">
              FROM <span className="text-white font-normal">customers</span>
            </div>
            <div className="text-indigo-400 font-bold">
              INNER JOIN <span className="text-white font-normal">orders</span>
            </div>
            <div className="text-indigo-400 font-bold">
              ON{' '}
              <span className="text-white font-normal">
                customers.customer_id{' '}
                <span className="text-pink-400 font-bold">=</span>{' '}
                orders.customer_id
              </span>
              ;
            </div>
          </div>

          <h4 className="text-xl font-bold text-white mt-12 mb-4">
            The Final Result:
          </h4>

          {/* Result Table */}
          <div className="border border-zinc-800/50 rounded-lg overflow-hidden bg-black/40 shadow-xl mb-6">
            <div className="bg-zinc-950/80 px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800/50 flex justify-between items-center">
              <span>Query Result</span>
              <span className="bg-indigo-500/20 px-2 py-1 rounded text-indigo-300">
                2 Rows Returned
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-base">
                <thead>
                  <tr>
                    <th
                      colSpan={2}
                      className="bg-zinc-950/80 text-zinc-300 text-center text-xs font-bold px-4 py-2 uppercase tracking-widest border-b border-r border-zinc-800/50"
                    >
                      Table A: Customers
                    </th>
                    <th
                      colSpan={3}
                      className="bg-zinc-950/80 text-zinc-300 text-center text-xs font-bold px-4 py-2 uppercase tracking-widest border-b border-zinc-800/50"
                    >
                      Table B: Orders
                    </th>
                  </tr>
                  <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                    <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap">
                      customer_id
                    </th>
                    <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap border-r border-zinc-800/50">
                      name
                    </th>
                    <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap">
                      order_id
                    </th>
                    <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap">
                      customer_id
                    </th>
                    <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap">
                      food
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  <tr className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-base text-white">
                      1
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-white border-r border-zinc-800/50">
                      Alice
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-white">
                      101
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-white">
                      1
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-white">
                      Pizza
                    </td>
                  </tr>
                  <tr className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-base text-white">
                      3
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-white border-r border-zinc-800/50">
                      Charlie
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-white">
                      102
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-white">
                      3
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-white">
                      Burger
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <p className="text-base text-zinc-400 text-left">
              Because Bob had no matching orders in Table B, he was{' '}
              <strong>completely dropped</strong> from the result. Alice and
              Charlie are the only ones left!
            </p>
          </div>
        </div>
      </div>

      {/* SYNTAX BLOCK */}
      <div className="max-w-4xl mt-4">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
          Syntax Examples
        </h3>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 font-mono text-base shadow-inner flex flex-col gap-6">
          {/* Example 1: Select All */}
          <div>
            <div className="text-zinc-500 italic mb-1">
              -- Select all columns
            </div>
            <div className="text-indigo-400 font-bold">
              SELECT <span className="text-white font-normal">*</span>
            </div>
            <div className="text-indigo-400 font-bold">
              FROM <span className="text-amber-400 font-normal">table_A</span>
            </div>
            <div className="text-indigo-400 font-bold">
              INNER JOIN{' '}
              <span className="text-amber-400 font-normal">table_B</span>
            </div>
            <div className="text-indigo-400 font-bold">
              ON{' '}
              <span className="text-amber-400 font-normal">
                table_A.column_name
              </span>{' '}
              <span className="text-pink-400 font-bold">=</span>{' '}
              <span className="text-amber-400 font-normal">
                table_B.column_name
              </span>
              ;
            </div>
          </div>

          {/* Example 2: Select Specific Columns */}
          <div>
            <div className="text-zinc-500 italic mb-1">
              -- Select specific columns
            </div>
            <div className="text-indigo-400 font-bold">
              SELECT{' '}
              <span className="text-amber-400 font-normal">
                table_A.column1
              </span>
              <span className="text-zinc-500 font-bold">, </span>
              <span className="text-amber-400 font-normal">
                table_B.column2
              </span>
            </div>
            <div className="text-indigo-400 font-bold">
              FROM <span className="text-amber-400 font-normal">table_A</span>
            </div>
            <div className="text-indigo-400 font-bold">
              INNER JOIN{' '}
              <span className="text-amber-400 font-normal">table_B</span>
            </div>
            <div className="text-indigo-400 font-bold">
              ON{' '}
              <span className="text-amber-400 font-normal">
                table_A.column_name
              </span>{' '}
              <span className="text-pink-400 font-bold">=</span>{' '}
              <span className="text-amber-400 font-normal">
                table_B.column_name
              </span>
              ;
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE EXAMPLES */}
      <div className="mt-12">
        <h2 className="text-3xl font-black text-white mb-8">Examples</h2>
        {INNER_JOIN_EXAMPLES.map((step, idx) => (
          <InteractiveInnerJoinExample
            key={idx}
            step={step}
            index={idx}
            onPass={() => handleStepComplete(idx)}
            isCompleted={completedSteps.has(idx)}
          />
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center gap-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
        <h3 className="text-xl font-bold text-white">
          Ready to connect the dots?
        </h3>
        <button
          onClick={() =>
            firstQuestId
              ? navigate(`/quest/${firstQuestId}`)
              : navigate('/home')
          }
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-12 rounded-xl transition-all flex justify-center items-center gap-3 shadow-[0_0_20px_rgba(79,70,229,0.3)] text-lg"
        >
          Start INNER JOIN Quests ➔
        </button>
      </div>
    </div>
  );
};

// ==========================================
// MODULE 7: THE "CTE" LESSON
// ==========================================
// ==========================================
// MODULE 7: THE "CTE" LESSON
// ==========================================
// ==========================================
// 1. STRICT TYPESCRIPT INTERFACES
// ==========================================
interface CteStepData {
  id: 1 | 2 | 3;
  title: string;
  prompt1: string;
  prompt2: string;
  prompt3?: string;
  rawTable: {
    name: string;
    columns: string[];
    data: Record<string, string | number>[];
  };
  cteName: string;
  expectedCols: string[];
  expectedFilter?: {
    col: string;
    op: string;
    val: string;
    location: 'main' | 'cte';
  };
  cteOutput: Record<string, string | number>[];
  finalOutput?: Record<string, string | number>[];
}

// ==========================================
// THE 3 SIMPLIFIED CTE EXAMPLES
// ==========================================
const CTE_EXAMPLES: CteStepData[] = [
  {
    id: 1,
    title: 'Slimming Down a Table',
    prompt1:
      "Step 1: This table has too much noise. Let's create a CTE named 'staff_list' that only selects the 'name', 'department', and 'salary' columns.",
    prompt2:
      "Step 2: Now let's peek inside! Write the main query outside the CTE to SELECT * from your new 'staff_list' mini-table.",
    rawTable: {
      name: 'employees',
      columns: ['emp_id', 'name', 'department', 'salary', 'office_num'],
      data: [
        {
          emp_id: 101,
          name: 'Alice',
          department: 'Sales',
          salary: 60000,
          office_num: '4A',
        },
        {
          emp_id: 102,
          name: 'Bob',
          department: 'IT',
          salary: 75000,
          office_num: '2B',
        },
        {
          emp_id: 103,
          name: 'Charlie',
          department: 'Sales',
          salary: 55000,
          office_num: '4B',
        },
      ],
    },
    cteName: 'staff_list',
    expectedCols: ['name', 'department', 'salary'],
    cteOutput: [
      { name: 'Alice', department: 'Sales', salary: 60000 },
      { name: 'Bob', department: 'IT', salary: 75000 },
      { name: 'Charlie', department: 'Sales', salary: 55000 },
    ],
  },
  {
    id: 2,
    title: 'Filtering the Main Query',
    prompt1:
      "Step 1: Create a CTE named 'staff_list' that selects the 'name', 'department', and 'salary' columns from the employees table.",
    prompt2:
      "Step 2: Let's see the mini-table. Write the main query to SELECT * from 'staff_list'.",
    prompt3:
      "Step 3: Now let's filter our output! Modify the main query outside the CTE to only show employees where the salary is strictly greater than 55000.",
    rawTable: {
      name: 'employees',
      columns: ['emp_id', 'name', 'department', 'salary', 'office_num'],
      data: [
        {
          emp_id: 101,
          name: 'Alice',
          department: 'Sales',
          salary: 60000,
          office_num: '4A',
        },
        {
          emp_id: 102,
          name: 'Bob',
          department: 'IT',
          salary: 75000,
          office_num: '2B',
        },
        {
          emp_id: 103,
          name: 'Charlie',
          department: 'Sales',
          salary: 55000,
          office_num: '4B',
        },
      ],
    },
    cteName: 'staff_list',
    expectedCols: ['name', 'department', 'salary'],
    expectedFilter: { col: 'salary', op: '>', val: '55000', location: 'main' },
    cteOutput: [
      { name: 'Alice', department: 'Sales', salary: 60000 },
      { name: 'Bob', department: 'IT', salary: 75000 },
      { name: 'Charlie', department: 'Sales', salary: 55000 },
    ],
    finalOutput: [
      { name: 'Alice', department: 'Sales', salary: 60000 },
      { name: 'Bob', department: 'IT', salary: 75000 },
    ],
  },
  {
    id: 3,
    title: 'Filtering INSIDE the CTE',
    prompt1:
      "Step 1: Create a CTE named 'sales_team' that selects the 'name', 'department', and 'salary' columns.",
    prompt2:
      "Step 2: Let's peek at the CTE by running SELECT * from 'sales_team'.",
    prompt3:
      "Step 3: This time, let's filter INSIDE the CTE! Move the WHERE clause into the CTE declaration so it only grabs rows where the department equals 'Sales'. Notice how you can filter and clean data while you are creating the mini-table, making it super clean before the main query even runs!",
    rawTable: {
      name: 'employees',
      columns: ['emp_id', 'name', 'department', 'salary', 'office_num'],
      data: [
        {
          emp_id: 101,
          name: 'Alice',
          department: 'Sales',
          salary: 60000,
          office_num: '4A',
        },
        {
          emp_id: 102,
          name: 'Bob',
          department: 'IT',
          salary: 75000,
          office_num: '2B',
        },
        {
          emp_id: 103,
          name: 'Charlie',
          department: 'Sales',
          salary: 55000,
          office_num: '4B',
        },
      ],
    },
    cteName: 'sales_team',
    expectedCols: ['name', 'department', 'salary'],
    expectedFilter: {
      col: 'department',
      op: '=',
      val: "'Sales'",
      location: 'cte',
    },
    cteOutput: [
      { name: 'Alice', department: 'Sales', salary: 60000 },
      { name: 'Bob', department: 'IT', salary: 75000 },
      { name: 'Charlie', department: 'Sales', salary: 55000 },
    ],
    finalOutput: [
      { name: 'Alice', department: 'Sales', salary: 60000 },
      { name: 'Charlie', department: 'Sales', salary: 55000 },
    ],
  },
];

// ==========================================
// THE DYNAMIC INTERACTIVE COMPONENT
// ==========================================
const InteractiveCteExample = ({
  step,
  index,
  onPass,
  isCompleted,
}: {
  step: CteStepData;
  index: number;
  onPass: () => void;
  isCompleted: boolean;
}) => {
  // Part 1: Build CTE
  const [col1, setCol1] = useState('');
  const [col2, setCol2] = useState('');
  const [col3, setCol3] = useState('');
  const [part1Status, setPart1Status] = useState<'idle' | 'wrong' | 'correct'>(
    'idle',
  );

  // Part 2: View CTE
  const [mainSelect, setMainSelect] = useState('');
  const [mainFrom, setMainFrom] = useState('');
  const [part2Status, setPart2Status] = useState<'idle' | 'wrong' | 'correct'>(
    'idle',
  );

  // Part 3: Filter (Main for Ex 2, CTE for Ex 3)
  const [filterCol, setFilterCol] = useState('');
  const [filterOp, setFilterOp] = useState('');
  const [filterVal, setFilterVal] = useState('');
  const [part3Status, setPart3Status] = useState<'idle' | 'wrong' | 'correct'>(
    'idle',
  );

  const handlePart1Submit = () => {
    if (
      col1 === step.expectedCols[0] &&
      col2 === step.expectedCols[1] &&
      col3 === step.expectedCols[2]
    ) {
      setPart1Status('correct');
      if (step.id === 1) onPass();
    } else {
      setPart1Status('wrong');
    }
  };

  const handlePart2Submit = () => {
    if (mainSelect === '*' && mainFrom === step.cteName) {
      setPart2Status('correct');
    } else {
      setPart2Status('wrong');
    }
  };

  const handlePart3Submit = () => {
    if (
      step.expectedFilter &&
      filterCol === step.expectedFilter.col &&
      filterOp === step.expectedFilter.op &&
      filterVal === step.expectedFilter.val
    ) {
      setPart3Status('correct');
      onPass();
    } else {
      setPart3Status('wrong');
    }
  };

  return (
    <div className="w-full flex flex-col xl:flex-row gap-8 mb-12">
      {/* 🌟 LEFT COLUMN: Instructions and Outputs 🌟 */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6">
        <div
          className={`bg-zinc-900/40 backdrop-blur-xl border ${isCompleted ? 'border-emerald-500/50' : 'border-zinc-800/50'} rounded-2xl p-6 md:p-8 shadow-2xl transition-all`}
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <span
              className={`${isCompleted ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'} w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black transition-colors shadow-lg`}
            >
              {isCompleted ? '✓' : index + 1}
            </span>
            {step.title}
          </h2>

          <div className="space-y-6">
            {/* PART 1 INSTRUCTION */}
            <div>
              <p
                className={`text-lg leading-relaxed ${part1Status === 'correct' ? 'text-zinc-500' : 'text-zinc-300'}`}
              >
                {step.prompt1}
              </p>
            </div>

            {/* RAW TABLE */}
            {part1Status !== 'correct' && (
              <div className="border border-zinc-800/50 rounded-lg overflow-hidden bg-zinc-900/20 shadow-md">
                <div className="bg-zinc-950/80 px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50">
                  Raw Table: {step.rawTable.name}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-base">
                    <thead className="bg-zinc-950/50 border-b border-zinc-800/50">
                      <tr>
                        {step.rawTable.columns.map((c) => (
                          <th
                            key={c}
                            className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap"
                          >
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {step.rawTable.data.map((row, i) => (
                        <tr
                          key={i}
                          className="hover:bg-zinc-800/30 transition-colors"
                        >
                          {step.rawTable.columns.map((c) => (
                            <td
                              key={c}
                              className="px-4 py-3 font-mono text-base text-zinc-300 whitespace-nowrap"
                            >
                              {String(row[c])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PART 2 INSTRUCTION */}
            {part1Status === 'correct' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <hr className="border-zinc-800/50 my-6" />
                <p
                  className={`text-lg leading-relaxed ${part2Status === 'correct' ? 'text-zinc-500' : 'text-zinc-300'}`}
                >
                  {step.prompt2}
                </p>
              </motion.div>
            )}

            {/* PART 2 OUTPUT (CTE View) */}
            {part2Status === 'correct' &&
              (step.id === 1 || part3Status !== 'correct') && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="border border-indigo-500/30 rounded-lg overflow-hidden bg-indigo-500/5 shadow-md mt-4">
                    <div className="bg-zinc-950/80 px-4 py-3 text-xs font-bold text-indigo-400 uppercase tracking-widest border-b border-indigo-500/20">
                      OUTPUT: {step.cteName}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-base">
                        <thead className="bg-zinc-950/50 border-b border-indigo-500/20">
                          <tr>
                            {step.expectedCols.map((c) => (
                              <th
                                key={c}
                                className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight whitespace-nowrap"
                              >
                                {c}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-indigo-500/10">
                          {step.cteOutput.map((row, i) => (
                            <tr
                              key={i}
                              className="hover:bg-zinc-800/30 transition-colors"
                            >
                              {step.expectedCols.map((c) => (
                                <td
                                  key={c}
                                  className="px-4 py-3 font-mono text-base text-zinc-300"
                                >
                                  {String(row[c])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

            {/* PART 3 INSTRUCTION */}
            {part2Status === 'correct' && step.id !== 1 && step.prompt3 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <hr className="border-zinc-800/50 my-6" />
                <p
                  className={`text-lg leading-relaxed ${part3Status === 'correct' ? 'text-zinc-500' : 'text-zinc-300'}`}
                >
                  {step.prompt3}
                </p>
              </motion.div>
            )}

            {/* PART 3 OUTPUT (Final Filtered View) */}
            {part3Status === 'correct' && step.finalOutput && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="border border-emerald-500/30 rounded-lg overflow-hidden bg-emerald-500/5 shadow-md mt-4">
                  <div className="bg-black/60 px-4 py-3 text-xs font-bold text-emerald-500 uppercase tracking-widest border-b border-emerald-500/20">
                    FINAL FILTERED OUTPUT
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-base">
                      <thead className="bg-black/40 border-b border-emerald-500/20">
                        <tr>
                          {step.expectedCols.map((c) => (
                            <th
                              key={c}
                              className="px-4 py-3 font-mono font-bold text-emerald-400 uppercase tracking-tight whitespace-nowrap"
                            >
                              {c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-500/10">
                        {step.finalOutput.map((row, i) => (
                          <tr key={i}>
                            {step.expectedCols.map((c) => (
                              <td
                                key={c}
                                className="px-4 py-3 font-mono text-base font-bold text-white"
                              >
                                {String(row[c])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* 🌟 RIGHT COLUMN: Three-Step Query Builder 🌟 */}
      <div className="w-full xl:w-2/3 flex flex-col">
        <div
          className={`bg-zinc-900/40 backdrop-blur-xl border-2 rounded-2xl overflow-hidden flex flex-col h-full shadow-2xl transition-colors duration-300 ${isCompleted ? 'border-emerald-500' : 'border-zinc-800/50'}`}
        >
          <div className="bg-zinc-950/80 px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              Query Builder
            </span>
          </div>

          <div className="p-8 flex-1 bg-zinc-950/40 font-mono text-base flex flex-col gap-6">
            {/* CTE DECLARATION BLOCK */}
            <div
              className={`transition-opacity duration-500 ${part1Status === 'correct' && part3Status !== 'correct' && step.id === 3 ? 'opacity-100' : part1Status === 'correct' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
            >
              <div className="text-zinc-500 italic mb-2">
                -- Step 1: Create the Mini-Table
              </div>
              <div className="text-indigo-400 font-bold">
                WITH{' '}
                <span className="text-amber-400 font-normal">
                  {step.cteName}
                </span>{' '}
                AS <span className="text-zinc-500 font-bold">(</span>
              </div>

              <div className="pl-4 md:pl-8 mt-3 flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-indigo-400 font-bold">SELECT</span>
                  <select
                    value={col1}
                    onChange={(e) => {
                      setCol1(e.target.value);
                      setPart1Status('idle');
                    }}
                    className="bg-zinc-950 border border-zinc-800 text-amber-400 rounded-md px-2 py-1 outline-none cursor-pointer focus:border-indigo-500 transition-colors text-base"
                  >
                    <option value="" disabled>
                      col 1
                    </option>
                    {step.rawTable.columns.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <span className="text-zinc-500 font-bold">,</span>
                  <select
                    value={col2}
                    onChange={(e) => {
                      setCol2(e.target.value);
                      setPart1Status('idle');
                    }}
                    className="bg-zinc-950 border border-zinc-800 text-amber-400 rounded-md px-2 py-1 outline-none cursor-pointer focus:border-indigo-500 transition-colors text-base"
                  >
                    <option value="" disabled>
                      col 2
                    </option>
                    {step.rawTable.columns.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <span className="text-zinc-500 font-bold">,</span>
                  <select
                    value={col3}
                    onChange={(e) => {
                      setCol3(e.target.value);
                      setPart1Status('idle');
                    }}
                    className="bg-zinc-950 border border-zinc-800 text-amber-400 rounded-md px-2 py-1 outline-none cursor-pointer focus:border-indigo-500 transition-colors text-base"
                  >
                    <option value="" disabled>
                      col 3
                    </option>
                    {step.rawTable.columns.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-indigo-400 font-bold">FROM</span>{' '}
                  <span className="text-amber-400 font-normal">
                    {step.rawTable.name}
                  </span>
                </div>

                {/* Ex 3: Filter inside CTE */}
                {step.id === 3 && part2Status === 'correct' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-wrap items-center gap-3 bg-zinc-900 border border-zinc-800/50 p-4 rounded-xl shadow-inner mt-2"
                  >
                    <span className="text-indigo-400 font-bold">WHERE</span>
                    <select
                      value={filterCol}
                      onChange={(e) => {
                        setFilterCol(e.target.value);
                        setPart3Status('idle');
                      }}
                      className="bg-zinc-950 border border-zinc-800 text-amber-400 rounded-md px-3 py-1.5 outline-none cursor-pointer focus:border-indigo-500 transition-colors text-base"
                    >
                      <option value="" disabled>
                        column
                      </option>
                      {step.expectedCols.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <select
                      value={filterOp}
                      onChange={(e) => {
                        setFilterOp(e.target.value);
                        setPart3Status('idle');
                      }}
                      className="bg-zinc-950 border border-zinc-800 text-pink-400 font-bold rounded-md px-3 py-1.5 outline-none cursor-pointer focus:border-indigo-500 transition-colors text-base"
                    >
                      <option value="" disabled>
                        op
                      </option>
                      <option value="=">=</option>
                      <option value=">">&gt;</option>
                      <option value="<">&lt;</option>
                    </select>
                    <select
                      value={filterVal}
                      onChange={(e) => {
                        setFilterVal(e.target.value);
                        setPart3Status('idle');
                      }}
                      className="bg-zinc-950 border border-zinc-800 text-emerald-400 font-bold rounded-md px-3 py-1.5 outline-none cursor-pointer focus:border-indigo-500 transition-colors text-base"
                    >
                      <option value="" disabled>
                        value
                      </option>
                      <option value="55000">55000</option>
                      <option value="60000">60000</option>
                      <option value="'Sales'">'Sales'</option>
                      <option value="'IT'">'IT'</option>
                    </select>
                  </motion.div>
                )}
              </div>
              <div className="text-zinc-500 font-bold mt-3">)</div>
            </div>

            {/* MAIN QUERY BLOCK */}
            {part1Status === 'correct' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`mt-4 pt-6 border-t border-zinc-800/50 transition-opacity duration-500 ${part2Status === 'correct' && step.id === 2 && part3Status !== 'correct' ? 'opacity-100' : part2Status === 'correct' && step.id !== 1 ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
              >
                <div className="text-zinc-500 italic mb-2">
                  -- Step 2: Query the Mini-Table
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-indigo-400 font-bold">SELECT</span>
                  <select
                    value={mainSelect}
                    onChange={(e) => {
                      setMainSelect(e.target.value);
                      setPart2Status('idle');
                    }}
                    className="bg-zinc-950 border border-zinc-800 text-white rounded-md px-2 py-1 outline-none cursor-pointer focus:border-indigo-500 transition-colors text-base"
                  >
                    <option value="" disabled>
                      select
                    </option>
                    <option value="*">*</option>
                    <option value="name">name</option>
                  </select>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="text-indigo-400 font-bold">FROM</span>
                  <select
                    value={mainFrom}
                    onChange={(e) => {
                      setMainFrom(e.target.value);
                      setPart2Status('idle');
                    }}
                    className="bg-zinc-950 border border-zinc-800 text-amber-400 rounded-md px-2 py-1 outline-none cursor-pointer focus:border-indigo-500 transition-colors text-base"
                  >
                    <option value="" disabled>
                      table
                    </option>
                    <option value={step.rawTable.name}>
                      {step.rawTable.name}
                    </option>
                    <option value={step.cteName}>{step.cteName}</option>
                  </select>
                </div>

                {/* Ex 2: Filter in Main Query */}
                {step.id === 2 && part2Status === 'correct' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-wrap items-center gap-3 mt-4 bg-zinc-900 border border-zinc-800/50 p-6 rounded-xl shadow-inner"
                  >
                    <span className="text-indigo-400 font-bold">WHERE</span>
                    <select
                      value={filterCol}
                      onChange={(e) => {
                        setFilterCol(e.target.value);
                        setPart3Status('idle');
                      }}
                      className="bg-zinc-950 border border-zinc-800 text-amber-400 rounded-md px-3 py-1.5 outline-none cursor-pointer focus:border-indigo-500 transition-colors text-base"
                    >
                      <option value="" disabled>
                        column
                      </option>
                      {step.expectedCols.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <select
                      value={filterOp}
                      onChange={(e) => {
                        setFilterOp(e.target.value);
                        setPart3Status('idle');
                      }}
                      className="bg-zinc-950 border border-zinc-800 text-pink-400 font-bold rounded-md px-3 py-1.5 outline-none cursor-pointer focus:border-indigo-500 transition-colors text-base"
                    >
                      <option value="" disabled>
                        op
                      </option>
                      <option value="=">=</option>
                      <option value=">">&gt;</option>
                      <option value="<">&lt;</option>
                    </select>
                    <select
                      value={filterVal}
                      onChange={(e) => {
                        setFilterVal(e.target.value);
                        setPart3Status('idle');
                      }}
                      className="bg-zinc-950 border border-zinc-800 text-emerald-400 font-bold rounded-md px-3 py-1.5 outline-none cursor-pointer focus:border-indigo-500 transition-colors text-base"
                    >
                      <option value="" disabled>
                        value
                      </option>
                      <option value="55000">55000</option>
                      <option value="60000">60000</option>
                      <option value="'Sales'">'Sales'</option>
                    </select>
                  </motion.div>
                )}

                {(!step.expectedFilter ||
                  (step.id === 3 && part2Status !== 'correct')) && (
                  <div className="text-white font-bold mt-2">;</div>
                )}
              </motion.div>
            )}
          </div>

          <div className="p-6 border-t border-zinc-800 bg-zinc-950/80">
            {part1Status !== 'correct' ? (
              <>
                {part1Status === 'idle' && (
                  <button
                    onClick={handlePart1Submit}
                    disabled={!col1 || !col2 || !col3}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white font-bold py-4 rounded-xl transition-all text-lg"
                  >
                    Build Mini-Table
                  </button>
                )}
                {part1Status === 'wrong' && (
                  <div className="flex flex-col gap-4">
                    <div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/30 text-center font-bold text-lg">
                      Incorrect CTE columns. Try again!
                    </div>
                    <button
                      onClick={() => setPart1Status('idle')}
                      className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl transition-all text-lg"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </>
            ) : part2Status !== 'correct' ? (
              <>
                {part2Status === 'idle' && (
                  <button
                    onClick={handlePart2Submit}
                    disabled={!mainSelect || !mainFrom}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white font-bold py-4 rounded-xl transition-all text-lg"
                  >
                    Peek Inside CTE
                  </button>
                )}
                {part2Status === 'wrong' && (
                  <div className="flex flex-col gap-4">
                    <div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/30 text-center font-bold text-lg">
                      Incorrect Main Query. Check the hints!
                    </div>
                    <button
                      onClick={() => setPart2Status('idle')}
                      className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl transition-all text-lg"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </>
            ) : step.id === 1 ? (
              <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-lg border border-emerald-500/30 text-center font-bold text-lg">
                CTE Executed Successfully!
              </div>
            ) : (
              <>
                {part3Status === 'idle' && (
                  <button
                    onClick={handlePart3Submit}
                    disabled={!filterCol || !filterOp || !filterVal}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white font-bold py-4 rounded-xl transition-all text-lg"
                  >
                    Apply Filter
                  </button>
                )}
                {part3Status === 'wrong' && (
                  <div className="flex flex-col gap-4">
                    <div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/30 text-center font-bold text-lg">
                      Filter logic incorrect!
                    </div>
                    <button
                      onClick={() => setPart3Status('idle')}
                      className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl transition-all text-lg"
                    >
                      Try Again
                    </button>
                  </div>
                )}
                {part3Status === 'correct' && (
                  <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-lg border border-emerald-500/30 text-center font-bold text-lg">
                    Filter Applied Successfully!
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CteLesson: React.FC<LessonModuleProps> = ({
  
  onComplete,
  navigate,
}) => {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [firstQuestId, setFirstQuestId]=useState("")
  useEffect(() => {
  const fetchFirstQuest = async () => {
    // 1. Ask Supabase for the ID of the first quest in this category
    const { data, error } = await supabase
      .from('quests')
      .select('id')
      .ilike('title', "Clean Staff List") // Use ilike for case-insensitive matching
      .limit(1)
      .single();

    if (error) {
      console.error('Could not find first quest:', error);
      return;
    }

    // 2. Save that ID to state!
    if (data) {
      setFirstQuestId(data.id);
    }
  };

  fetchFirstQuest();
}, []);
  const handleStepComplete = (index: number) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);
      if (newSet.size === CTE_EXAMPLES.length) onComplete();
      return newSet;
    });
  };

  return (
    <div className="w-full flex flex-col gap-12 pb-32">
      <div className="max-w-3xl">
        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
          Interactive Lesson
        </span>
        <h1 className="text-4xl font-black text-white mt-2 mb-6">
          Common Table Expressions:{' '}
          <span className="text-indigo-400 font-bold">CTE</span>
        </h1>
      </div>

      <div className="max-w-5xl bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-6 md:p-8 shadow-2xl">
        <div className="text-zinc-300 leading-relaxed space-y-5 text-lg">
          <p>
            So far we have been exploring writing queries using SELECT, WHERE,
            FROM, ORDER BY, GROUP BY, LEFT JOIN, and INNER JOIN. And all of
            these instances involved you writing a query in one 'code block', we
            didn't really divide our logic. But in the real world this will be
            an issue. As an analyst you will be dealing with queries that expand
            hundreds of lines sometimes and if you write all that logic within a
            single 'code block' it's going to get messy real quick!
          </p>
          <p>
            A <strong>Common Table Expression (CTE)</strong> solves this problem
            really easily by allowing your code to be readable and reusable (and
            also allows you to break down logic and structure really
            efficiently).
          </p>

          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-6 mt-6 shadow-md">
            <h3 className="text-white font-bold mb-4">
              Why professionals use CTEs:
            </h3>
            <ul className="space-y-4 text-base">
              <li className="flex items-start gap-4">
                <span className="text-indigo-400 text-xl font-black">1</span>
                <div>
                  <strong className="text-white block mb-1">
                    Readability (Top-Down Logic)
                  </strong>
                  Because CTEs sit at the top of your script, another analyst
                  reading your code can read it naturally from top to bottom and
                  immediately understand your logic steps.
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-indigo-400 text-xl font-black">2</span>
                <div>
                  <strong className="text-white block mb-1">
                    Breaking Down Complexity
                  </strong>
                  Instead of writing one massive, terrifying query, you can
                  break a huge problem down into 3 or 4 small, easily testable
                  mini-tables.
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-indigo-400 text-xl font-black">3</span>
                <div>
                  <strong className="text-white block mb-1">Reusability</strong>
                  Once you define a CTE at the top of your page, you can
                  reference it as many times as you want in your main query!
                </div>
              </li>
            </ul>
          </div>

          <p className="pt-4">
            You can think of a CTE as allowing you to create{' '}
            <strong>'mini tables'</strong>.
          </p>
        </div>
        <div className="max-w-5xl mt-4 space-y-8">
          <h4 className="text-3xl font-black text-white mb-6">
            Let's work through an example:
          </h4>

          <p className="text-lg text-zinc-300">
            Imagine your boss gives you the raw{' '}
            <code className="text-amber-400 font-mono bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-base">
              coffee_sales
            </code>{' '}
            master table below and says:{' '}
            <em>
              "Find me all the Espresso drinks we sell! I only want to see the
              drink name, category, and price."
            </em>
          </p>

          {/* 🌟 NEW: THE RAW MASTER TABLE 🌟 */}
          <div className="border border-zinc-800/50 rounded-xl overflow-hidden bg-zinc-900/20 shadow-lg">
            <div className="bg-zinc-950/80 px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-800/50">
              Raw Master Table: coffee_sales
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-base">
                <thead className="bg-zinc-950/50 border-b border-zinc-800/50">
                  <tr>
                    <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap">
                      transaction_id
                    </th>
                    <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap">
                      drink
                    </th>
                    <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap">
                      category
                    </th>
                    <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap">
                      price
                    </th>
                    <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap">
                      barista
                    </th>
                    <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight italic whitespace-nowrap">
                      time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  <tr className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-base text-zinc-500">
                      101
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-zinc-300">
                      Latte
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-zinc-300">
                      Espresso
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-zinc-300">
                      5
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-zinc-500">
                      Alice
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-zinc-500">
                      08:00 AM
                    </td>
                  </tr>
                  <tr className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-base text-zinc-500">
                      102
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-zinc-300">
                      Cold Brew
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-zinc-300">
                      Coffee
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-zinc-300">
                      6
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-zinc-500">
                      Bob
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-zinc-500">
                      08:15 AM
                    </td>
                  </tr>
                  <tr className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-base text-zinc-500">
                      103
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-zinc-300">
                      Mocha
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-zinc-300">
                      Espresso
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-zinc-300">
                      6
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-zinc-500">
                      Charlie
                    </td>
                    <td className="px-4 py-3 font-mono text-base text-zinc-500">
                      08:30 AM
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* STEP 1 */}
          <div className="bg-zinc-950/50 border-l-4 border-indigo-500 p-6 md:p-8 rounded-r-2xl shadow-lg mt-8">
            <h5 className="text-indigo-400 font-bold mb-4 uppercase tracking-widest text-sm">
              Step 1: Build the Mini-Table
            </h5>
            <p className="text-lg text-zinc-300 mb-6">
              First, we have to use the{' '}
              <code className="text-indigo-400 font-bold bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded font-mono text-base">
                WITH
              </code>{' '}
              keyword to create a CTE named{' '}
              <code className="text-amber-400 font-mono bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-base">
                drink_list
              </code>
              . Inside the parentheses, we write a standard query to select just
              the 3 columns we need, leaving the rest of the noise behind.
            </p>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 font-mono text-base shadow-inner flex flex-col gap-1">
              <div className="text-zinc-500 italic mb-1">
                -- Step 1: Declare the CTE
              </div>
              <div className="text-indigo-400 font-bold">
                WITH{' '}
                <span className="text-amber-400 font-normal">drink_list</span>{' '}
                AS <span className="text-zinc-500 font-bold">(</span>
              </div>
              <div className="pl-8 text-indigo-400 font-bold">
                SELECT <span className="text-amber-400 font-normal">drink</span>
                <span className="text-zinc-500 font-bold">,</span>{' '}
                <span className="text-amber-400 font-normal">category</span>
                <span className="text-zinc-500 font-bold">,</span>{' '}
                <span className="text-amber-400 font-normal">price</span>
              </div>
              <div className="pl-8 text-indigo-400 font-bold">
                FROM{' '}
                <span className="text-amber-400 font-normal">coffee_sales</span>
              </div>
              <div className="text-zinc-500 font-bold">)</div>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="bg-zinc-950/50 border-l-4 border-indigo-500 p-6 md:p-8 rounded-r-2xl shadow-lg mt-8">
            <h5 className="text-indigo-400 font-bold mb-4 uppercase tracking-widest text-sm">
              Step 2: Peek Inside the Mini-Table
            </h5>
            <p className="text-lg text-zinc-300 mb-6">
              Now we need to show the data within the CTE! Right below the
              closing parenthesis, we write a main query to{' '}
              <code className="text-indigo-400 font-bold bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded font-mono text-base">
                SELECT *
              </code>{' '}
              from our new mini-table so we can see what we built. After writing
              the main sql query outside the CTE, we can run the code to see the
              output of the CTE.
            </p>

            {/* Code Block */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 font-mono text-base shadow-inner flex flex-col gap-1 mb-8">
              <div className="text-indigo-400 font-bold">
                WITH{' '}
                <span className="text-amber-400 font-normal">drink_list</span>{' '}
                AS <span className="text-zinc-500 font-bold">(</span>
              </div>
              <div className="pl-8 text-indigo-400 font-bold">
                SELECT <span className="text-amber-400 font-normal">drink</span>
                <span className="text-zinc-500 font-bold">,</span>{' '}
                <span className="text-amber-400 font-normal">category</span>
                <span className="text-zinc-500 font-bold">,</span>{' '}
                <span className="text-amber-400 font-normal">price</span>
              </div>
              <div className="pl-8 text-indigo-400 font-bold">
                FROM{' '}
                <span className="text-amber-400 font-normal">coffee_sales</span>
              </div>
              <div className="text-zinc-500 font-bold">)</div>
              <div className="text-zinc-500 italic mt-4 mb-1">
                -- Run a quick SELECT to see our Mini-Table:
              </div>
              <div className="text-indigo-400 font-bold">
                SELECT <span className="text-white font-normal">*</span>
              </div>
              <div className="text-indigo-400 font-bold">
                FROM{' '}
                <span className="text-amber-400 font-normal">drink_list</span>;
              </div>
            </div>

            {/* Output Table */}
            <div className="border border-indigo-500/30 rounded-lg overflow-hidden bg-indigo-500/5 shadow-md">
              <div className="bg-zinc-950/80 px-4 py-3 text-xs font-bold text-indigo-400 uppercase tracking-widest border-b border-indigo-500/20">
                CTE OUTPUT: drink_list
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-base">
                  <thead className="bg-zinc-950/50 border-b border-indigo-500/20">
                    <tr>
                      <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight">
                        drink
                      </th>
                      <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight">
                        category
                      </th>
                      <th className="px-4 py-3 font-mono font-bold text-indigo-400 uppercase tracking-tight">
                        price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-500/10">
                    <tr className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-base text-zinc-300">
                        Latte
                      </td>
                      <td className="px-4 py-3 font-mono text-base text-zinc-300">
                        Espresso
                      </td>
                      <td className="px-4 py-3 font-mono text-base text-zinc-300">
                        5
                      </td>
                    </tr>
                    <tr className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-base text-zinc-300">
                        Cold Brew
                      </td>
                      <td className="px-4 py-3 font-mono text-base text-zinc-300">
                        Coffee
                      </td>
                      <td className="px-4 py-3 font-mono text-base text-zinc-300">
                        6
                      </td>
                    </tr>
                    <tr className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-base text-zinc-300">
                        Mocha
                      </td>
                      <td className="px-4 py-3 font-mono text-base text-zinc-300">
                        Espresso
                      </td>
                      <td className="px-4 py-3 font-mono text-base text-zinc-300">
                        6
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="bg-zinc-950/50 border-l-4 border-emerald-500 p-6 md:p-8 rounded-r-2xl shadow-lg mt-8">
            <h5 className="text-emerald-400 font-bold mb-4 uppercase tracking-widest text-sm">
              Step 3: Filter the Mini-Table
            </h5>
            <p className="text-lg text-zinc-300 mb-6">
              Finally, we modify the{' '}
              <code className="text-indigo-400 font-bold bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded font-mono text-base">
                SELECT
              </code>{' '}
              statement that is outside our CTE and apply a{' '}
              <code className="text-indigo-400 font-bold bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded font-mono text-base">
                WHERE
              </code>{' '}
              filter to find just the Espresso drinks. The CTE acts exactly like
              a real table!
            </p>

            {/* Code Block */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 font-mono text-base shadow-inner flex flex-col gap-1 mb-8">
              <div className="text-indigo-400 font-bold">
                WITH{' '}
                <span className="text-amber-400 font-normal">drink_list</span>{' '}
                AS <span className="text-zinc-500 font-bold">(</span>
              </div>
              <div className="pl-8 text-indigo-400 font-bold">
                SELECT <span className="text-amber-400 font-normal">drink</span>
                <span className="text-zinc-500 font-bold">,</span>{' '}
                <span className="text-amber-400 font-normal">category</span>
                <span className="text-zinc-500 font-bold">,</span>{' '}
                <span className="text-amber-400 font-normal">price</span>
              </div>
              <div className="pl-8 text-indigo-400 font-bold">
                FROM{' '}
                <span className="text-amber-400 font-normal">coffee_sales</span>
              </div>
              <div className="text-zinc-500 font-bold">)</div>
              <div className="text-zinc-500 italic mt-4 mb-1">
                -- Main query with a filter applied:
              </div>
              <div className="text-indigo-400 font-bold">
                SELECT <span className="text-white font-normal">*</span>
              </div>
              <div className="text-indigo-400 font-bold">
                FROM{' '}
                <span className="text-amber-400 font-normal">drink_list</span>
              </div>
              <div className="text-indigo-400 font-bold">
                WHERE{' '}
                <span className="text-amber-400 font-normal">category</span>{' '}
                <span className="text-pink-400 font-bold">=</span>{' '}
                <span className="text-emerald-400 font-normal">'Espresso'</span>
                ;
              </div>
            </div>

            {/* Output Table */}
            <div className="border border-emerald-500/30 rounded-lg overflow-hidden bg-emerald-500/5 shadow-md">
              <div className="bg-black/60 px-4 py-3 text-xs font-bold text-emerald-500 uppercase tracking-widest border-b border-emerald-500/20">
                Final Output Result
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-base">
                  <thead className="bg-black/40 border-b border-emerald-500/20">
                    <tr>
                      <th className="px-4 py-3 font-mono font-bold text-emerald-400 uppercase tracking-tight">
                        drink
                      </th>
                      <th className="px-4 py-3 font-mono font-bold text-emerald-400 uppercase tracking-tight">
                        category
                      </th>
                      <th className="px-4 py-3 font-mono font-bold text-emerald-400 uppercase tracking-tight">
                        price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-500/10">
                    <tr className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-base font-bold text-white">
                        Latte
                      </td>
                      <td className="px-4 py-3 font-mono text-base font-bold text-white">
                        Espresso
                      </td>
                      <td className="px-4 py-3 font-mono text-base font-bold text-white">
                        5
                      </td>
                    </tr>
                    <tr className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-base font-bold text-white">
                        Mocha
                      </td>
                      <td className="px-4 py-3 font-mono text-base font-bold text-white">
                        Espresso
                      </td>
                      <td className="px-4 py-3 font-mono text-base font-bold text-white">
                        6
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- NEW STEP-BY-STEP EXAMPLE --- */}

      {/* --- END STEP-BY-STEP EXAMPLE --- */}

      {/* 🌟 MOVED SYNTAX EXAMPLES TO AFTER THE WALKTHROUGH 🌟 */}
      {/* 🌟 SYNTAX EXAMPLES 🌟 */}
      <div className="max-w-4xl mt-16 space-y-6">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
          Syntax Examples
        </h3>

        {/* Single CTE */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 font-mono text-base shadow-inner flex flex-col gap-1">
          <div className="text-zinc-500 italic mb-1">-- 1. Single CTE</div>
          <div className="text-indigo-400 font-bold">
            WITH <span className="text-amber-400 font-normal">mini_table</span>{' '}
            AS <span className="text-zinc-500 font-bold">(</span>
          </div>
          <div className="pl-8 text-indigo-400 font-bold">
            SELECT <span className="text-white font-normal">*</span> FROM{' '}
            <span className="text-amber-400 font-normal">original_table</span>
          </div>
          <div className="text-zinc-500 font-bold">)</div>
          <div className="text-indigo-400 font-bold mt-2">
            SELECT <span className="text-white font-normal">*</span> FROM{' '}
            <span className="text-amber-400 font-normal">mini_table</span>;
          </div>
        </div>

        {/* Multiple CTEs */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 font-mono text-base shadow-inner flex flex-col gap-1">
          <div className="text-zinc-500 italic mb-1">
            -- 2. Multiple CTEs (Separated by a comma!)
          </div>
          <div className="text-indigo-400 font-bold">
            WITH{' '}
            <span className="text-amber-400 font-normal">apartment_list</span>{' '}
            AS <span className="text-zinc-500 font-bold">(</span>
          </div>
          <div className="pl-8 text-indigo-400 font-bold">
            SELECT <span className="text-white font-normal">*</span> FROM{' '}
            <span className="text-amber-400 font-normal">apartments</span>
          </div>
          <div className="text-zinc-500 font-bold">
            )<span className="text-white font-bold">,</span>
          </div>

          <div className="text-amber-400 font-normal mt-2">
            tenant_history <span className="text-indigo-400 font-bold">AS</span>{' '}
            <span className="text-zinc-500 font-bold">(</span>
          </div>
          <div className="pl-8 text-indigo-400 font-bold">
            SELECT <span className="text-white font-normal">*</span> FROM{' '}
            <span className="text-amber-400 font-normal">history</span>
          </div>
          <div className="text-zinc-500 font-bold">)</div>

          <div className="text-indigo-400 font-bold mt-4">
            SELECT <span className="text-white font-normal">*</span>
          </div>
          <div className="text-indigo-400 font-bold">
            FROM{' '}
            <span className="text-amber-400 font-normal">apartment_list</span>
          </div>
          <div className="text-indigo-400 font-bold">
            INNER JOIN{' '}
            <span className="text-amber-400 font-normal">tenant_history</span>
          </div>
          <div className="text-indigo-400 font-bold">
            ON{' '}
            <span className="text-amber-400 font-normal">
              apartment_list.unit
            </span>{' '}
            <span className="text-pink-400 font-bold">=</span>{' '}
            <span className="text-amber-400 font-normal">
              tenant_history.unit
            </span>
            ;
          </div>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-3xl font-black text-white mb-8">Examples</h2>
        {CTE_EXAMPLES.map((step, idx) => (
          <InteractiveCteExample
            key={idx}
            step={step}
            index={idx}
            onPass={() => handleStepComplete(idx)}
            isCompleted={completedSteps.has(idx)}
          />
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center gap-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
        <h3 className="text-xl font-bold text-white">
          Ready to break down complex logic?
        </h3>
        <button
          onClick={() =>
            firstQuestId
              ? navigate(`/quest/${firstQuestId}`)
              : navigate('/home')
          }
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-12 rounded-xl transition-all flex justify-center items-center gap-3 shadow-[0_0_20px_rgba(79,70,229,0.3)] text-lg"
        >
          Start CTE Quests ➔
        </button>
      </div>
    </div>
  );
};

const STUDY_TOPICS = [
  {
    title: 'UNION vs UNION ALL',
    concept: 'Combining Result Sets',
    description:
      'Both stack the results of two queries on top of each other. The difference though is in the performance and duplicates.',
    details:
      "When you are using the UNION keyword, you are telling SQL first to consider the result of two different queries and then you are telling SQL to remove any duplicate rows. So lets say you are looking at a coffee sales table and you run a query that returns a row: ('John', 'Espresso'). Then you also consider a snack sales table which returns a row: ('John', 'Cupcake'). When you take the two queries and UNION them, SQL is going to remove any duplicates, so for the mentioned rows, you would get ('John','Espresso','Cupcake'). NOTICE how we did not get 'John' twice even though it was present in both queries!! UNION ALL however does not take into account the possibility of duplicates existing and just returns the results of both queries as they are. Now lets say you are in an interview and get asked what to use, UNION or UNION ALL, if there is a gurantee of no duplicates being present in both queries/tables. In this case, you might think it does not matter which one you utilize, but the correct response is UNION ALL. This is because if you use UNION, it will still require time and resources to check if there are duplicates present, whereas UNION ALL does not need to. It is more efficient in this case.",
    syntax:
      '-- UNION ALL (Faster)\nSELECT name FROM nyc_rentals\nUNION ALL\nSELECT name FROM nj_rentals;\n\n-- UNION (Slower, removes duplicates)\nSELECT category FROM coffee_sales\nUNION\nSELECT category FROM snack_sales;',
  },
  {
    title: 'INNER vs LEFT JOIN',
    concept: 'Table Relationships',
    description: "The 'Strict Bouncer' vs the 'Safe Keeper'.",
    details:
      'An INNER JOIN cares only about whatever is matching in two tables and returns a corresponding result. On the other hand, a LEFT JOIN returns all the columns of the left table and whatever is matching with the right table. For the columns of the right table that are not matching with the left table, the values are placed as NULL. ',
    syntax:
      '-- Only customers with orders\nSELECT * FROM customers\nINNER JOIN orders ON c.id = o.cust_id;\n\n-- All customers, even window shoppers\nSELECT * FROM customers\nLEFT JOIN orders ON c.id = o.cust_id;',
  },
  {
    title: 'The Accidental INNER JOIN',
    concept: 'The LEFT JOIN Trap',
    description:
      'How a WHERE clause can secretly destroy your LEFT JOIN logic.',
    details:
      "Lets say you LEFT JOIN two tables, but then add a WHERE clause that filters for a specific value in the right table. What happens? Well the LEFT JOIN returns a particular result, where some rows are NULL, but then the WHERE clause would filter out these NULL values since NULL values don't meet the WHERE criteria. As such, what you just did is basically turn a LEFT JOIN into an INNER JOIN. This is why it is advised that when you are perfoming a LEFT JOIN and you have a WHERE clause that targets the right table specifically, move the logic from the WHERE clause to the ON clause of the LEFT JOIN!",
    syntax:
      "-- WRONG: Turns it into an INNER JOIN\nSELECT * FROM users\nLEFT JOIN subs ON u.id = s.user_id\nWHERE s.plan = 'Premium';\n\n-- RIGHT: Keeps it a LEFT JOIN\nSELECT * FROM users\nLEFT JOIN subs ON u.id = s.user_id AND s.plan = 'Premium';",
  },
  {
    title: 'Finding Missing Records',
    concept: 'Anti-Joins',
    description: 'Identifying orphans (e.g., users who never bought anything).',
    details:
      'There are two main ways to do this. You can use a LEFT JOIN and filter for WHERE [id] IS NULL, or use NOT EXISTS. In many modern databases (like PostgreSQL), NOT EXISTS is often more readable and sometimes faster.',
    syntax:
      '-- Option A: The LEFT JOIN method\nSELECT name FROM users\nLEFT JOIN orders ON users.id = orders.user_id\nWHERE orders.id IS NULL;\n\n-- Option B: The NOT EXISTS method\nSELECT name FROM users\nWHERE NOT EXISTS (SELECT 1 FROM orders WHERE user_id = users.id);',
  },
  {
    title: 'SELECT DISTINCT vs GROUP BY',
    concept: 'Deduplication',
    description:
      'When to use each for unique lists (lists which are guaranteed to have no duplicates).',
    details:
      'It is important to understand that when we have a unique list/table, both SELECT DISTINCT and GROUP BY in their simplistic forms will return the same result. Why? Well as you know SELECT DISTINCT will remove any duplicates and if there are no duplicates to begin with, the list will be returned as it was in the beginning. Now for GROUP BY. If everything in the list is unique, this means that no more than 1 item or row will be in a particular group or category. This is why if you do use GROUP BY on a particular column, where everything in the column is unique, you would get returned the list as it was in the beginning! BUT when you are considering what to use for lists or tables that have no duplicates: use SELECT DISTINCT for simple deduplication and use GROUP BY when you also have to consider an aggregation (SUM, AVERAGE, MAX, etc...).',
    syntax:
      '-- Use DISTINCT for unique names\nSELECT DISTINCT category FROM inventory;\n\n-- Use GROUP BY for counts\nSELECT category, COUNT(*) FROM inventory GROUP BY category;',
  },
  {
    title: 'FULL OUTER JOIN',
    concept: 'The Ultimate Connection',
    description: 'Finding non-matches on both sides.',
    details:
      "A FULL OUTER JOIN is rare but powerful. It returns all records when there is a match in either left or right table records. It is the best tool for identifying 'orphan' records on both sides of a relationship simultaneously. Another way to think of a FULL OUTER JOIN is basically performing both a LEFT JOIN and a RIGHT JOIN simulataneously. This way you will see the entire columns of the left table and whatever is matching in the right table AND you will also see entire columns of the right table and whatever is matching in the left table. This is why you can easily identify orphan records, records or rows that are present in one table but not the other!",
    syntax:
      'SELECT * FROM contractors\nFULL OUTER JOIN projects\nON contractors.id = projects.lead_id;',
  },
  {
    title: 'Window Functions (ROW_NUMBER)',
    concept: 'Advanced Ranking',
    description: 'Numbering rows uniquely.',
    details:
      "The ROW_NUMBER() window function allows you to number or rank each row in a particular table. It is very useful for ranking items based on a condition. One key thing to note is that ROW_NUMBER() ensures that the numbering of rows occurs in an increasing and sequential manner. You can see in the example below that we gave each row a corresponding rank using ROW_NUMBER() and this is denoted by the 'rank' column. NOTICE how the numbering increases in a sequential and increasing manner (it goes from 1 to 2).\n\nWhen we do the rankings, we also tell SQL two things using the PARTITION and the ORDER BY keywords: we tell SQL to reset the rankings when we consider a different barista AND we tell SQL to give the rankings based on the price of drinks a particular barista sold, so that the highest priced drink gets a rank of 1!! ",
    syntax:
      '-- The Query:\nSELECT barista, drink, price, \nROW_NUMBER() OVER(PARTITION BY barista ORDER BY price DESC) as rank\nFROM coffee_sales;\n\n-- The Output:\n-- barista | drink     | price | rank\n-- ----------------------------------\n-- Alice   | Mocha     | 6.00  | 1\n-- Alice   | Latte     | 5.00  | 2\n-- Bob     | Frappe    | 7.00  | 1\n-- Bob     | Drip      | 3.00  | 2',
  },
  {
    title: 'Handling NULL Values',
    concept: 'Data Integrity',
    description: 'COALESCE and the AVG() trap.',
    details:
      'NULL values can ruin your math. For example, AVG() completely ignores NULL rows, which might artificially inflate your numbers. Use COALESCE(column, 0) to turn those blanks into zeros so your averages remain honest.',
    syntax:
      '-- Treat missing salaries as 0\nSELECT AVG(COALESCE(salary, 0)) FROM employees;',
  },
  {
    title: 'Data Cleaning (TRIM/LOWER)',
    concept: 'Standardization',
    description: 'Fixing messy text entry.',
    details:
      "Databases are only as good as the data entered. TRIM() removes accidental spaces, and LOWER() ensures 'Apple' and 'apple' are treated as the same item. Always use these when joining on text columns.",
    syntax:
      "SELECT * FROM leads\nWHERE LOWER(TRIM(email)) = 'animesh@tech.com';",
  },
];

const FLASHCARDS = [
  {
    q: 'Which is faster: UNION or UNION ALL?',
    a: "UNION ALL. It doesn't waste time checking for duplicates.",
  },
  {
    q: 'What happens if you filter the Right table of a LEFT JOIN in a WHERE clause?',
    a: 'It turns into an INNER JOIN. The NULL rows are filtered out.',
  },
  {
    q: 'What does COALESCE do?',
    a: 'It returns the first non-NULL value. Perfect for replacing blanks with zeros.',
  },
  {
    q: 'When should you use GROUP BY instead of SELECT DISTINCT?',
    a: 'When you need to perform an aggregation (SUM, COUNT, AVG) on the groups.',
  },
  {
    q: "How do you find all 'orphan' records on both sides of a table link?",
    a: 'Use a FULL OUTER JOIN.',
  },
  {
    q: 'Does AVG() include NULL values in its calculation?',
    a: 'No, it ignores them entirely. Use COALESCE to include them as zeros.',
  },
];

const CoreConceptsLesson: React.FC<LessonModuleProps> = ({ onComplete }) => {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const [activeCard, setActiveCard] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="w-full flex flex-col gap-12 pb-32">
      <div className="max-w-3xl">
        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
          Module 8
        </span>
        <h1 className="text-4xl font-black text-white mt-2 mb-6">
          SQL Core Concepts &{' '}
          <span className="text-indigo-400">Interview Prep</span>
        </h1>
        <p className="text-zinc-400 text-lg">
          This is the 'brutally honest' guide to the nuances of SQL. These are
          the concepts that separate junior analysts from the pros.
        </p>
      </div>

      {/* 🌟 ACCORDION GLOSSARY 🌟 */}
      <div className="max-w-5xl flex flex-col gap-4">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
          Concept Glossary
        </h3>
        {STUDY_TOPICS.map((topic, idx) => (
          <div
            key={idx}
            className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/20 transition-all"
          >
            <button
              onClick={() =>
                setOpenAccordion(openAccordion === idx ? null : idx)
              }
              className="w-full p-6 text-left flex justify-between items-center hover:bg-zinc-800/30 transition-colors"
            >
              <div>
                <span className="text-xs font-bold text-indigo-500 uppercase block mb-1">
                  {topic.concept}
                </span>
                <h4 className="text-xl font-bold text-white">{topic.title}</h4>
              </div>
              <span
                className={`text-2xl transition-transform duration-300 ${openAccordion === idx ? 'rotate-45 text-pink-500' : 'text-zinc-600'}`}
              >
                +
              </span>
            </button>

            <AnimatePresence>
              {openAccordion === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-8 pt-0 border-t border-zinc-800/50 flex flex-col gap-6">
                    <p className="text-zinc-300 text-lg leading-relaxed mt-6">
                      {topic.description}
                    </p>
                    <div className="bg-zinc-950/50 p-6 rounded-xl border border-zinc-800 shadow-inner">
                      <h5 className="text-white font-bold mb-2">
                        Concept Explanation:
                      </h5>
                      <p className="text-zinc-400 leading-relaxed">
                        {topic.details}
                      </p>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 italic">
                        Syntax Snippet
                      </h5>
                      <div className="bg-zinc-950 rounded-xl p-6 font-mono text-base text-amber-400 whitespace-pre overflow-x-auto shadow-lg border border-zinc-800">
                        {topic.syntax}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* 🌟 FLASHCARDS SECTION (PURE TAILWIND 3D) 🌟 */}
      <div className="mt-16 max-w-4xl mx-auto w-full flex flex-col items-center gap-8">
        <div className="text-center">
          <h2 className="text-3xl font-black text-white mb-2 italic underline decoration-indigo-500">
            The Flashcard Gauntlet
          </h2>
          <p className="text-zinc-500">
            Click the card to reveal the answer. Can you go 6 for 6?
          </p>
        </div>

        {/* 3D Container using arbitrary perspective value */}
        <div
          className="w-full max-w-md h-72 cursor-pointer [perspective:1000px]"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <motion.div
            className="relative w-full h-full transition-all duration-500 [transform-style:preserve-3d]"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
          >
            {/* Front of Card */}
            <div className="absolute inset-0 bg-indigo-600 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-[0_0_40px_rgba(79,70,229,0.3)] border-2 border-indigo-400 [backface-visibility:hidden]">
              <span className="text-xs font-black text-indigo-200 uppercase tracking-tighter mb-4 opacity-50 italic">
                Question {activeCard + 1} of {FLASHCARDS.length}
              </span>
              <h3 className="text-2xl font-black text-white leading-tight">
                {FLASHCARDS[activeCard].q}
              </h3>
              <div className="mt-8 text-indigo-300 font-bold text-sm animate-pulse italic">
                Tap to flip ↺
              </div>
            </div>

            {/* Back of Card */}
            <div className="absolute inset-0 bg-emerald-600 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-[0_0_40px_rgba(16,185,129,0.3)] border-2 border-emerald-400 [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <span className="text-xs font-black text-emerald-200 uppercase tracking-tighter mb-4 opacity-50 italic underline decoration-emerald-800">
                The Pro Answer
              </span>
              <p className="text-xl font-bold text-white leading-relaxed">
                {FLASHCARDS[activeCard].a}
              </p>
              <div className="mt-8 text-emerald-950 font-black text-sm italic">
                Understood! ➔
              </div>
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            disabled={activeCard === 0}
            onClick={() => {
              setActiveCard((c) => c - 1);
              setIsFlipped(false);
            }}
            className="px-6 py-2 rounded-full bg-zinc-800 text-zinc-400 font-bold disabled:opacity-20 hover:bg-zinc-700 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => {
              if (activeCard === FLASHCARDS.length - 1) {
                onComplete();
              } else {
                setActiveCard((c) => c + 1);
                setIsFlipped(false);
              }
            }}
            className="px-8 py-2 rounded-full bg-white text-black font-black hover:scale-105 transition-transform"
          >
            {activeCard === FLASHCARDS.length - 1
              ? 'Finish Module'
              : 'Next Card'}
          </button>
        </div>
      </div>
    </div>
  );
};
// ==========================================
// 3. THE REGISTRY & HOST
// ==========================================
// ==========================================
// 3. THE REGISTRY & HOST
// ==========================================
const LESSON_REGISTRY: Record<string, React.FC<LessonModuleProps>> = {
  select: SelectLesson,
  where: WhereLesson,
  'order-by': OrderByLesson, // <-- Added hyphen
  'group-by': GroupByLesson, // <-- Added hyphen
  'left-join': LeftJoinLesson, // <-- Added hyphen
  'inner-join': InnerJoinLesson, // <-- Added hyphen
  cte: CteLesson,
  'core-concepts': CoreConceptsLesson, // <-- Added hyphen
};

export default function Lesson() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [firstQuestId, setFirstQuestId] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [category]);

  useEffect(() => {
    const fetchFirstQuest = async () => {
      if (!category) return;
      const { data } = await supabase
        .from('quests')
        .select('id')
        .ilike('category', category)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
      if (data) setFirstQuestId(data.id);
    };
    fetchFirstQuest();
  }, [category]);

  const handleMarkComplete = () => {
    if (category)
      localStorage.setItem(
        `lesson_completed_${category.toUpperCase()}`,
        'true',
      );
  };

  const ActiveLessonComponent = category
    ? LESSON_REGISTRY[category.toLowerCase()]
    : null;

  return (
    /* Top level container - matches the Charcoal Deep Black #111111 */
    <div className="min-h-screen bg-[#111111] text-zinc-300 p-6 md:p-10 flex flex-col gap-8 overflow-y-auto selection:bg-indigo-500/30">
      <div className="w-full max-w-[1200px] mx-auto">
        <button
          onClick={() => navigate('/home')}
          className="text-zinc-500 text-sm font-bold hover:text-white flex items-center gap-2 transition-colors bg-zinc-900/50 border border-zinc-800 px-4 py-2 rounded-lg w-fit"
        >
          ← Back to Curriculum
        </button>
      </div>
      <div className="max-w-[1200px] mx-auto w-full flex-1 flex">
        {ActiveLessonComponent ? (
          <ActiveLessonComponent
            firstQuestId={firstQuestId}
            onComplete={handleMarkComplete}
            navigate={navigate}
          />
        ) : (
          <div className="w-full text-center py-32 border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20 text-zinc-500 text-lg font-mono">
            Module Coming Soon
          </div>
        )}
      </div>
    </div>
  );
}
