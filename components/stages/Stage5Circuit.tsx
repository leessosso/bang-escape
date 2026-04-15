'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ChevronRight, Zap } from 'lucide-react';
import {
  CIRCUIT_SOLUTION,
  CIRCUIT_INITIAL_ROTATIONS,
  CIRCUIT_GRID_SIZE,
  CIRCUIT_ENTRY,
  CIRCUIT_EXIT,
  PIPE_TILES,
} from '@/lib/constants';
import { playSound } from '@/lib/sounds';

interface StageProps {
  onComplete: () => void;
  savedRotations?: number[];
  onRotationsChange?: (rotations: number[]) => void;
}

const TOTAL = CIRCUIT_GRID_SIZE * CIRCUIT_GRID_SIZE;

// 회전 적용: CW 1회 → [N,E,S,W] 에서 W→N, N→E, E→S, S→W
function rotateConnections(
  base: [boolean, boolean, boolean, boolean],
  rotation: number,
): [boolean, boolean, boolean, boolean] {
  const r = ((rotation % 4) + 4) % 4;
  let c: [boolean, boolean, boolean, boolean] = [...base];
  for (let i = 0; i < r; i++) {
    c = [c[3], c[0], c[1], c[2]]; // W→N, N→E, E→S, S→W
  }
  return c;
}

function getConnections(tileIdx: number, rotation: number): [boolean, boolean, boolean, boolean] {
  return rotateConnections(PIPE_TILES[CIRCUIT_SOLUTION[tileIdx].type].base, rotation);
}

// BFS: CIRCUIT_ENTRY → CIRCUIT_EXIT 연결 확인
function checkSolved(rotations: number[]): boolean {
  const G = CIRCUIT_GRID_SIZE;
  const conn = rotations.map((rot, i) => getConnections(i, rot));

  function isConnected(r1: number, c1: number, r2: number, c2: number, dir: number): boolean {
    const opp = (dir + 2) % 4;
    return conn[r1 * G + c1][dir] && conn[r2 * G + c2][opp];
  }

  const startIdx = CIRCUIT_ENTRY.row * G + CIRCUIT_ENTRY.col;
  if (!conn[startIdx][CIRCUIT_ENTRY.dir]) return false;

  const visited = new Set<number>([startIdx]);
  const queue = [startIdx];
  const dirs = [[-1, 0, 0], [0, 1, 1], [1, 0, 2], [0, -1, 3]] as const;

  while (queue.length > 0) {
    const cur = queue.shift()!;
    const row = Math.floor(cur / G);
    const col = cur % G;
    for (const [dr, dc, dir] of dirs) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr < 0 || nr >= G || nc < 0 || nc >= G) continue;
      const ni = nr * G + nc;
      if (visited.has(ni)) continue;
      if (isConnected(row, col, nr, nc, dir)) {
        visited.add(ni);
        queue.push(ni);
      }
    }
  }

  const endIdx = CIRCUIT_EXIT.row * G + CIRCUIT_EXIT.col;
  return visited.has(endIdx) && conn[endIdx][CIRCUIT_EXIT.dir];
}

// SVG 파이프 타일
function PipeSVG({
  connections,
  isPath,
}: {
  connections: [boolean, boolean, boolean, boolean];
  isPath: boolean;
}) {
  const [n, e, s, w] = connections;
  const color = isPath ? '#00ff41' : '#005500';
  const glow = isPath ? 'drop-shadow(0 0 4px #00ff41)' : 'none';
  const sw = isPath ? 9 : 6;
  const cx = 50; const cy = 50;

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx={cx} cy={cy} r={isPath ? 7 : 5} fill={color} filter={glow} />
      {n && <line x1={cx} y1={cy} x2={cx}  y2={0}   stroke={color} strokeWidth={sw} strokeLinecap="round" filter={glow} />}
      {e && <line x1={cx} y1={cy} x2={100} y2={cy}  stroke={color} strokeWidth={sw} strokeLinecap="round" filter={glow} />}
      {s && <line x1={cx} y1={cy} x2={cx}  y2={100} stroke={color} strokeWidth={sw} strokeLinecap="round" filter={glow} />}
      {w && <line x1={cx} y1={cy} x2={0}   y2={cy}  stroke={color} strokeWidth={sw} strokeLinecap="round" filter={glow} />}
    </svg>
  );
}

