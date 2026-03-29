import React, { useState, useEffect } from 'react';
import {
  useParams,
  useNavigate,
  type NavigateFunction,
} from 'react-router-dom';
import { supabase } from '../supabase';
import { motion } from 'framer-motion';

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
                  const rowValue = row[step.expected.col];
                  const expectedValue = step.expected.val.replace(/'/g, '');
                  let shouldFade = false;
                  if (feedback === 'correct') {
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
                className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-white font-bold py-4 rounded-lg transition-all"
              >
                Run Filter
              </button>
            )}
            {feedback === 'wrong' && (
              <div className="flex flex-col gap-4">
                <div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/30 text-center font-bold">
                  Not quite! Check your logic.
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
          <strong>vertical</strong> columns, `WHERE` picks your{' '}
          <strong>horizontal</strong> rows.
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
    <div className="w-full flex flex-col xl:flex-row gap-8">
      <div className="w-full xl:w-1/2 flex flex-col">
        <div
          className={`bg-[#141620] border ${isCompleted ? 'border-pink-500/30' : 'border-slate-800'} rounded-xl p-6 shadow-lg h-full transition-all`}
        >
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <span
              className={`${isCompleted ? 'bg-pink-500 text-white' : 'bg-pink-400 text-slate-900'} w-6 h-6 rounded-full flex items-center justify-center text-sm font-black transition-colors`}
            >
              {isCompleted ? '✓' : index + 1}
            </span>
            {step.title}
          </h2>
          <p className="text-slate-400 mb-6">{step.prompt}</p>

          <div className="border border-slate-700/50 rounded-lg overflow-hidden bg-slate-900/20">
            <div className="bg-slate-800/80 px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-700/50">
              Table: apartments
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/80 border-b border-slate-700/50">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 font-mono text-pink-400/70"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {currentData.map((row) => (
                  <motion.tr
                    layout
                    key={row.unit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    {columns.map((col, j) => (
                      <td
                        key={j}
                        className="px-4 py-3 font-mono text-xs text-slate-300"
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
              <span className="text-pink-300">apartments</span>
            </div>

            <div className="flex flex-col gap-3 bg-slate-800/30 p-4 rounded-lg border border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-purple-400">ORDER BY</span>
                <select
                  value={selectedCol1}
                  onChange={(e) => {
                    setSelectedCol1(e.target.value);
                    setFeedback('idle');
                  }}
                  className="bg-slate-900 border border-slate-700 text-pink-400 text-sm rounded pr-6 pl-2 py-1 outline-none cursor-pointer"
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
                  className="bg-slate-900 border border-slate-700 text-emerald-400 text-sm rounded pr-6 pl-2 py-1 outline-none cursor-pointer"
                >
                  <option value="" disabled>
                    direction
                  </option>
                  <option value="ASC">ASC</option>
                  <option value="DESC">DESC</option>
                </select>
              </div>
              {step.isMulti && (
                <div className="flex flex-wrap items-center gap-2 ml-4">
                  <span className="text-slate-500">,</span>
                  <select
                    value={selectedCol2}
                    onChange={(e) => {
                      setSelectedCol2(e.target.value);
                      setFeedback('idle');
                    }}
                    className="bg-slate-900 border border-slate-700 text-pink-400 text-sm rounded pr-6 pl-2 py-1 outline-none cursor-pointer"
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
                    className="bg-slate-900 border border-slate-700 text-emerald-400 text-sm rounded pr-6 pl-2 py-1 outline-none cursor-pointer"
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

          <div className="p-6 border-t border-slate-800 bg-[#141620]">
            {feedback === 'idle' && (
              <button
                onClick={handleSubmit}
                disabled={
                  !selectedCol1 ||
                  !selectedDir1 ||
                  (step.isMulti && (!selectedCol2 || !selectedDir2))
                }
                className="w-full bg-pink-600 hover:bg-pink-500 disabled:bg-slate-800 text-white font-bold py-4 rounded-lg transition-all"
              >
                Run Sort
              </button>
            )}
            {feedback === 'wrong' && (
              <div className="flex flex-col gap-4">
                <div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/30 text-center font-bold">
                  Not quite! Check your logic.
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
  firstQuestId,
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
        <span className="text-xs font-bold text-pink-500 uppercase tracking-widest">
          Interactive Lesson
        </span>
        <h1 className="text-4xl font-black text-white mt-2 mb-6">
          The ORDER BY Clause
        </h1>

        <div className="text-slate-300 leading-relaxed space-y-5 text-lg">
          <p>
            Think of your database table like a massive online store. You
            already know how to use `SELECT` to pick your vertical columns (like
            'Product' and 'Price'), and `WHERE` to filter your horizontal rows
            (like keeping only 'Category = Shoes'). But right now, those shoes
            are displayed in a completely random order!
          </p>
          <p>
            That is where{' '}
            <code className="bg-slate-800 text-pink-400 px-2 py-0.5 rounded font-mono text-sm">
              ORDER BY
            </code>{' '}
            comes in. It takes your remaining rows and physically ranks them,
            exactly like changing the "Sort By" dropdown on a website to
            organize items by "Price: Low to High" or "Alphabetical: A to Z."
          </p>

          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 mt-6">
            <h3 className="text-white font-bold mb-3">The Two Directions:</h3>
            <ul className="space-y-4 text-base">
              <li className="flex items-start gap-3">
                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-bold font-mono mt-0.5">
                  ASC
                </span>
                <div>
                  <strong className="text-white block">
                    Ascending (Going Up)
                  </strong>
                  Sorts numbers from smallest to largest (1 to 10), and words
                  alphabetically (A to Z). If you don't type a direction, SQL
                  will automatically use this default.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-pink-500/20 text-pink-400 px-2 py-1 rounded text-xs font-bold font-mono mt-0.5">
                  DESC
                </span>
                <div>
                  <strong className="text-white block">
                    Descending (Going Down)
                  </strong>
                  Sorts numbers from largest to smallest (10 to 1), and words
                  backwards (Z to A). This is essential for building things like
                  "Top 10" leaderboards or finding the most expensive items.
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

      {LESSON_STEPS.map((step, index) => (
        <React.Fragment key={index}>
          <hr className="border-slate-800" />
          <InteractiveOrderByExample
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
          className="bg-pink-500 hover:bg-pink-400 text-slate-900 font-black py-5 px-16 rounded-xl transition-all flex justify-center items-center gap-3 shadow-[0_0_30px_rgba(236,72,153,0.25)]"
        >
          Enter the Arena: Start ORDER BY Quests ➔
        </button>
      </div>
    </div>
  );
};
// ==========================================
// MODULE 4: THE "GROUP BY" & AGGREGATE LESSON
// ==========================================

const COFFEE_SALES_DATA: Record<string, string | number>[] = [
  {
    transaction_id: 101,
    drink: 'Latte',
    category: 'Espresso',
    price: 5,
    quantity: 2,
    barista: 'Alice',
  },
  {
    transaction_id: 102,
    drink: 'Cold Brew',
    category: 'Coffee',
    price: 6,
    quantity: 1,
    barista: 'Bob',
  },
  {
    transaction_id: 103,
    drink: 'Latte',
    category: 'Espresso',
    price: 5,
    quantity: 1,
    barista: 'Charlie',
  },
  {
    transaction_id: 104,
    drink: 'Green Tea',
    category: 'Tea',
    price: 4,
    quantity: 3,
    barista: 'Alice',
  },
  {
    transaction_id: 105,
    drink: 'Drip',
    category: 'Coffee',
    price: 3,
    quantity: 1,
    barista: 'Bob',
  },
  {
    transaction_id: 106,
    drink: 'Mocha',
    category: 'Espresso',
    price: 6,
    quantity: 2,
    barista: 'Charlie',
  },
];

interface AggStepData {
  title: string;
  prompt: string;
  type: 'agg' | 'groupby';
  expected: { aggFunc: string; col: string; groupByCol?: string };
}

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
      isCorrect = isCorrect && selectedGroupCol === step.expected.groupByCol;
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

      // 🌟 UPDATED: Use Math.round to match the "ROUND()" behavior
      if (step.expected.aggFunc === 'AVG') {
        const sum = values.reduce((a, b) => a + b, 0);
        result = Math.round(sum / values.length);
      }

      if (step.expected.aggFunc === 'MAX') result = Math.max(...values);
      if (step.expected.aggFunc === 'MIN') result = Math.min(...values);

      // 🌟 UPDATED: Change the key name to "round" for AVG to match the prompt
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

        // 🌟 UPDATED: Use Math.round here too
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
      {/* Left Column: Context & Table */}
      <div className="w-full xl:w-1/2 flex flex-col gap-4">
        <div
          className={`bg-[#141620] border ${isCompleted ? 'border-purple-500/30' : 'border-slate-800'} rounded-xl p-6 shadow-lg transition-all`}
        >
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <span
              className={`${isCompleted ? 'bg-purple-500 text-white' : 'bg-purple-400 text-slate-900'} w-6 h-6 rounded-full flex items-center justify-center text-sm font-black transition-colors`}
            >
              {isCompleted ? '✓' : index + 1}
            </span>
            {step.title}
          </h2>
          <p className="text-slate-400 mb-6">{step.prompt}</p>

          <div className="border border-slate-700/50 rounded-lg overflow-hidden bg-slate-900/20">
            <div className="bg-slate-800/80 px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-700/50">
              Raw Table: coffee_sales
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/80 border-b border-slate-700/50">
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="px-4 py-2 font-mono text-purple-400/70 whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody
                  className={`divide-y divide-slate-800/50 transition-opacity duration-700 ${feedback === 'correct' ? 'opacity-20' : 'opacity-100'}`}
                >
                  {COFFEE_SALES_DATA.map((row, i) => (
                    <tr key={i}>
                      {columns.map((col, j) => (
                        <td
                          key={j}
                          className="px-4 py-2 font-mono text-xs text-slate-300 whitespace-nowrap"
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

        {/* Dynamic Output Box */}
        {outputData && (
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 animate-in fade-in slide-in-from-top-4">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">
              SQL Output Result
            </h3>
            <div className="border border-purple-500/20 rounded-lg overflow-hidden bg-slate-900/50">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900/80 border-b border-purple-500/20">
                    <tr>
                      {Object.keys(outputData[0]).map((col) => (
                        <th
                          key={col}
                          className="px-4 py-2 font-mono text-purple-300 whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-500/10">
                    {outputData.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val, j) => (
                          <td
                            key={j}
                            className="px-4 py-2 font-mono text-xs text-white font-bold whitespace-nowrap"
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

      {/* Right Column: Query Builder */}
      {/* Right Column: Query Builder */}
      <div className="w-full xl:w-1/2 flex flex-col">
        <div
          className={`bg-[#141620] border-2 rounded-xl overflow-hidden flex flex-col h-full shadow-lg transition-colors duration-300 ${feedback === 'correct' ? 'border-emerald-500' : feedback === 'wrong' ? 'border-red-500' : 'border-slate-800'}`}
        >
          <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Query Builder
            </span>
          </div>
          <div className="p-8 flex-1 bg-[#0f111a] font-mono text-xl flex flex-col justify-center gap-5">
            {/* SELECT ROW */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
              <span className="text-purple-400">SELECT</span>

              {/* Dynamically mirror the GROUP BY column seamlessly */}
              {step.type === 'groupby' && (
                <>
                  <span className="text-pink-400">
                    {selectedGroupCol || 'group_col'}
                  </span>
                  <span className="text-slate-500">,</span>
                </>
              )}

              <div className="flex items-center gap-1">
                <select
                  value={selectedAgg}
                  onChange={(e) => {
                    setSelectedAgg(e.target.value);
                    setFeedback('idle');
                  }}
                  className="bg-slate-900 border border-slate-700 text-emerald-400 text-sm rounded px-2 py-1 outline-none cursor-pointer"
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
                <span className="text-slate-500 font-bold">(</span>
                <select
                  value={selectedCol}
                  onChange={(e) => {
                    setSelectedCol(e.target.value);
                    setFeedback('idle');
                  }}
                  className="bg-slate-900 border border-slate-700 text-purple-300 text-sm rounded px-2 py-1 outline-none cursor-pointer"
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
                <span className="text-slate-500 font-bold">)</span>
              </div>
            </div>

            {/* FROM ROW */}
            <div className="text-purple-400">
              FROM <span className="text-purple-300">coffee_sales</span>
            </div>

            {/* GROUP BY ROW */}
            {step.type === 'groupby' && (
              <div className="flex flex-wrap items-center gap-2 mt-2 bg-slate-800/30 p-4 rounded-lg border border-slate-800">
                <span className="text-purple-400">GROUP BY</span>
                <select
                  value={selectedGroupCol}
                  onChange={(e) => {
                    setSelectedGroupCol(e.target.value);
                    setFeedback('idle');
                  }}
                  className="bg-slate-900 border border-slate-700 text-pink-400 text-sm rounded px-2 py-1 outline-none cursor-pointer"
                >
                  <option value="" disabled>
                    group_col
                  </option>
                  {columns.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-800 bg-[#141620]">
            {feedback === 'idle' && (
              <button
                onClick={handleSubmit}
                disabled={
                  !selectedAgg ||
                  !selectedCol ||
                  (step.type === 'groupby' && !selectedGroupCol)
                }
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white font-bold py-4 rounded-lg transition-all"
              >
                Run Aggregation
              </button>
            )}
            {feedback === 'wrong' && (
              <div className="flex flex-col gap-4">
                <div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/30 text-center font-bold">
                  Incorrect syntax. Check your logic.
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
                Calculation successful! Check the output table.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
const GroupByLesson: React.FC<LessonModuleProps> = ({
  firstQuestId,
  onComplete,
  navigate,
}) => {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // PART 1: The Aggregate Functions (3 Examples Each + Syntax + Returns)
  const AGG_SECTIONS = [
    {
      func: 'COUNT()',
      desc: 'Counts the number of rows that contain data. Great for finding total transactions or total employees.',
      syntax: 'SELECT COUNT(column_name) FROM table_name;',
      returns: 'A single number representing the total tally of rows.',
      steps: [
        {
          title: 'Count Total Transactions',
          prompt:
            'Use COUNT on the transaction_id to see how many total sales occurred.',
          type: 'agg' as const,
          expected: { aggFunc: 'COUNT', col: 'transaction_id' },
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
      syntax: 'SELECT SUM(column_name) FROM table_name;',
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
            "You wouldn't normally do this in real life, but use SUM on transaction_id just to prove it adds the numbers together!",
          type: 'agg' as const,
          expected: { aggFunc: 'SUM', col: 'transaction_id' },
        },
      ],
    },
    {
      func: 'AVG()',
      desc: 'Calculates the mathematical average of a column. Perfect for finding the average order value.',
      syntax: 'SELECT AVG(column_name) FROM table_name;',
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
            'Again, silly in the real world, but test your logic by finding the AVG of the transaction_id.',
          type: 'agg' as const,
          expected: { aggFunc: 'AVG', col: 'transaction_id' },
        },
      ],
    },
    {
      func: 'MAX()',
      desc: 'Finds the absolute highest value in a column. Use this to find the most expensive item or highest score.',
      syntax: 'SELECT MAX(column_name) FROM table_name;',
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
            'Find the most recent transaction by running MAX on the transaction_id.',
          type: 'agg' as const,
          expected: { aggFunc: 'MAX', col: 'transaction_id' },
        },
      ],
    },
    {
      func: 'MIN()',
      desc: 'Finds the absolute lowest value in a column. Used for finding the cheapest item or oldest date.',
      syntax: 'SELECT MIN(column_name) FROM table_name;',
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
            'Find the very first transaction recorded by running MIN on the transaction_id.',
          type: 'agg' as const,
          expected: { aggFunc: 'MIN', col: 'transaction_id' },
        },
      ],
    },
  ];

  // PART 2: The GROUP BY Function (2 Examples Each + Syntax + Returns)
  const GROUP_BY_SECTIONS = [
    {
      func: 'GROUP BY + COUNT()',
      desc: 'Group your data into categories, then counts the rows inside each category.',
      syntax:
        'SELECT category_col, COUNT(data_col) FROM table_name GROUP BY category_col;',
      returns:
        'A two-column summary table: Column 1 shows the unique categories, Column 2 shows the tally for each.',
      steps: [
        {
          title: 'Transactions per Category',
          prompt:
            'How many sales happened in each category? COUNT the transaction_ids, and GROUP BY category.',
          type: 'groupby' as const,
          expected: {
            aggFunc: 'COUNT',
            col: 'transaction_id',
            groupByCol: 'category',
          },
        },
        {
          title: 'Drinks Made by Barista',
          prompt:
            'How many drinks did each barista make? COUNT the drink column, and GROUP BY barista.',
          type: 'groupby' as const,
          expected: { aggFunc: 'COUNT', col: 'drink', groupByCol: 'barista' },
        },
      ],
    },
    {
      func: 'GROUP BY + SUM()',
      desc: 'Buckets your data, then adds up the numbers in each bucket.',
      syntax:
        'SELECT category_col, SUM(data_col) FROM table_name GROUP BY category_col;',
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
      syntax:
        'SELECT category_col, AVG(data_col) FROM table_name GROUP BY category_col;',
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
      syntax:
        'SELECT category_col, MAX(data_col) FROM table_name GROUP BY category_col;',
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
      syntax:
        'SELECT category_col, MIN(data_col) FROM table_name GROUP BY category_col;',
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
        <span className="text-xs font-bold text-purple-500 uppercase tracking-widest">
          Interactive Lesson
        </span>
        <h1 className="text-4xl font-black text-white mt-2 mb-6">
          Aggregations & GROUP BY
        </h1>

        <div className="text-slate-300 leading-relaxed space-y-5 text-lg">
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
          <div className="mb-8 border-l-4 border-purple-500 pl-6">
            <h2 className="text-2xl font-black text-white font-mono">
              {section.func}
            </h2>
            <p className="text-slate-400 mt-2">{section.desc}</p>
            {/* 🌟 NEW SYNTAX BLOCK */}
            <div className="mt-4 bg-[#0f111a] border border-slate-700/50 py-2 px-4 rounded-lg inline-block shadow-inner">
              <code className="text-purple-300 font-mono text-sm">
                {section.syntax}
              </code>
            </div>
            {/* 🌟 NEW RETURNS BLOCK */}
            <p className="text-sm text-slate-400 mt-3 italic flex items-center gap-2">
              <span className="text-purple-500">↳</span>{' '}
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

      {/* MIDPOINT EXPLANATION */}
      <div className="max-w-3xl mt-16 mb-8 py-8 border-y border-slate-800">
        <h1 className="text-4xl font-black text-white mb-6">
          Enter: The GROUP BY Clause
        </h1>
        <div className="text-slate-300 leading-relaxed space-y-5 text-lg">
          <p>
            You just learned how to crush an entire table into a single number.
            But what if you own a Coffee Shop and want to know the total revenue{' '}
            <strong>per Barista</strong>? You don't want one giant number; you
            want separate numbers for Alice, Bob, and Charlie.
          </p>
          <p>
            By adding{' '}
            <code className="bg-slate-800 text-pink-400 px-2 py-0.5 rounded font-mono text-sm">
              GROUP BY
            </code>{' '}
            to your query, SQL will sort your data into groups first, and{' '}
            <em>then</em> run the aggregate math on each group independently!
          </p>
          <p>
            Tip: Whenever you see the words{' '}
            <strong>'per', 'each', 'for each', or 'by'</strong> in a sql
            problem, it means you have to use GROUP BY!{' '}
          </p>
        </div>
      </div>

      {/* RENDER PART 2: GROUP BY */}
      {GROUP_BY_SECTIONS.map((section, sIdx) => (
        <div key={`gb-sec-${sIdx}`} className="mt-8">
          <div className="mb-8 border-l-4 border-pink-500 pl-6">
            <h2 className="text-2xl font-black text-white font-mono">
              {section.func}
            </h2>
            <p className="text-slate-400 mt-2">{section.desc}</p>
            {/* 🌟 NEW SYNTAX BLOCK */}
            <div className="mt-4 bg-[#0f111a] border border-slate-700/50 py-2 px-4 rounded-lg inline-block shadow-inner">
              <code className="text-pink-300 font-mono text-sm">
                {section.syntax}
              </code>
            </div>
            {/* 🌟 NEW RETURNS BLOCK */}
            <p className="text-sm text-slate-400 mt-3 italic flex items-center gap-2">
              <span className="text-pink-500">↳</span> <strong>Returns:</strong>{' '}
              {section.returns}
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
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
        <h3 className="text-xl font-bold text-white">
          Massive Lesson Complete!
        </h3>
        <button
          onClick={() =>
            firstQuestId
              ? navigate(`/quest/${firstQuestId}`)
              : navigate('/home')
          }
          className="bg-purple-500 hover:bg-purple-400 text-slate-900 font-black py-5 px-16 rounded-xl transition-all flex justify-center items-center gap-3 shadow-[0_0_30px_rgba(168,85,247,0.25)]"
        >
          Enter the Arena: Start GROUP BY Quests ➔
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 1. THE MOCK DATA FOR THE 3 EXAMPLES
// ==========================================
// ==========================================
// 1. THE MOCK DATA FOR THE 5 EXAMPLES
// ==========================================
// ==========================================
// 1. THE MOCK DATA FOR THE 6 EXAMPLES
// ==========================================
const JOIN_EXAMPLES = [
  {
    title: "Customers and Food Orders",
    prompt: "Let's connect our customers to their food orders. Link the tables using the column they both share.",
    selectText: "*",
    leftTable: {
      name: "customers",
      columns: ["customer_id", "name"],
      data: [
        { customer_id: 1, name: 'Alice' },
        { customer_id: 2, name: 'Bob' },
        { customer_id: 3, name: 'Charlie' }
      ]
    },
    rightTable: {
      name: "orders",
      columns: ["order_id", "customer_id", "food"],
      data: [
        { order_id: 101, customer_id: 1, food: 'Pizza' },
        { order_id: 102, customer_id: 3, food: 'Burger' }
      ]
    },
    expectedLeft: "customer_id",
    expectedRight: "customer_id",
    outputData: [
      { customer_id: 1, name: 'Alice', order_id: 101, food: 'Pizza' },
      { customer_id: 2, name: 'Bob', order_id: 'NULL', food: 'NULL' },
      { customer_id: 3, name: 'Charlie', order_id: 102, food: 'Burger' }
    ]
  },
  {
    title: "Employees and Departments",
    prompt: "Connect the employees to their departments. New hires without a department will show up with blank values!",
    selectText: "*",
    leftTable: {
      name: "employees",
      columns: ["emp_id", "name"],
      data: [
        { emp_id: 1, name: 'Sarah' },
        { emp_id: 2, name: 'John' },
        { emp_id: 3, name: 'David' }
      ]
    },
    rightTable: {
      name: "departments",
      columns: ["dept_id", "emp_id", "dept_name"],
      data: [
        { dept_id: 80, emp_id: 1, dept_name: 'Sales' },
        { dept_id: 81, emp_id: 3, dept_name: 'Engineering' }
      ]
    },
    expectedLeft: "emp_id",
    expectedRight: "emp_id",
    outputData: [
      { emp_id: 1, name: 'Sarah', dept_id: 80, dept_name: 'Sales' },
      { emp_id: 2, name: 'John', dept_id: 'NULL', dept_name: 'NULL' },
      { emp_id: 3, name: 'David', dept_id: 81, dept_name: 'Engineering' }
    ]
  },
  {
    title: "Products and Reviews",
    prompt: "Link the products to their reviews. Products with no reviews will still appear on the list.",
    selectText: "*",
    leftTable: {
      name: "products",
      columns: ["product_id", "product_name"],
      data: [
        { product_id: 1, product_name: 'Laptop' },
        { product_id: 2, product_name: 'Monitor' },
        { product_id: 3, product_name: 'Keyboard' }
      ]
    },
    rightTable: {
      name: "reviews",
      columns: ["review_id", "product_id", "rating"],
      data: [
        { review_id: 901, product_id: 1, rating: 5 },
        { review_id: 902, product_id: 3, rating: 4 }
      ]
    },
    expectedLeft: "product_id",
    expectedRight: "product_id",
    outputData: [
      { product_id: 1, product_name: 'Laptop', review_id: 901, rating: 5 },
      { product_id: 2, product_name: 'Monitor', review_id: 'NULL', rating: 'NULL' },
      { product_id: 3, product_name: 'Keyboard', review_id: 902, rating: 4 }
    ]
  },
  {
    title: "Library Books (Specific Columns)",
    prompt: "Let's clean up our output. Instead of SELECT *, this query explicitly asks for just the book title and its due date. Link the tables to see the clean report!",
    selectText: "books.title, checkouts.due_date",
    leftTable: {
      name: "books",
      columns: ["book_id", "title"],
      data: [
        { book_id: 1, title: 'Dune' },
        { book_id: 2, title: '1984' },
        { book_id: 3, title: 'Foundation' }
      ]
    },
    rightTable: {
      name: "checkouts",
      columns: ["checkout_id", "book_id", "due_date"],
      data: [
        { checkout_id: 55, book_id: 1, due_date: 'Oct 12' },
        { checkout_id: 56, book_id: 3, due_date: 'Oct 15' }
      ]
    },
    expectedLeft: "book_id",
    expectedRight: "book_id",
    outputData: [
      { title: 'Dune', due_date: 'Oct 12' },
      { title: '1984', due_date: 'NULL' },
      { title: 'Foundation', due_date: 'Oct 15' }
    ]
  },
  {
    title: "Clinic Schedule (Specific Columns)",
    prompt: "We just want the doctor's name and the patient they are seeing. No extra IDs! Build the bridge to generate the schedule.",
    selectText: "doctors.doc_name, appointments.patient",
    leftTable: {
      name: "doctors",
      columns: ["doc_id", "doc_name"],
      data: [
        { doc_id: 1, doc_name: 'Dr. House' },
        { doc_id: 2, doc_name: 'Dr. Grey' },
        { doc_id: 3, doc_name: 'Dr. Carter' }
      ]
    },
    rightTable: {
      name: "appointments",
      columns: ["appt_id", "doc_id", "patient"],
      data: [
        { appt_id: 88, doc_id: 2, patient: "O'Malley" },
        { appt_id: 89, doc_id: 3, patient: 'Benton' }
      ]
    },
    expectedLeft: "doc_id",
    expectedRight: "doc_id",
    outputData: [
      { doc_name: 'Dr. House', patient: 'NULL' },
      { doc_name: 'Dr. Grey', patient: "O'Malley" },
      { doc_name: 'Dr. Carter', patient: 'Benton' }
    ]
  },
  {
    title: "IT Helpdesk (Specific Columns)",
    prompt: "We need a daily report of our IT support staff and the specific issue they are working on. Make sure agents with no active tickets still appear on the report so we know who is available!",
    selectText: "agents.name, tickets.issue",
    leftTable: {
      name: "agents",
      columns: ["agent_id", "name"],
      data: [
        { agent_id: 1, name: 'Roy' },
        { agent_id: 2, name: 'Moss' },
        { agent_id: 3, name: 'Jen' }
      ]
    },
    rightTable: {
      name: "tickets",
      columns: ["ticket_id", "agent_id", "issue"],
      data: [
        { ticket_id: 404, agent_id: 1, issue: 'Server down' },
        { ticket_id: 405, agent_id: 3, issue: 'Locked out' }
      ]
    },
    expectedLeft: "agent_id",
    expectedRight: "agent_id",
    outputData: [
      { name: 'Roy', issue: 'Server down' },
      { name: 'Moss', issue: 'NULL' },
      { name: 'Jen', issue: 'Locked out' }
    ]
  }
];

// ==========================================
// 2. THE DYNAMIC INTERACTIVE COMPONENT
// ==========================================

// ==========================================
// 3. THE MAIN LESSON COMPONENT
// ==========================================

// ==========================================
// 1. THE MOCK DATA FOR THE 3 EXAMPLES
// ==========================================

// ==========================================
// 2. THE DYNAMIC INTERACTIVE COMPONENT
// ==========================================
// ==========================================
// 2. THE DYNAMIC INTERACTIVE COMPONENT
// ==========================================
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
    <div className="w-full flex flex-col xl:flex-row gap-8 mt-8 mb-12">
      
      {/* 🌟 LEFT COLUMN: Shrunk to 1/3 width, Tables stacked vertically 🌟 */}
      <div className="w-full xl:w-1/3 flex flex-col gap-6">
        <div className={`bg-[#141620] border ${isCompleted ? 'border-blue-500/30' : 'border-slate-800'} rounded-xl p-6 shadow-lg transition-all`}>
          <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <span className={`${isCompleted ? 'bg-blue-500 text-white' : 'bg-blue-400 text-slate-900'} w-6 h-6 rounded-full flex items-center justify-center text-sm font-black transition-colors`}>{isCompleted ? '✓' : index + 1}</span> 
            {step.title}
          </h2>
          <p className="text-slate-400 mb-6 text-sm">{step.prompt}</p>

          {/* Changed to flex-col to stack the tables on top of each other */}
          <div className="flex flex-col gap-5">
            {/* RAW LEFT TABLE */}
            <div className="flex-1 border border-slate-700/50 rounded-lg overflow-hidden bg-slate-900/20 shadow-md">
              <div className="bg-slate-800/80 px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-700/50">Left: {step.leftTable.name}</div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900/80 border-b border-slate-700/50">
                    <tr>{step.leftTable.columns.map(c => <th key={c} className="px-4 py-2 font-mono text-purple-400/70">{c}</th>)}</tr>
                  </thead>
                  <tbody className={`divide-y divide-slate-800/50 transition-opacity duration-700 ${feedback === 'correct' ? 'opacity-20' : 'opacity-100'}`}>
                    {step.leftTable.data.map((row, i) => (
                      <tr key={i}>{step.leftTable.columns.map(c => <td key={c} className="px-4 py-2 font-mono text-xs text-slate-300">{String(row[c as keyof typeof row])}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Connection Indicator Icon */}
            <div className="flex justify-center -my-2 z-10">
              <div className="bg-slate-800 border border-slate-700 text-slate-500 rounded-full w-8 h-8 flex items-center justify-center font-black shadow-lg">↓</div>
            </div>

            {/* RAW RIGHT TABLE */}
            <div className="flex-1 border border-slate-700/50 rounded-lg overflow-hidden bg-slate-900/20 shadow-md">
              <div className="bg-slate-800/80 px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-700/50">Right: {step.rightTable.name}</div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900/80 border-b border-slate-700/50">
                    <tr>{step.rightTable.columns.map(c => <th key={c} className="px-4 py-2 font-mono text-purple-400/70">{c}</th>)}</tr>
                  </thead>
                  <tbody className={`divide-y divide-slate-800/50 transition-opacity duration-700 ${feedback === 'correct' ? 'opacity-20' : 'opacity-100'}`}>
                    {step.rightTable.data.map((row, i) => (
                      <tr key={i}>{step.rightTable.columns.map(c => <td key={c} className="px-4 py-2 font-mono text-xs text-slate-300">{String(row[c as keyof typeof row])}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* DYNAMIC OUTPUT */}
        {feedback === 'correct' && (
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 animate-in fade-in slide-in-from-top-4">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">SQL Output Result</h3>
            <div className="border border-blue-500/20 rounded-lg overflow-hidden bg-slate-900/50">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900/80 border-b border-blue-500/20">
                    <tr>{Object.keys(step.outputData[0]).map(col => <th key={col} className="px-4 py-2 font-mono text-blue-300 whitespace-nowrap">{col}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-blue-500/10">
                    {step.outputData.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val, j) => (
                          <td key={j} className={`px-4 py-2 font-mono text-xs font-bold whitespace-nowrap ${val === 'NULL' ? 'text-slate-600 italic' : 'text-white'}`}>{String(val)}</td>
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

      {/* 🌟 RIGHT COLUMN: Expanded to 2/3 width to give the Editor massive room 🌟 */}
      <div className="w-full xl:w-2/3 flex flex-col">
        <div className={`bg-[#141620] border-2 rounded-xl overflow-hidden flex flex-col h-full shadow-lg transition-colors duration-300 ${feedback === 'correct' ? 'border-emerald-500' : feedback === 'wrong' ? 'border-red-500' : 'border-slate-800'}`}>
          <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-800 flex justify-between items-center"><span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Query Builder</span></div>
          
          <div className="p-8 flex-1 bg-[#0f111a] font-mono text-xl flex flex-col justify-center gap-6">
            
            <div className="text-purple-400">SELECT <span className="text-white">{step.selectText}</span></div>
            
            <div className="text-purple-400">FROM <span className="text-purple-300">{step.leftTable.name}</span></div>
            <div className="text-blue-400">LEFT JOIN <span className="text-purple-300">{step.rightTable.name}</span></div>
            
            {/* The ON clause now has plenty of room to stretch out naturally! */}
            <div className="flex items-center gap-3 mt-2 bg-slate-800/30 p-5 rounded-lg border border-slate-800 whitespace-nowrap overflow-hidden text-lg xl:text-xl">
              <span className="text-amber-400 font-bold">ON</span>
              <span className="text-purple-300">{step.leftTable.name}.</span>
              <select value={leftCol} onChange={(e) => {setLeftCol(e.target.value); setFeedback('idle');}} className="bg-slate-900 border border-slate-700 text-amber-300 rounded px-2 py-1 outline-none cursor-pointer hover:border-amber-500/50 transition-colors">
                <option value="" disabled>column</option>
                {step.leftTable.columns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="text-white font-black">=</span>
              <span className="text-purple-300">{step.rightTable.name}.</span>
              <select value={rightCol} onChange={(e) => {setRightCol(e.target.value); setFeedback('idle');}} className="bg-slate-900 border border-slate-700 text-amber-300 rounded px-2 py-1 outline-none cursor-pointer hover:border-amber-500/50 transition-colors">
                <option value="" disabled>column</option>
                {step.rightTable.columns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

          </div>

          <div className="p-6 border-t border-slate-800 bg-[#141620]">
            {feedback === 'idle' && <button onClick={handleSubmit} disabled={!leftCol || !rightCol} className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold py-4 rounded-lg transition-all text-lg">Execute Join</button>}
            {feedback === 'wrong' && <div className="flex flex-col gap-4"><div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/30 text-center font-bold">Incorrect link. Find the column they share!</div><button onClick={() => setFeedback('idle')} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-lg transition-all text-lg">Try Again</button></div>}
            {feedback === 'correct' && <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-lg border border-emerald-500/30 text-center font-bold text-lg">Link Established! Notice the empty values showing up as NULL.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. THE MAIN LESSON COMPONENT
// ==========================================
// ==========================================
// 3. THE MAIN LESSON COMPONENT
// ==========================================
const LeftJoinLesson: React.FC<LessonModuleProps> = ({
  firstQuestId,
  onComplete,
  navigate,
}) => {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

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
        <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">
          Interactive Lesson
        </span>
        <h1 className="text-4xl font-black text-white mt-2 mb-6">
          Combining Tables: LEFT JOIN
        </h1>
      </div>

      {/* DESCRIPTION WITH INLINE VISUAL TABLES */}
      <div className="max-w-5xl bg-[#141620] border border-slate-800 rounded-xl p-8 shadow-lg">
        <div className="text-slate-300 leading-relaxed space-y-4">
          <p>
            Welcome to the real world of databases! So far, all your data has
            lived in one single table. But to keep things organized, real
            databases split data up into many different tables. To combine them
            back together, we use a <strong>JOIN</strong>.
          </p>

          <p>
            Let's think about it this way. Let's say we have Table A that lists
            all customers, and Table B that lists food orders that some
            customers made.
          </p>

          {/* 🌟 THE VISUAL TABLES 🌟 */}
          <div className="flex flex-col sm:flex-row gap-6 my-8 items-center justify-center bg-[#0f111a] p-6 rounded-xl border border-slate-800/80 shadow-inner">
            {/* Table A: Customers */}
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg overflow-hidden w-full sm:w-1/2 shadow-md">
              <div className="bg-slate-800 text-slate-300 text-xs font-bold px-4 py-2 uppercase tracking-widest border-b border-slate-700/50">
                Table A: Customers
              </div>
              <table className="w-full text-sm text-left">
                <thead className="border-b border-slate-700/50 bg-slate-800/30">
                  <tr>
                    <th className="px-4 py-2 text-amber-400 font-mono">
                      customer_id
                    </th>
                    <th className="px-4 py-2 text-purple-300 font-mono">
                      name
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  <tr>
                    <td className="px-4 py-2 text-amber-300 font-mono bg-amber-500/10">
                      1
                    </td>
                    <td className="px-4 py-2 text-slate-300 font-bold">
                      Alice
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-amber-300 font-mono bg-amber-500/10">
                      2
                    </td>
                    <td className="px-4 py-2 text-slate-300 font-bold">Bob</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-amber-300 font-mono bg-amber-500/10">
                      3
                    </td>
                    <td className="px-4 py-2 text-slate-300 font-bold">
                      Charlie
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Connection Indicator */}
            <div className="hidden sm:flex text-slate-600 font-black text-2xl">
              ➕
            </div>

            {/* Table B: Orders */}
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg overflow-hidden w-full sm:w-1/2 shadow-md">
              <div className="bg-slate-800 text-slate-300 text-xs font-bold px-4 py-2 uppercase tracking-widest border-b border-slate-700/50">
                Table B: Orders
              </div>
              <table className="w-full text-sm text-left">
                <thead className="border-b border-slate-700/50 bg-slate-800/30">
                  <tr>
                    <th className="px-4 py-2 text-purple-300 font-mono">
                      order_id
                    </th>
                    <th className="px-4 py-2 text-amber-400 font-mono">
                      customer_id
                    </th>
                    <th className="px-4 py-2 text-purple-300 font-mono">
                      food
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  <tr>
                    <td className="px-4 py-2 text-slate-400 font-mono">101</td>
                    <td className="px-4 py-2 text-amber-300 font-mono bg-amber-500/10">
                      1
                    </td>
                    <td className="px-4 py-2 text-slate-300 font-bold">
                      Pizza
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-slate-400 font-mono">102</td>
                    <td className="px-4 py-2 text-amber-300 font-mono bg-amber-500/10">
                      3
                    </td>
                    <td className="px-4 py-2 text-slate-300 font-bold">
                      Burger
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <p>
            If we want a master list of <em>all</em> our customers, alongside
            what they ordered, we use a{' '}
            <code className="text-blue-400 bg-slate-900 px-2 py-1 rounded font-mono text-sm">
              LEFT JOIN
            </code>
            .
          </p>

          <p>
            After using a{' '}
            <code className="text-blue-400 bg-slate-900 px-2 py-1 rounded font-mono text-sm">
              LEFT JOIN
            </code>
            , all the columns of Table A get shown no matter what. If a customer
            ordered food, SQL attaches the order details to their name. If a
            customer hasn't ordered anything yet (like Bob!), SQL doesn't delete
            them from the list! It simply keeps their name and leaves the food
            order columns completely blank or empty.
          </p>

          <h3 className="text-xl font-bold text-white mt-8 mb-2">
            The ON Clause (Finding the Connection)
          </h3>

          <p>
            If you just tell SQL to "join" two tables together, it will panic
            because it doesn't know which food order belongs to which customer.
          </p>

          <p>
            To connect two tables, you have to find the column name they have
            the same. Looking at the tables above, you can see that both tables
            share a{' '}
            <code className="text-amber-400 bg-amber-500/10 px-2 py-1 rounded font-mono text-sm border border-amber-500/20">
              customer_id
            </code>{' '}
            column.
          </p>

          <p>
            The{' '}
            <code className="text-amber-400 bg-slate-900 px-2 py-1 rounded font-mono text-sm">
              ON
            </code>{' '}
            clause is your bridge. You are essentially telling the database:
          </p>

          <p className="bg-slate-900/50 p-4 border-l-4 border-amber-500 italic text-slate-400 rounded-r-lg shadow-md">
            "Attach the food order to the customer <strong>ON</strong> the
            condition that the{' '}
            <code className="text-amber-300">customer_id</code> in Table A
            perfectly matches the{' '}
            <code className="text-amber-300">customer_id</code> in Table B."
          </p>
        </div>
      </div>

      {/* SYNTAX BLOCK */}
      <div className="max-w-4xl">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
          Syntax Example
        </h3>
        <div className="bg-[#0f111a] border border-slate-700/50 py-4 px-6 rounded-lg shadow-inner">
          <code className="text-blue-300 font-mono text-sm block leading-loose">
            <span className="text-purple-400">SELECT</span> *<br />
            <span className="text-purple-400">FROM</span> table_A
            <br />
            <span className="text-blue-400 font-bold">
              LEFT JOIN
            </span> table_B <br />
            <span className="text-amber-400 font-bold">ON</span>{' '}
            table_A.column_name = table_B.column_name;
          </code>
        </div>
      </div>

      {/* INTERACTIVE EXAMPLES */}
      <div className="mt-8">
        <h2 className="text-2xl font-black text-white mb-6">Examples</h2>
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
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
        <h3 className="text-xl font-bold text-white">
          Ready to connect the dots?
        </h3>
        <button
          onClick={() =>
            firstQuestId
              ? navigate(`/quest/${firstQuestId}`)
              : navigate('/home')
          }
          className="bg-blue-600 hover:bg-blue-500 text-white font-black py-5 px-16 rounded-xl transition-all flex justify-center items-center gap-3 shadow-[0_0_30px_rgba(37,99,235,0.25)]"
        >
          Start LEFT JOIN Quests ➔
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
  'order by': OrderByLesson,
  'group by': GroupByLesson,
  'left join': LeftJoinLesson,
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
