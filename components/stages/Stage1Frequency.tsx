'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, CheckCircle, ChevronRight, Play, Lightbulb } from 'lucide-react';
import StageHeader from './StageHeader';
import { playSound } from '@/lib/sounds';

interface StageProps {
  onComplete: () => void;
}

type SlotKey = 'A' | 'B';

interface Choice {
  id: string;
  label: string;
}

interface SlotConfig {
  key: SlotKey;
  prompt: string;
  correctId: string;
  choices: Choice[];
}

interface RoundData {
  title: string;
  mission: string;
  lines: string[];
  testCases: string[];
  slots: SlotConfig[];
}

const ROUNDS: RoundData[] = [
  {
    title: 'Round 1 - Number Loop',
    mission: '배열의 홀수만 더해서 합계를 반환하라.',
    lines: [
      'function sumOdd(nums) {',
      '  let total = 0;',
      '  for (let i = 0; i < nums.length; i++) {',
      '    if (nums[i] __A__) {',
      '      total += nums[i];',
      '    }',
      '  }',
      '  return __B__;',
      '}',
    ],
    testCases: ['sumOdd([1,2,3,4,5]) -> 9', 'sumOdd([2,4,6]) -> 0'],
    slots: [
      {
        key: 'A',
        prompt: '조건식을 고르세요',
        correctId: 'a2',
        choices: [
          { id: 'a1', label: '=== 0' },
          { id: 'a2', label: '% 2 !== 0' },
          { id: 'a3', label: '> 0' },
          { id: 'a4', label: '<= 0' },
        ],
      },
      {
        key: 'B',
        prompt: '리턴 값을 고르세요',
        correctId: 'b2',
        choices: [
          { id: 'b1', label: 'nums' },
          { id: 'b2', label: 'total' },
          { id: 'b3', label: 'i' },
          { id: 'b4', label: 'total.length' },
        ],
      },
    ],
  },
  {
    title: 'Round 2 - String Check',
    mission: '비밀번호가 길이 8 이상이고 느낌표로 끝나면 true.',
    lines: [
      'function isValidPassword(pw) {',
      '  if (pw.length __A__) return false;',
      '  return pw.endsWith(__B__);',
      '}',
    ],
    testCases: ['isValidPassword("faith123!") -> true', 'isValidPassword("abc!") -> false'],
    slots: [
      {
        key: 'A',
        prompt: '길이 비교 연산자를 고르세요',
        correctId: 'a3',
        choices: [
          { id: 'a1', label: '>= 8' },
          { id: 'a2', label: '=== 8' },
          { id: 'a3', label: '< 8' },
          { id: 'a4', label: '!== 8' },
        ],
      },
      {
        key: 'B',
        prompt: 'endsWith 인자를 고르세요',
        correctId: 'b4',
        choices: [
          { id: 'b1', label: "'?'" },
          { id: 'b2', label: "'#'" },
          { id: 'b3', label: "'!!'" },
          { id: 'b4', label: "'!'" },
        ],
      },
    ],
  },
  {
    title: 'Round 3 - Object Access',
    mission: '활성 사용자(active=true)의 이름만 추출하라.',
    lines: [
      'function getActiveNames(users) {',
      '  return users',
      '    .filter((u) => u.__A__)',
      '    .map((u) => u.__B__);',
      '}',
    ],
    testCases: [
      "getActiveNames([{name:'A',active:true},{name:'B',active:false}]) -> ['A']",
      '결과 타입: string[]',
    ],
    slots: [
      {
        key: 'A',
        prompt: 'filter 조건 필드를 고르세요',
        correctId: 'a1',
        choices: [
          { id: 'a1', label: 'active' },
          { id: 'a2', label: 'name' },
          { id: 'a3', label: 'isAdmin' },
          { id: 'a4', label: 'enabled()' },
        ],
      },
      {
        key: 'B',
        prompt: 'map 반환 필드를 고르세요',
        correctId: 'b3',
        choices: [
          { id: 'b1', label: 'id' },
          { id: 'b2', label: 'active' },
          { id: 'b3', label: 'name' },
          { id: 'b4', label: 'toString()' },
        ],
      },
    ],
  },
];

