'use client';

import { useEffect, useState, useCallback } from 'react';
import { Thermometer, Cpu, Clock } from 'lucide-react';

interface HUDProps {
  startedAt: number | null;
  currentStage: number;
  totalStages: number;
}

export default function HUD({ startedAt, currentStage, totalStages }: HUDProps) {
  const [elapsed, setElapsed] = useState(() => (
    startedAt ? Math.max(0, Math.floor((Date.now() - startedAt) / 1000)) : 0
  ));
  const [temp, setTemp] = useState(42);
  const [cpu, setCpu] = useState(67);

  const tick = useCallback(() => {
    if (!startedAt) return;
    setElapsed(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
  }, [startedAt]);

  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  // CPU / Temp 랜덤 변동 (사이버틱 느낌)
  useEffect(() => {
    const id = setInterval(() => {
      setTemp((t) => Math.min(99, Math.max(35, t + Math.round((Math.random() - 0.5) * 4))));
      setCpu((c) => Math.min(99, Math.max(20, c + Math.round((Math.random() - 0.5) * 8))));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const seconds = String(elapsed % 60).padStart(2, '0');

  return (
    <div className="fixed top-3 right-3 z-200 flex flex-col gap-2 text-xs font-mono">
      {/* Stage progress */}
      <div className="hud-widget px-3 py-1.5 rounded text-[10px] tracking-widest">
        <span className="text-green-600">STAGE </span>
        <span className="text-glow font-bold">
          {currentStage + 1}/{totalStages}
        </span>
        <span className="text-green-600"> ACTIVE</span>
      </div>

      {/* SYSTEM TEMP */}
      <div className="hud-widget px-3 py-1.5 rounded flex items-center gap-2">
        <Thermometer size={12} className="text-green-500" />
        <span className="text-green-600 tracking-widest">TEMP</span>
        <span className={`font-bold ml-auto ${temp > 80 ? 'text-red-400 text-glow-red' : 'text-glow'}`}>
          {temp}°C
        </span>
      </div>

      {/* CPU LOAD */}
      <div className="hud-widget px-3 py-1.5 rounded flex items-center gap-2">
        <Cpu size={12} className="text-green-500" />
        <span className="text-green-600 tracking-widest">CPU</span>
        <span className={`font-bold ml-auto ${cpu > 85 ? 'text-red-400 text-glow-red' : 'text-glow'}`}>
          {cpu}%
        </span>
      </div>

      {/* Elapsed timer */}
      <div className="hud-widget px-3 py-2 rounded flex items-center gap-2">
        <Clock size={12} className="text-green-500" />
        <span className="tracking-widest text-green-600">ELAPSED</span>
        <span
          className="font-bold text-base ml-auto tabular-nums text-glow"
        >
          {minutes}:{seconds}
        </span>
      </div>
    </div>
  );
}
