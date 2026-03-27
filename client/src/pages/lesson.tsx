import React, { useState, useEffect } from 'react';
import {
  useParams,
  useNavigate,
  type NavigateFunction,
} from 'react-router-dom';
import { supabase } from '../supabase';

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

// ==========================================
// MODULE 1: THE "SELECT" LESSON
// ==========================================
const SelectLesson: React.FC<LessonModuleProps> = ({
  firstQuestId,
  onComplete,
  navigate,
}) => {
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

  return (
    <div className="w-full flex flex-col gap-16 pb-16">
      <div className="max-w-3xl">
        <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">
          Interactive Lesson
        </span>
        <h1 className="text-4xl font-black text-white mt-2 mb-4">
          The SELECT Statement
        </h1>
        <div className="text-slate-300 leading-relaxed space-y-4 text-lg">
          <p>
            The{' '}
            <code className="bg-slate-800 text-blue-400 px-2 py-0.5 rounded font-mono text-sm">
              SELECT
            </code>{' '}
            keyword tells the database <strong>which columns</strong> of data
            you want to look at.
          </p>
        </div>
      </div>
      <hr className="border-slate-800" />
      <div className="w-full flex flex-col xl:flex-row gap-8">
        <div className="w-full xl:w-1/2 flex flex-col gap-4">
          <div className="bg-[#141620] border border-slate-800 rounded-xl p-6 shadow-lg h-full">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <span className="bg-blue-500 text-slate-900 w-6 h-6 rounded-full flex items-center justify-center text-sm">
                1
              </span>{' '}
              Example Problem
            </h2>
            <p className="text-slate-400 mb-6">
              "Return all <strong>order_details</strong> for each customer from
              the <strong>customers</strong> table."
            </p>
            <div className="border border-slate-700/50 rounded-lg overflow-hidden bg-slate-900/20">
              <div className="bg-slate-800/80 px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-700/50">
                Table: customers
              </div>
              <table className="w-full text-left text-sm cursor-pointer">
                <thead className="bg-slate-900/80">
                  <tr>
                    {['cust_id', 'name', 'order_details'].map((col) => (
                      <th
                        key={col}
                        onClick={() => toggleColumn(col)}
                        className={`px-4 py-3 font-mono border-b-2 transition-colors ${selectedColumns.includes(col) ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-transparent text-slate-300 hover:bg-slate-800/50'}`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 opacity-50 pointer-events-none">
                  <tr>
                    <td className="px-4 py-3 font-mono text-xs">101</td>
                    <td className="px-4 py-3 font-mono text-xs">Alice</td>
                    <td className="px-4 py-3 font-mono text-xs">2x Widget A</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="w-full xl:w-1/2 flex flex-col">
          <div
            className={`bg-[#141620] border-2 rounded-xl overflow-hidden flex flex-col flex-1 shadow-lg transition-colors duration-300 ${feedback === 'correct' ? 'border-emerald-500' : feedback === 'wrong' ? 'border-red-500' : 'border-slate-800'}`}
          >
            <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Your Query
              </span>
            </div>
            <div className="p-8 flex-1 bg-[#0f111a] font-mono text-xl flex items-center justify-center">
              <pre className="text-blue-400">
                <span className="text-purple-400">SELECT</span>{' '}
                {selectedColumns.length > 0
                  ? selectedColumns.join(', ')
                  : '...'}{' '}
                <br />
                <span className="text-purple-400">FROM</span>{' '}
                <span className="text-amber-300">customers</span>;
              </pre>
            </div>
            <div className="p-6 border-t border-slate-800 bg-[#141620]">
              {feedback === 'idle' && (
                <button
                  onClick={handleSubmit}
                  disabled={selectedColumns.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-lg transition-all"
                >
                  Submit Query
                </button>
              )}
              {feedback === 'wrong' && (
                <div className="flex flex-col gap-4">
                  <div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/30 text-center font-bold">
                    Not quite!
                  </div>
                  <button
                    onClick={() => setFeedback('idle')}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-lg transition-all"
                  >
                    Try Again
                  </button>
                </div>
              )}
              {feedback === 'correct' && (
                <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-lg border border-emerald-500/30 text-center font-bold">
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
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black py-4 px-12 rounded-lg transition-all flex justify-center items-center gap-2"
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
    const isCorrect =
      selectedCol === step.expected.col &&
      selectedOp === step.expected.op &&
      selectedVal === step.expected.val;

    if (isCorrect) {
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
    <div className="w-full flex flex-col xl:flex-row gap-8">
      <div className="w-full xl:w-1/2 flex flex-col">
        <div
          className={`bg-[#141620] border ${isCompleted ? 'border-emerald-500/30' : 'border-slate-800'} rounded-xl p-6 shadow-lg h-full transition-all`}
        >
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <span
              className={`${isCompleted ? 'bg-emerald-500' : 'bg-amber-500'} text-slate-900 w-6 h-6 rounded-full flex items-center justify-center text-sm font-black transition-colors`}
            >
              {isCompleted ? '✓' : index + 1}
            </span>
            {step.title}
          </h2>
          <p className="text-slate-400 mb-6">{step.prompt}</p>

          <div className="border border-slate-700/50 rounded-lg overflow-hidden bg-slate-900/20">
            <div className="bg-slate-800/80 px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-700/50">
              Table: {step.table}
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/80 border-b border-slate-700/50">
                <tr>
                  {Object.keys(step.data[0]).map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 font-mono text-amber-400/70"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {step.data.map((row, i) => {
                  // 1. Determine if this specific row meets the "Expected" criteria
                  const rowValue = row[step.expected.col];
                  const expectedValue = step.expected.val.replace(/'/g, '');

                  // 2. We only want to fade if the user has successfully run the filter
                  let shouldFade = false;
                  if (feedback === 'correct') {
                    // Logic for various operators
                    if (step.expected.op === '=')
                      shouldFade = String(rowValue) !== expectedValue;
                    if (step.expected.op === '>')
                      shouldFade = Number(rowValue) <= Number(expectedValue);
                    if (step.expected.op === '<')
                      shouldFade = Number(rowValue) >= Number(expectedValue);
                    if (step.expected.op === '>=')
                      shouldFade = Number(rowValue) < Number(expectedValue);
                    if (step.expected.op === '<=')
                      shouldFade = Number(rowValue) > Number(expectedValue);
                  }

                  return (
                    <tr
                      key={i}
                      className={`transition-opacity duration-700 ${shouldFade ? 'opacity-10' : 'opacity-100'}`}
                    >
                      {Object.values(row).map((val, j) => (
                        <td
                          key={j}
                          className="px-4 py-3 font-mono text-xs text-slate-300"
                        >
                          {val}
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

      <div className="w-full xl:w-1/2 flex flex-col">
        <div
          className={`bg-[#141620] border-2 rounded-xl overflow-hidden flex flex-col flex-1 shadow-lg transition-colors duration-300 ${feedback === 'correct' ? 'border-emerald-500' : feedback === 'wrong' ? 'border-red-500' : 'border-slate-800'}`}
        >
          <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Query Builder
            </span>
          </div>

          <div className="p-8 flex-1 bg-[#0f111a] font-mono text-xl flex flex-col justify-center gap-4">
            <div className="text-blue-400">
              <span className="text-purple-400">SELECT</span> * <br />
              <span className="text-purple-400">FROM</span>{' '}
              <span className="text-amber-300">{step.table}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 bg-slate-800/30 p-4 rounded-lg border border-slate-800">
              <span className="text-purple-400">WHERE</span>
              <select
                value={selectedCol}
                onChange={(e) => {
                  setSelectedCol(e.target.value);
                  setFeedback('idle');
                }}
                className="bg-slate-900 border border-slate-700 text-amber-400 text-sm rounded pr-6 pl-2 py-1 outline-none cursor-pointer"
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
                className="bg-slate-900 border border-slate-700 text-pink-400 text-sm rounded pr-6 pl-2 py-1 outline-none cursor-pointer"
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
                className="bg-slate-900 border border-slate-700 text-emerald-400 text-sm rounded pr-6 pl-2 py-1 outline-none cursor-pointer"
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
          </div>

          <div className="p-6 border-t border-slate-800 bg-[#141620]">
            {feedback === 'idle' && (
              <button
                onClick={handleSubmit}
                disabled={!selectedCol || !selectedOp || !selectedVal}
                className="w-full bg-amber-600 disabled:bg-slate-800 disabled:text-slate-500 hover:bg-amber-500 text-white font-bold py-4 rounded-lg transition-all"
              >
                Run Filter
              </button>
            )}
            {feedback === 'wrong' && (
              <div className="flex flex-col gap-4">
                <div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/30 text-center font-bold">
                  Not quite! Check your logic and try again.
                </div>
                <button
                  onClick={handleReset}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-lg transition-all"
                >
                  Reset Builder
                </button>
              </div>
            )}
            {feedback === 'correct' && (
              <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-lg border border-emerald-500/30 text-center font-bold">
                Great logic! Filter applied successfully.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const WhereLesson: React.FC<LessonModuleProps> = ({
  firstQuestId,
  onComplete,
  navigate,
}) => {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const LESSON_STEPS: WhereStepData[] = [
    {
      title: '1. Exact Matching (=)',
      prompt: "Find the user named 'Animesh' in our system logs.",
      table: 'users',
      data: [
        { id: 1, name: 'Animesh', role: 'Instructor' },
        { id: 2, name: 'Alice', role: 'Student' },
        { id: 3, name: 'Bob', role: 'Student' },
      ],
      options: {
        cols: ['id', 'name', 'role'],
        ops: ['=', '>', '<'],
        vals: ['1', "'Animesh'", "'Instructor'"],
      },
      expected: { col: 'name', op: '=', val: "'Animesh'" },
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
        'The landlord needs to see units where the rent is at least $3000 (3000 or more).',
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
  ];

  const handleStepComplete = (index: number) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);
      if (newSet.size === LESSON_STEPS.length) onComplete();
      return newSet;
    });
  };

  return (
    <div className="w-full flex flex-col gap-16 pb-32">
      <div className="max-w-3xl">
        <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
          Interactive Lesson
        </span>
        <h1 className="text-4xl font-black text-white mt-2 mb-4">
          The WHERE Clause
        </h1>
        <p className="text-slate-300 text-lg leading-relaxed">
          The{' '}
          <code className="bg-slate-800 text-amber-400 px-2 py-0.5 rounded font-mono text-sm">
            WHERE
          </code>{' '}
          clause acts as a filter. While `SELECT` picks your{' '}
          <strong>vertical</strong> columns, `WHERE` filters out your{' '}
          <strong>horizontal</strong> rows based on certain conditions.
        </p>
      </div>

      {LESSON_STEPS.map((step, index) => (
        <React.Fragment key={index}>
          <hr className="border-slate-800" />
          <InteractiveWhereExample
            step={step}
            index={index}
            onPass={() => handleStepComplete(index)}
            isCompleted={completedSteps.has(index)}
          />
        </React.Fragment>
      ))}

      <div className="mt-12 flex flex-col items-center gap-6">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
        <h3 className="text-xl font-bold text-white">Lesson Complete?</h3>
        <button
          onClick={() =>
            firstQuestId
              ? navigate(`/quest/${firstQuestId}`)
              : navigate('/home')
          }
          className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-5 px-16 rounded-xl transition-all flex justify-center items-center gap-3 shadow-[0_0_30px_rgba(245,158,11,0.25)]"
        >
          Enter the Arena: Start WHERE Quests ➔
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 3. THE REGISTRY & HOST
// ==========================================
const LESSON_REGISTRY: Record<string, React.FC<LessonModuleProps>> = {
  select: SelectLesson,
  where: WhereLesson,
};

export default function Lesson() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [firstQuestId, setFirstQuestId] = useState<string | null>(null);

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
    <div className="min-h-screen bg-[#0f111a] text-slate-100 p-6 flex flex-col gap-6 overflow-y-auto">
      <div className="w-full max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/home')}
          className="text-slate-500 text-sm font-bold hover:text-white flex items-center gap-2 transition-colors"
        >
          ← Back to Curriculum
        </button>
      </div>
      <div className="max-w-6xl mx-auto w-full flex-1 flex">
        {ActiveLessonComponent ? (
          <ActiveLessonComponent
            firstQuestId={firstQuestId}
            onComplete={handleMarkComplete}
            navigate={navigate}
          />
        ) : (
          <div className="w-full text-center py-20 border-2 border-dashed border-slate-800 rounded-xl">
            Module Coming Soon
          </div>
        )}
      </div>
    </div>
  );
}
