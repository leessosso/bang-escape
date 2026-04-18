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
  line: number;
  prompt: string;
  correctId: string;
  hint: string;
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
        line: 4,
        prompt: '조건식을 고르세요',
        correctId: 'a2',
        hint: '홀수 판별은 2로 나눴을 때 나머지를 봅니다.',
        choices: [
          { id: 'a1', label: '=== 0' },
          { id: 'a2', label: '% 2 !== 0' },
          { id: 'a3', label: '> 0' },
          { id: 'a4', label: '<= 0' },
        ],
      },
      {
        key: 'B',
        line: 8,
        prompt: '리턴 값을 고르세요',
        correctId: 'b2',
        hint: '반복문에서 누적한 변수 이름을 그대로 반환해야 합니다.',
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
        line: 2,
        prompt: '길이 비교 연산자를 고르세요',
        correctId: 'a3',
        hint: '8보다 짧으면 false를 리턴해야 합니다.',
        choices: [
          { id: 'a1', label: '>= 8' },
          { id: 'a2', label: '=== 8' },
          { id: 'a3', label: '< 8' },
          { id: 'a4', label: '!== 8' },
        ],
      },
      {
        key: 'B',
        line: 3,
        prompt: 'endsWith 인자를 고르세요',
        correctId: 'b4',
        hint: '문자열 한 글자를 검사합니다.',
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
        line: 3,
        prompt: 'filter 조건 필드를 고르세요',
        correctId: 'a1',
        hint: '불리언 필드명을 그대로 참조하면 됩니다.',
        choices: [
          { id: 'a1', label: 'active' },
          { id: 'a2', label: 'name' },
          { id: 'a3', label: 'isAdmin' },
          { id: 'a4', label: 'enabled()' },
        ],
      },
      {
        key: 'B',
        line: 4,
        prompt: 'map 반환 필드를 고르세요',
        correctId: 'b3',
        hint: '문제에서 요구한 결과는 이름 목록입니다.',
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

  const renderedLines = useMemo(() => {
    const a = getChoiceLabel(round, 'A', answers.A);
    const b = getChoiceLabel(round, 'B', answers.B);
    return round.lines.map((line) => line.replace('__A__', a).replace('__B__', b));
  }, [round, answers.A, answers.B]);

  const wrongHints = useMemo(() => {
    if (result !== 'wrong') return [];
    return round.slots
      .filter((slot) => answers[slot.key] !== slot.correctId)
      .map((slot) => `Line ${slot.line}: ${slot.hint}`);
  }, [result, round, answers]);

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
    <div className="flex flex-col items-center justify-center h-full max-h-full overflow-hidden px-4 py-2 gap-2">
      <StageHeader
        badge="STAGE // DEBUG CONSOLE"
        icon={<Bug size={24} />}
        title="PATCH THE BUG"
        subtitle={<>&gt; 각 라운드의 버그 2개를 수정하고 <span className="text-green-400">RUN TEST</span>로 통과하라</>}
      />

      <div className="w-full max-w-5xl border border-green-900 bg-black/60 px-3 py-2">
        <div className="flex items-center gap-2 text-green-600 text-xs tracking-widest mb-1">
          <Lightbulb size={12} />
          RULES (MEDIUM)
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-green-700 tracking-wide">
          <span>1) 빈칸 A/B 선택</span>
          <span>2) RUN TEST</span>
          <span>3) 실패 시 줄 번호 힌트 확인</span>
        </div>
      </div>

      <div className="w-full max-w-5xl h-[68vh] max-h-[560px] min-h-[460px] border border-green-900 bg-black/70 p-3 grid lg:grid-cols-[1.1fr_0.9fr] gap-2 overflow-hidden">
        <div className="min-h-0 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <p className="text-green-500 text-sm tracking-widest font-bold">{round.title}</p>
            <p className="text-green-700 text-xs tracking-widest">ROUND {roundIndex + 1}/{ROUNDS.length}</p>
          </div>
          <p className="text-green-700 text-xs tracking-widest">{round.mission}</p>

          <div className="flex-1 min-h-0 border border-green-950 bg-black p-2.5 font-mono text-sm leading-tight text-green-500 space-y-0.5 overflow-auto">
            {renderedLines.map((line, idx) => (
              <div key={`${idx}-${line}`} className="whitespace-pre">
                <span className="text-green-900 mr-3">{String(idx + 1).padStart(2, '0')}</span>
                {line}
              </div>
            ))}
          </div>

          <div className="border border-green-950 bg-black/70 px-2.5 py-2">
            <p className="text-xs text-green-700 tracking-widest mb-1">TEST CASES</p>
            {round.testCases.map((test) => (
              <p key={test} className="text-xs text-green-600 tracking-wide">{test}</p>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex flex-col gap-1.5">
          <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-1.5">
            {round.slots.map((slot) => (
              <div key={slot.key} className="border border-green-900 bg-black/60 p-2.5 space-y-1.5">
                <p className="text-xs text-green-500 tracking-widest font-bold">
                  SLOT {slot.key} - {slot.prompt}
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {slot.choices.map((choice) => (
                    <button
                      key={choice.id}
                      onClick={() => handleSelect(slot.key, choice.id)}
                      className={`text-left px-2 py-1.5 border text-xs tracking-wide transition-all ${
                        answers[slot.key] === choice.id
                          ? 'border-green-400 text-green-300 bg-green-950/40'
                          : 'border-green-900 text-green-700 hover:border-green-700'
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
                      className="flex items-center gap-2 px-5 py-2 border-2 border-green-400
                                 text-green-400 text-glow font-bold tracking-widest text-xs
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
                      className="flex items-center gap-2 px-5 py-2 border-2 border-green-400
                                 text-green-400 text-glow font-bold tracking-widest text-xs
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
                      <div className="space-y-1">
                        <p className="text-red-500 text-sm tracking-widest font-bold text-center">
                          ✗ TEST FAILED (ATTEMPT {attempts})
                        </p>
                        {wrongHints.map((hint) => (
                          <p key={hint} className="text-yellow-500 text-xs tracking-widest text-center">
                            HINT: {hint}
                          </p>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={runTest}
                      className="flex items-center gap-2 px-5 py-2 border-2 border-green-700
                                 text-green-500 font-bold tracking-widest text-xs
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
