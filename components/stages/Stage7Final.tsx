'use client';

import { useState, useEffect, useLayoutEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Tv } from 'lucide-react';
import StageHeader from './StageHeader';
import { VIDEOS } from '@/lib/constants';
import { withBasePath } from '@/lib/assetPath';
import { ensureMediaReady } from '@/lib/sounds';

const NOISE_CHARS = '???????????????????????';
const LOADING_DOT_INDICES = [0, 1, 2, 3, 4];
const STATIC_DURATION_MS = 2500;
const FINAL_CCTV_SRC = withBasePath(VIDEOS.finalCctv);

function createNoiseRows(cols: number, rows: number): string[] {
  return Array.from({ length: rows }, (_, row) => (
    Array.from({ length: cols }, (_, col) => {
      const index = (row * 17 + col * 31 + row * col) % NOISE_CHARS.length;
      return NOISE_CHARS[index];
    }).join('')
  ));
}

function StaticNoise({ cols, rows }: { cols: number; rows: number }) {
  const noiseRows = useMemo(() => createNoiseRows(cols, rows), [cols, rows]);

  return (
    <div
      aria-hidden="true"
      className="font-mono text-green-700/80 leading-none text-sm overflow-hidden select-none whitespace-pre"
    >
      {noiseRows.map((line, row) => (
        <div key={row}>{line}</div>
      ))}
    </div>
  );
}

/** Fills the CCTV content area: base grid stays 60×30 but scales up/down so noise matches the monitor size. */
function ScaledCctvNoise() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const update = () => {
      const ow = outer.clientWidth;
      const oh = outer.clientHeight;
      const iw = inner.offsetWidth;
      const ih = inner.offsetHeight;
      if (!iw || !ih || !ow || !oh) return;
      setScale(Math.max(ow / iw, oh / ih));
    };

    update();
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(update);
    });
    ro.observe(outer);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={outerRef}
      className="absolute inset-0 overflow-hidden bg-black flex items-center justify-center"
    >
      <div
        className="will-change-transform"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        <div ref={innerRef} className="animate-noise inline-block">
          <StaticNoise cols={60} rows={30} />
        </div>
      </div>
    </div>
  );
}

interface StageProps {
  onComplete: () => void;
}

export default function Stage7Final({ onComplete }: StageProps) {
  const [phase, setPhase] = useState<'cctv' | 'reveal'>('cctv');
  const videoRef = useRef<HTMLVideoElement>(null);
  const onCompleteRef = useRef(onComplete);
  const hasEndedRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const handleVideoEnded = useCallback(() => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;
    onCompleteRef.current();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setPhase('reveal'), STATIC_DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const startPlayback = () => {
      ensureMediaReady();
      video.muted = false;
      video.volume = 1;
      void video.play();
    };

    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      startPlayback();
    } else {
      video.addEventListener('canplay', startPlayback, { once: true });
    }

    return () => {
      video.removeEventListener('canplay', startPlayback);
    };
  }, []);

  return (
    <div className="tablet-stage-shell mx-auto flex flex-col items-center justify-center h-full px-4 gap-5 sm:gap-6">
      {/* Header */}
      <StageHeader
        badge="STAGE // FINAL RECOVERY"
        icon={<Tv />}
        trailingIcon={<Play />}
        title="CCTV RESTORATION"
      />

      {/* CCTV Monitor frame */}
      <div className="relative border-4 border-green-800 bg-black overflow-hidden pt-8"
          style={{
            width: 'min(1560px, 96vw, calc((100vh - 190px) * 16 / 9))',
             aspectRatio: '16/9',
             boxShadow: '0 0 16px rgba(0,0,0,0.35)',
           }}>

        {/* Monitor header bar */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-green-950/80 border-b border-green-900
                        flex items-center px-3 gap-2 z-20">
          <Tv size={13} className="text-green-500" />
          <span className="text-green-500 text-sm tracking-[0.08em]">CAM-07 // RECOVERY MODE</span>
          <span className="ml-auto text-green-400 text-sm animate-blink">? REC</span>
        </div>

        {/* Video layer: loads & plays under static so reveal shows ongoing playback */}
        <div className="absolute inset-x-0 bottom-0 top-8 z-5 overflow-hidden bg-black">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            src={FINAL_CCTV_SRC}
            playsInline
            preload="auto"
            onEnded={handleVideoEnded}
          />
          <div className="absolute inset-0 bg-green-950/20 mix-blend-screen pointer-events-none" />
          <div
            className="absolute inset-0 opacity-35 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, transparent 45%, rgba(0,0,0,0.85) 100%)',
            }}
          />
        </div>

        {/* Phase: CCTV static noise (covers video until STATIC_DURATION_MS) */}
        <AnimatePresence>
          {phase === 'cctv' && (
            <motion.div
              key="noise"
              className="absolute inset-x-0 bottom-0 top-8 flex items-center justify-center z-15"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <ScaledCctvNoise />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <p className="text-green-400 text-base tracking-[0.08em] animate-pulse">
                    RECOVERING SIGNAL...
                  </p>
                  <div className="flex gap-1 justify-center">
                    {LOADING_DOT_INDICES.map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-green-500 rounded-full"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Label once signal is visible */}
        <AnimatePresence>
          {phase === 'reveal' && (
            <motion.div
              key="label"
              className="absolute inset-x-0 bottom-0 top-8 flex flex-col items-center justify-end pb-16 pointer-events-none z-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* <p className="relative z-10 text-green-400 text-base tracking-[0.12em] drop-shadow-[0_0_8px_rgba(0,0,0,1)]">
                RESTORED CCTV SIGNAL
              </p> */}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
