'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, FileQuestion } from 'lucide-react';
import { withBasePath } from '@/lib/assetPath';
import { playSound } from '@/lib/sounds';

export type ClueMilestone = 1 | 3;

interface ClueRevealProps {
  milestone: ClueMilestone;
  onContinue: () => void;
}

const MILESTONE_META: Record<
  ClueMilestone,
  { ko: string; en: string; afterStageLabel: string; imageSrc: string; imageAlt: string }
> = {
  1: {
    ko: '구간 1 · 단서',
    en: '// POST-FREQUENCY · INTEL BUFFER',
    afterStageLabel: 'STAGE 01 완료',
    imageSrc: '/clues/chat.png',
    imageAlt: '예비신부와 결혼식 비용을 이야기하는 카카오톡 대화 캡처',
  },
  3: {
    ko: '구간 2 · 단서',
    en: '// POST-MORSE · INTEL BUFFER',
    afterStageLabel: 'STAGE 03 완료',
    imageSrc: '/clues/diary.png',
    imageAlt: '결혼 준비 비용을 걱정하는 손글씨 일기와 웨딩 견적서',
  },
};

export default function ClueReveal({ milestone, onContinue }: ClueRevealProps) {
  const meta = MILESTONE_META[milestone];

  useEffect(() => {
    playSound.unlock();
  }, [milestone]);

  return (
    <motion.div
      className="fixed inset-0 z-300 flex flex-col items-center justify-center bg-black/96 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
    >
      <motion.div
        className="absolute inset-4 border border-green-800/80 pointer-events-none"
        animate={{ opacity: [0.35, 0.75, 0.35] }}
        transition={{ repeat: Infinity, duration: 2.2 }}
      />
      <motion.div
        className="absolute inset-6 border border-green-950 pointer-events-none"
        animate={{ opacity: [0.2, 0.45, 0.2] }}
        transition={{ repeat: Infinity, duration: 2.2, delay: 0.4 }}
      />

      <div className="relative z-10 w-full max-w-lg max-h-[85vh] flex flex-col gap-6">
        <motion.div
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.12 }}
          className="text-center space-y-2 shrink-0"
        >
          <p className="text-[10px] tracking-[0.45em] text-green-700">{meta.en}</p>
          <h2 className="text-2xl sm:text-3xl font-black tracking-[0.25em] text-glow text-green-400">
            {meta.ko}
          </h2>
          <p className="text-green-800 text-xs tracking-widest">{meta.afterStageLabel}</p>
        </motion.div>

        <motion.div
          className="hud-widget flex-1 min-h-0 overflow-y-auto px-4 py-5 space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
        >
          <div className="flex items-center gap-2 text-green-700 text-xs tracking-[0.35em]">
            <FileQuestion size={16} className="shrink-0" />
            <span>DECRYPTED FRAGMENT</span>
          </div>

          <div className="rounded border border-green-800/90 bg-green-950/30 p-3">
            <img
              src={withBasePath(meta.imageSrc)}
              alt={meta.imageAlt}
              className="w-full max-h-[52vh] rounded object-contain"
            />
            <p className="mt-3 text-[10px] text-green-900 font-mono tabular-nums">
              SLOT_INDEX · {milestone === 1 ? '01' : '02'}
            </p>
          </div>
        </motion.div>

        <motion.button
          type="button"
          onClick={onContinue}
          className="shrink-0 w-full flex items-center justify-center gap-2 py-3.5 border-2 border-green-500
                     text-green-400 text-glow text-sm font-bold tracking-[0.35em]
                     hover:bg-green-500 hover:text-black transition-all duration-200 active:scale-[0.98]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          다음 구간으로
          <ChevronRight size={20} />
        </motion.button>
      </div>
    </motion.div>
  );
}