function getChoiceLabel(round: RoundData, slotKey: SlotKey, choiceId?: string) {
  if (!choiceId) return `__${slotKey}__`;
  const slot = round.slots.find((s) => s.key === slotKey);
  const choice = slot?.choices.find((c) => c.id === choiceId);
  return choice ? choice.label : `__${slotKey}__`;
}

export default function StageFrequency({ onComplete }: StageProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<SlotKey, string | undefined>>({ A: undefined, B: undefined });
  const [result, setResult] = useState<'idle' | 'wrong' | 'pass' | 'complete'>('idle');
  const [attempts, setAttempts] = useState(0);

  const round = ROUNDS[roundIndex];
  const isLastRound = roundIndex === ROUNDS.length - 1;

  const selectedLabels = useMemo(
    () => ({
      A: getChoiceLabel(round, 'A', answers.A),
      B: getChoiceLabel(round, 'B', answers.B),
    }),
    [round, answers.A, answers.B]
  );

  const handleSelect = (key: SlotKey, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    if (result !== 'idle') setResult('idle');
    playSound.beep();
  };

  const runTest = () => {
    if (!answers.A || !answers.B) {
      setResult('wrong');
      playSound.error();
      return;
    }

    const passed = round.slots.every((slot) => answers[slot.key] === slot.correctId);
    if (!passed) {
      setAttempts((v) => v + 1);
      setResult('wrong');
      playSound.error();
      return;
    }

    playSound.success();
    if (isLastRound) {
      setResult('complete');
    } else {
      setResult('pass');
    }
  };

  const nextRound = () => {
    setRoundIndex((idx) => idx + 1);
    setAnswers({ A: undefined, B: undefined });
    setResult('idle');
    playSound.beep();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full max-h-full overflow-hidden px-4 py-3 gap-3">
      <StageHeader
        badge="STAGE // DEBUG CONSOLE"
        icon={<Bug />}
        trailingIcon={<CheckCircle />}
        title="PATCH THE BUG"
        subtitle={<>&gt; 각 라운드의 버그 2개를 수정하고 <span className="text-green-400">RUN TEST</span>로 통과하라</>}
      />

      <div className="tablet-stage-shell border border-green-900 bg-black/60 px-4 py-2.5">
        <div className="flex items-center gap-2 text-green-500 tablet-fine-text mb-1">
          <Lightbulb size={12} />
          RULES (MEDIUM)
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-green-600 tracking-[0.08em]">
          <span>
            1) 빈칸 <span className="text-cyan-300 font-semibold">A</span>/
            <span className="text-amber-300 font-semibold">B</span> 선택
          </span>
          <span>2) RUN TEST</span>
          <span>3) 통과하면 다음 라운드</span>
        </div>
      </div>

      <div className="tablet-stage-shell h-[clamp(430px,72vh,780px)] border border-green-900 bg-black/70 p-3.5 grid lg:grid-cols-[1.1fr_0.9fr] gap-3 overflow-hidden">
        <div className="min-h-0 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <p className="text-green-400 text-base tracking-widest font-bold">{round.title}</p>
            <p className="text-green-600 tablet-fine-text">ROUND {roundIndex + 1}/{ROUNDS.length}</p>
          </div>
          <p className="text-green-600 text-sm tracking-[0.08em]">{round.mission}</p>

          <div className="flex-1 min-h-0 border border-green-950 bg-black p-2.5 font-mono text-base leading-tight text-green-500 space-y-0.5 overflow-auto">
            {round.lines.map((line, idx) => (
              <div key={`${idx}-${line}`} className="whitespace-pre">
                <span className="text-green-700 mr-3">{String(idx + 1).padStart(2, '0')}</span>
                {line.split(/(__A__|__B__)/g).map((part, partIdx) => {
                  if (part === '__A__') {
                    return (
                      <span
                        key={`a-${idx}-${partIdx}`}
                        className="text-cyan-200 font-bold bg-cyan-500/20 border border-cyan-300/50 px-1 rounded-sm"
                      >
                        {selectedLabels.A}
                      </span>
                    );
                  }

                  if (part === '__B__') {
                    return (
                      <span
                        key={`b-${idx}-${partIdx}`}
                        className="text-amber-200 font-bold bg-amber-500/20 border border-amber-300/50 px-1 rounded-sm"
                      >
                        {selectedLabels.B}
                      </span>
                    );
                  }

                  return <span key={`t-${idx}-${partIdx}`}>{part}</span>;
                })}
              </div>
            ))}
          </div>

          <div className="border border-green-950 bg-black/70 px-2.5 py-2">
            <p className="text-sm text-green-600 tracking-widest mb-1">TEST CASES</p>
            {round.testCases.map((test) => (
              <p key={test} className="text-sm text-green-500 tracking-[0.06em]">{test}</p>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex flex-col gap-1.5">
          <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-1.5">
            {round.slots.map((slot) => (
              <div
                key={slot.key}
                className={`border bg-black/60 p-2.5 space-y-1.5 ${
                  slot.key === 'A' ? 'border-cyan-700/80' : 'border-amber-700/80'
                }`}
              >
                <p
                  className={`text-sm tracking-widest font-bold ${
                    slot.key === 'A' ? 'text-cyan-300' : 'text-amber-300'
                  }`}
                >
                  SLOT {slot.key} - {slot.prompt}
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {slot.choices.map((choice) => (
                    <button
                      key={choice.id}
                      onClick={() => handleSelect(slot.key, choice.id)}
                      className={`text-left px-2 py-1.5 border text-sm tracking-[0.06em] transition-all ${
                        answers[slot.key] === choice.id
                          ? slot.key === 'A'
                            ? 'border-cyan-300 text-cyan-100 bg-cyan-900/35'
                            : 'border-amber-300 text-amber-100 bg-amber-900/35'
                          : slot.key === 'A'
                            ? 'border-cyan-900 text-cyan-400/75 hover:border-cyan-600'
                            : 'border-amber-900 text-amber-400/75 hover:border-amber-600'
                      }`}
                    >
                      {choice.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto">
            <div className="flex flex-col items-center gap-1.5">
              <AnimatePresence mode="wait">
                {result === 'complete' ? (
                  <motion.div
                    key="complete"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div className="flex items-center gap-2 text-green-400 text-glow">
                      <CheckCircle size={18} />
                      <span className="text-base font-bold tracking-[0.22em]">ALL TESTS PASSED</span>
                    </div>
                    <button
                      onClick={() => { playSound.beep(); onComplete(); }}
                      className="min-h-11 flex items-center gap-2 px-5 py-2 border-2 border-green-400
                                 text-green-400 text-glow font-bold tracking-[0.08em] text-base
                                 hover:bg-green-400 hover:text-black transition-all active:scale-95"
                    >
                      PROCEED TO NEXT MODULE
                      <ChevronRight size={16} />
                    </button>
                  </motion.div>
                ) : result === 'pass' ? (
                  <motion.div
                    key="pass"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <p className="text-green-400 text-glow text-sm tracking-[0.2em] font-bold">
                      ✓ ROUND CLEARED
                    </p>
                    <button
                      onClick={nextRound}
                      className="min-h-11 flex items-center gap-2 px-5 py-2 border-2 border-green-400
                                 text-green-400 text-glow font-bold tracking-[0.08em] text-base
                                 hover:bg-green-400 hover:text-black transition-all active:scale-95"
                    >
                      NEXT CHALLENGE
                      <ChevronRight size={16} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key={result === 'wrong' ? 'wrong' : 'idle'}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-1.5"
                  >
                    {result === 'wrong' && (
                      <p className="text-red-300 text-base tracking-widest font-bold text-center">
                        ✗ TEST FAILED (ATTEMPT {attempts})
                      </p>
                    )}
                    <button
                      onClick={runTest}
                      className="min-h-11 flex items-center gap-2 px-5 py-2 border-2 border-green-700
                                 text-green-500 font-bold tracking-[0.08em] text-base
                                 hover:border-green-500 hover:text-green-400 transition-all active:scale-95"
                    >
                      RUN TEST
                      <Play size={14} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
