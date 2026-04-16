'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { GripHorizontal, CheckCircle, ChevronRight, Image as ImageIcon } from 'lucide-react';
import StageHeader from './StageHeader';
import { PHOTO_COUNT, CORRECT_PHOTO_ORDER } from '@/lib/constants';
import { playSound } from '@/lib/sounds';

interface StageProps {
  onComplete: () => void;
  savedOrder?: number[];
  onOrderChange?: (order: number[]) => void;
}

// Fisher-Yates shuffle — 정답 순서가 나오면 재시도
function shuffleOrder(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  if (arraysEqual(arr, CORRECT_PHOTO_ORDER)) return shuffleOrder(n);
  return arr;
}

function arraysEqual(a: number[], b: number[]) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

interface SortablePhotoProps {
  id: string;
  index: number;
  photoNum: number;
  isSolved: boolean;
}

function SortablePhoto({ id, index, photoNum, isSolved }: SortablePhotoProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex flex-col items-center gap-2 cursor-grab active:cursor-grabbing
                  select-none touch-none
                  ${isDragging ? 'opacity-50' : 'opacity-100'}
                  transition-opacity duration-150`}
      {...attributes}
      {...listeners}
    >
      {/* Position label */}
      <div className={`text-xs tracking-widest font-bold ${isSolved ? 'text-green-400' : 'text-green-700'}`}>
        #{index + 1}
      </div>

      {/* Photo card */}
      <div
        className={`w-36 h-44 sm:w-44 sm:h-56 border-2 overflow-hidden rounded
                    ${isDragging
                      ? 'border-green-300 shadow-lg shadow-green-400/30'
                      : isSolved
                        ? 'border-green-400'
                        : 'border-green-800 hover:border-green-600'
                    }
                    transition-all duration-200 bg-black`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/photos/photo-${photoNum + 1}.png`}
          alt={`사진 ${photoNum + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const el = e.currentTarget.parentElement;
            if (el) {
              el.innerHTML = `
                <div class="w-full h-full flex flex-col items-center justify-center bg-green-950/30 gap-2">
                  <span style="font-size:2rem">📷</span>
                  <span style="font-size:0.65rem;color:#00cc33;letter-spacing:0.2em">IMG_${String(photoNum + 1).padStart(3, '0')}</span>
                </div>`;
            }
          }}
          draggable={false}
        />
      </div>

      {/* Drag handle */}
      <GripHorizontal size={16} className="text-green-700" />
    </div>
  );
}

export default function Stage1Photos({ onComplete, savedOrder, onOrderChange }: StageProps) {
  // 저장된 순서가 없으면 랜덤 셔플 (useState 초기화 함수로 한 번만 실행)
  const [order, setOrder] = useState<number[]>(() => {
    if (savedOrder && savedOrder.length === PHOTO_COUNT) return savedOrder;
    return shuffleOrder(PHOTO_COUNT);
  });
  const [result, setResult] = useState<'idle' | 'correct' | 'wrong'>('idle');

  // 최초 랜덤 순서를 localStorage에 저장
  useEffect(() => {
    if (!savedOrder || savedOrder.length !== PHOTO_COUNT) {
      onOrderChange?.(order);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleCheck = () => {
    if (arraysEqual(order, CORRECT_PHOTO_ORDER)) {
      setResult('correct');
      playSound.success();
    } else {
      setResult('wrong');
      playSound.error();
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(Number(String(active.id).replace('photo-', '')));
    const newIndex = order.indexOf(Number(String(over.id).replace('photo-', '')));
    const newOrder = arrayMove(order, oldIndex, newIndex);
    setOrder(newOrder);
    onOrderChange?.(newOrder);
    // 오답 상태에서 다시 드래그하면 오답 메시지 초기화
    if (result === 'wrong') setResult('idle');
    playSound.beep();
  };

  const ids = order.map((n) => `photo-${n}`);

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 gap-8">
      {/* Header */}
      <StageHeader
        badge="STAGE // DATA RECOVERY"
        icon={<ImageIcon size={28} />}
        title="PHOTO TIMELINE"
        subtitle={<>&gt; 사진을 <span className="text-green-400">과거 → 최신</span> 순으로 드래그하여 정렬하라</>}
      />

      {/* Mission text */}
      <div className="border border-green-900 bg-black/60 px-6 py-3 text-sm text-green-500 tracking-widest max-w-xl text-center">
        <ImageIcon size={14} className="inline mr-2" />
        MISSION: Restore the chronological order of the surveillance footage
      </div>

      {/* Photo strip */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={horizontalListSortingStrategy}>
          <div className="flex gap-4 sm:gap-6 items-end justify-center flex-wrap">
            {order.map((photoNum, index) => (
              <SortablePhoto
                key={`photo-${photoNum}`}
                id={`photo-${photoNum}`}
                index={index}
                photoNum={photoNum}
                isSolved={result === 'correct'}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Status / Feedback */}
      <div className="flex flex-col items-center gap-4">
        <AnimatePresence mode="wait">
          {result === 'correct' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex items-center gap-3 text-green-400 text-glow">
                <CheckCircle size={24} />
                <span className="text-xl font-bold tracking-[0.4em]">TIMELINE SYNCHRONIZED</span>
              </div>
              <button
                onClick={() => { playSound.beep(); onComplete(); }}
                className="flex items-center gap-2 px-8 py-3 border-2 border-green-400
                           text-green-400 text-glow font-bold tracking-widest text-sm
                           hover:bg-green-400 hover:text-black transition-all active:scale-95"
              >
                PROCEED TO NEXT MODULE
                <ChevronRight size={18} />
              </button>
            </motion.div>
          ) : result === 'wrong' ? (
            <motion.div
              key="wrong"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <p className="text-red-500 text-sm font-bold tracking-[0.3em] text-center">
                ✗ SEQUENCE ERROR — RECALIBRATE AND RETRY
              </p>
              <button
                onClick={handleCheck}
                className="flex items-center gap-2 px-8 py-3 border-2 border-green-700
                           text-green-500 font-bold tracking-widest text-sm
                           hover:border-green-500 hover:text-green-400 transition-all active:scale-95"
              >
                VERIFY SEQUENCE
                <CheckCircle size={16} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              className="flex flex-col items-center gap-4"
            >
              <button
                onClick={handleCheck}
                className="flex items-center gap-2 px-8 py-3 border-2 border-green-700
                           text-green-500 font-bold tracking-widest text-sm
                           hover:border-green-500 hover:text-green-400 transition-all active:scale-95"
              >
                VERIFY SEQUENCE
                <CheckCircle size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