export default function Stage2Circuit({ onComplete, savedRotations, onRotationsChange }: StageProps) {
  const initRots = useCallback(() => {
    if (savedRotations && savedRotations.length === TOTAL) return savedRotations;
    return CIRCUIT_INITIAL_ROTATIONS.map((offset, i) => (CIRCUIT_SOLUTION[i].rotation + offset) % 4);
  }, [savedRotations]);

  const [rotations, setRotations] = useState<number[]>(initRots);
  const [solved, setSolved] = useState(false);
  const [pathTiles, setPathTiles] = useState<Set<number>>(new Set());

  const evaluate = useCallback((rots: number[]) => {
    if (checkSolved(rots)) {
      setSolved(true);
      setPathTiles(new Set(Array.from({ length: TOTAL }, (_, i) => i)));
      playSound.success();
    } else {
      setSolved(false);
      setPathTiles(new Set());
    }
  }, []);

  useEffect(() => { evaluate(rotations); }, []); // eslint-disable-line

  const handleClick = (idx: number) => {
    if (solved) return;
    playSound.beep();
    const next = rotations.map((r, i) => i === idx ? (r + 1) % 4 : r);
    setRotations(next);
    onRotationsChange?.(next);
    evaluate(next);
  };

  const G = CIRCUIT_GRID_SIZE;

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 gap-5">
      {/* Header */}
      <div className="text-center space-y-1">
        <p className="text-xs tracking-[0.4em] text-green-600">STAGE // CIRCUIT RESTORE</p>
        <h2 className="text-3xl font-bold tracking-[0.25em] text-glow">ALGORITHM CIRCUIT</h2>
        <p className="text-green-600 text-sm tracking-widest">
          &gt; 타일을 클릭해 90° 회전 —{' '}
          <span className="text-green-400">입구 → 출구</span>를 연결하라
        </p>
      </div>

      {/* Grid with entry/exit indicators */}
      {/* IN/OUT는 entry/exit row(row=2) 에 절대 위치로 정렬 */}
      <div className="relative">
        {/* Entry — 그리드 왼쪽, row 2 중앙 */}
        <div
          className="absolute right-full flex items-center gap-1 pr-2"
          style={{
            top: `${((CIRCUIT_ENTRY.row * 2 + 1) / (G * 2)) * 100}%`,
            transform: 'translateY(-50%)',
          }}
        >
          <Zap size={14} className="text-green-400 text-glow animate-pulse" />
          <span className="text-[10px] text-green-500 tracking-widest font-bold">IN</span>
          <div className="w-5 h-0.5 bg-green-500" style={{ boxShadow: '0 0 6px #00ff41' }} />
        </div>

        {/* 4×4 Grid */}
        <div
          className="p-2 border border-green-900 bg-black/70"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${G}, minmax(0, 1fr))`,
            gap: '3px',
            boxShadow: 'inset 0 0 20px rgba(0,255,65,0.04)',
          }}
        >
          {rotations.map((rot, i) => {
            const row = Math.floor(i / G);
            const col = i % G;
            const isPath = pathTiles.has(i);
            const isEntryTile = row === CIRCUIT_ENTRY.row && col === CIRCUIT_ENTRY.col;
            const isExitTile  = row === CIRCUIT_EXIT.row  && col === CIRCUIT_EXIT.col;
            const isEdge = isEntryTile || isExitTile;

            return (
              <motion.button
                key={i}
                onClick={() => handleClick(i)}
                className={`border transition-all duration-100 active:scale-90
                            ${isPath
                              ? 'border-green-400 bg-green-950/50'
                              : isEdge
                                ? 'border-green-800 bg-green-950/10 hover:border-green-600'
                                : 'border-green-950 bg-black hover:border-green-800'
                            }`}
                style={{
                  width: 'clamp(52px, 8vw, 72px)',
                  height: 'clamp(52px, 8vw, 72px)',
                  boxShadow: isPath ? '0 0 6px rgba(0,255,65,0.25)' : undefined,
                }}
                whileTap={{ scale: 0.9 }}
              >
                <PipeSVG connections={getConnections(i, rot)} isPath={isPath} />
              </motion.button>
            );
          })}
        </div>

        {/* Exit — 그리드 오른쪽, row 2 중앙 */}
        <div
          className="absolute left-full flex items-center gap-1 pl-2"
          style={{
            top: `${((CIRCUIT_EXIT.row * 2 + 1) / (G * 2)) * 100}%`,
            transform: 'translateY(-50%)',
          }}
        >
          <div className="w-5 h-0.5 bg-green-500" style={{ boxShadow: '0 0 6px #00ff41' }} />
          <span className="text-[10px] text-green-500 tracking-widest font-bold">OUT</span>
          <Zap size={14} className={`transition-all ${solved ? 'text-green-400 text-glow' : 'text-green-900'}`} />
        </div>
      </div>

      <p className="text-green-900 text-xs tracking-widest">
        CLICK TO ROTATE 90° // {G}×{G} GRID // FIND THE PATH
      </p>

      {/* Status */}
      <div className="h-14 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {solved ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="flex items-center gap-3 text-green-400 text-glow">
                <CheckCircle size={22} />
                <span className="text-xl font-bold tracking-[0.4em]">DATA STREAM ONLINE</span>
              </div>
              <button
                onClick={() => { playSound.beep(); onComplete(); }}
                className="flex items-center gap-2 px-8 py-2 border-2 border-green-400
                           text-green-400 text-glow font-bold tracking-widest text-sm
                           hover:bg-green-400 hover:text-black transition-all active:scale-95"
              >
                FINALIZE RECOVERY
                <ChevronRight size={16} />
              </button>
            </motion.div>
          ) : (
            <motion.p key="hint" className="text-green-900 text-xs tracking-widest">
              ROUTING ALGORITHM... SEARCHING FOR VALID PATH
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
