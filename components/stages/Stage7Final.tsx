'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tv } from 'lucide-react';
import StageHeader from './StageHeader';

const NOISE_CHARS = '???????????????????????';
const LOADING_DOT_INDICES = [0, 1, 2, 3, 4];
const FINAL_CCTV_VIDEO_ID = 'ThViJ6Xh5OE';
const STATIC_DURATION_MS = 2500;

type YoutubePlayerLike = {
  destroy: () => void;
  unMute: () => void;
  mute: () => void;
  setVolume: (v: number) => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        container: HTMLElement | string,
        options: Record<string, unknown>,
      ) => YoutubePlayerLike;
      PlayerState: { ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

function ensureYouTubeIframeApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();

  if (window.YT?.Player) return Promise.resolve();

  type WindowWithYtPromise = Window & { __bangEscapeYtApiPromise?: Promise<void> };
  const w = window as WindowWithYtPromise;

  if (!w.__bangEscapeYtApiPromise) {
    w.__bangEscapeYtApiPromise = new Promise<void>((resolve) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve();
      };

      const existing = document.querySelector('script[src*="youtube.com/iframe_api"]');
      if (!existing) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        document.head.appendChild(tag);
      }

      queueMicrotask(() => {
        if (window.YT?.Player) resolve();
      });
    });
  }

  return w.__bangEscapeYtApiPromise;
}

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
      className="font-mono text-green-900/70 leading-none text-xs overflow-hidden select-none whitespace-pre"
    >
      {noiseRows.map((line, row) => (
        <div key={row}>{line}</div>
      ))}
    </div>
  );
}

interface StageProps {
  onComplete: () => void;
}

export default function Stage7Final({ onComplete }: StageProps) {
  const [phase, setPhase] = useState<'cctv' | 'reveal'>('cctv');
  const [showAudioPrompt, setShowAudioPrompt] = useState(false);
  const playerMountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YoutubePlayerLike | null>(null);
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
    const mountEl = playerMountRef.current;
    if (!mountEl) return;

    let cancelled = false;

    ensureYouTubeIframeApi().then(() => {
      if (cancelled || !mountEl || !window.YT?.Player) return;

      const player = new window.YT.Player(mountEl, {
        width: '100%',
        height: '100%',
        videoId: FINAL_CCTV_VIDEO_ID,
        playerVars: {
          autoplay: 1,
          mute: 0,
          controls: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            // Try to start with audio enabled; browser policy may still block this.
            player.unMute();
            player.setVolume(100);
          },
          onStateChange: (ev: { data: number }) => {
            if (ev.data === window.YT!.PlayerState.ENDED) {
              handleVideoEnded();
            }
          },
        },
      });

      playerRef.current = player;
    });

    return () => {
      cancelled = true;
      try {
        playerRef.current?.destroy();
      } catch {
        /* noop */
      }
      playerRef.current = null;
    };
  }, [handleVideoEnded]);

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 gap-5 sm:gap-6">
      {/* Header */}
      <StageHeader
        badge="STAGE // FINAL RECOVERY"
        icon={<Tv size={28} />}
        title="CCTV RESTORATION"
        subtitle={<>&gt; ?? ??? ???? ???? <span className="text-green-400">??? ??</span>??</>}
      />

      {/* CCTV Monitor frame */}
      <div className="relative border-4 border-green-800 bg-black overflow-hidden pt-7"
           style={{
             width: 'min(1200px, 96vw, calc((100vh - 210px) * 16 / 9))',
             aspectRatio: '16/9',
             boxShadow: '0 0 30px rgba(0,255,65,0.2), inset 0 0 20px rgba(0,0,0,0.8)',
           }}>

        {/* Monitor header bar */}
        <div className="absolute top-0 left-0 right-0 h-7 bg-green-950/80 border-b border-green-900
                        flex items-center px-3 gap-2 z-20">
          <Tv size={12} className="text-green-600" />
          <span className="text-green-600 text-[10px] tracking-widest">CAM-07 // RECOVERY MODE</span>
          <span className="ml-auto text-green-800 text-[10px] animate-blink">? REC</span>
        </div>

        {/* Video layer: loads & plays under static so reveal shows ongoing playback */}
        <div className="absolute inset-x-0 bottom-0 top-7 z-[5] overflow-hidden bg-black">
          <div ref={playerMountRef} className="absolute inset-0 [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:h-full [&_iframe]:w-full" />
          <div className="absolute inset-0 bg-green-950/20 mix-blend-screen pointer-events-none" />
          <div
            className="absolute inset-0 opacity-35 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, transparent 45%, rgba(0,0,0,0.85) 100%)',
            }}
          />
          <AnimatePresence>
            {phase === 'reveal' && showAudioPrompt && (
              <motion.button
                key="audio-prompt"
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  playerRef.current?.unMute();
                  playerRef.current?.setVolume(100);
                  setShowAudioPrompt(false);
                }}
                className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2 border border-green-500 bg-black/80 px-4 py-2
                           text-[10px] font-bold tracking-[0.35em] text-green-400 text-glow
                           transition-colors hover:bg-green-500 hover:text-black"
              >
                ENABLE AUDIO
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Phase: CCTV static noise (covers video until STATIC_DURATION_MS) */}
        <AnimatePresence>
          {phase === 'cctv' && (
            <motion.div
              key="noise"
              className="absolute inset-x-0 bottom-0 top-7 flex items-center justify-center z-[15]"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="animate-noise absolute inset-0 w-full h-full overflow-hidden bg-black">
                <StaticNoise cols={60} rows={30} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <p className="text-green-600 text-xs tracking-widest animate-pulse">
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
              className="absolute inset-x-0 bottom-0 top-7 flex flex-col items-center justify-end pb-16 pointer-events-none z-[12]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="relative z-10 text-green-600 text-xs tracking-[0.4em] drop-shadow-[0_0_8px_rgba(0,0,0,1)]">
                RESTORED CCTV SIGNAL
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scanline overlay on monitor */}
        <div className="absolute inset-0 pointer-events-none z-10"
             style={{
               background: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 3px)'
             }} />
      </div>
    </div>
  );
}
