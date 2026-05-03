'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import CRTOverlay from '@/components/CRTOverlay';
import HUD from '@/components/HUD';
import MissionComplete from '@/components/MissionComplete';
import StageTransition from '@/components/StageTransition';
import { STAGE_REGISTRY, type StageRenderProps } from '@/components/stages';
import { loadState, saveState, clearState, createDefaultGameState, type GameState } from '@/lib/storage';

const EMPTY_STAGE_DATA: GameState['stageData'] = {};

export default function EscapeRoomPage() {
  const [gameState, setGameState] = useState<GameState | null>(null);

  // Hydrate from localStorage
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setGameState(loadState());
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (gameState) saveState(gameState);
  }, [gameState]);

  const handleStageComplete = useCallback(() => {
    setGameState((prev) => {
      if (!prev) return prev;
      const isLast = prev.currentStage >= STAGE_REGISTRY.length - 1;
      if (isLast) {
        if (prev.isComplete) return prev;
        return { ...prev, isComplete: true };
      }
      return { ...prev, currentStage: prev.currentStage + 1 };
    });
  }, []);

  const handleStageDataChange = useCallback((stageId: number, data: unknown) => {
    setGameState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        stageData: { ...prev.stageData, [stageId]: data },
      };
    });
  }, []);

  const handleRestart = useCallback(() => {
    clearState();
    setGameState(createDefaultGameState());
  }, []);

  const currentStage = gameState?.currentStage ?? 0;
  const isComplete = gameState?.isComplete ?? false;
  const stageData = gameState?.stageData ?? EMPTY_STAGE_DATA;
  const stageConfig = STAGE_REGISTRY[currentStage] ?? STAGE_REGISTRY[STAGE_REGISTRY.length - 1];
  const StageComponent = stageConfig.component;

  const stageProps = useMemo<StageRenderProps>(() => {
    const props: StageRenderProps = { onComplete: handleStageComplete };

    if (currentStage === 2) {
      props.savedOrder = Array.isArray(stageData[2]) ? stageData[2] : undefined;
      props.onOrderChange = (order) => handleStageDataChange(2, order);
    }

    if (currentStage === 5) {
      props.savedRotations = Array.isArray(stageData[5]) ? stageData[5] : undefined;
      props.onRotationsChange = (rotations) => handleStageDataChange(5, rotations);
    }

    return props;
  }, [currentStage, handleStageComplete, handleStageDataChange, stageData]);

  // Loading state (hydration)
  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <p className="text-green-600 text-sm tracking-[0.4em] animate-pulse">
          LOADING SYSTEM...
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-black animate-flicker"
      style={{ fontFamily: "'JetBrains Mono', 'Courier New', monospace" }}
    >
      <CRTOverlay />

      <HUD
        currentStage={currentStage}
        totalStages={STAGE_REGISTRY.length}
        onReset={handleRestart}
      />

      {/* Stage progress bar */}
      <div className="fixed top-0 left-0 right-0 h-0.5 z-150 bg-green-950">
        <div
          className="h-full bg-green-500 transition-all duration-500"
          style={{
            width: `${((currentStage) / (STAGE_REGISTRY.length - 1)) * 100}%`,
            boxShadow: '0 0 8px #00ff41',
          }}
        />
      </div>

      {/* Stage label */}
      <div className="fixed bottom-3 left-3 z-150 text-green-800 text-[10px] tracking-[0.3em]">
        {STAGE_REGISTRY.map((s, i) => (
          <span key={s.id} className={i === currentStage ? 'text-green-500' : ''}>
            {i === currentStage ? `[${s.label}]` : s.label}
            {i < STAGE_REGISTRY.length - 1 ? ' → ' : ''}
          </span>
        ))}
      </div>

      {/* Main stage content */}
      <AnimatePresence mode="wait">
        <StageTransition stageKey={currentStage}>
          <div className="h-screen w-screen">
            <StageComponent {...stageProps} />
          </div>
        </StageTransition>
      </AnimatePresence>

      {/* Mission Complete overlay */}
      <AnimatePresence>
        {isComplete && (
          <MissionComplete onNextTeam={handleRestart} />
        )}
      </AnimatePresence>
    </div>
  );
}
