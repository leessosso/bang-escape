import { SOUNDS } from './constants';

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

// 파일이 없을 때를 위한 Web Audio API 폴백 비프음
function playBeepFallback(freq = 440, duration = 0.1, type: OscillatorType = 'square') {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

async function playFile(src: string): Promise<void> {
  try {
    const audio = new Audio(src);
    audio.volume = 0.5;
    await audio.play();
  } catch {
    // 파일이 없으면 폴백 사용
  }
}

export const playSound = {
  beep: () => {
    playFile(SOUNDS.beep).catch(() => playBeepFallback(880, 0.08));
  },
  success: () => {
    playFile(SOUNDS.success).catch(() => {
      playBeepFallback(523, 0.1);
      setTimeout(() => playBeepFallback(659, 0.1), 120);
      setTimeout(() => playBeepFallback(784, 0.2), 240);
    });
  },
  error: () => {
    playFile(SOUNDS.error).catch(() => {
      playBeepFallback(220, 0.15, 'sawtooth');
      setTimeout(() => playBeepFallback(180, 0.2, 'sawtooth'), 180);
    });
  },
  unlock: () => {
    playFile(SOUNDS.unlock).catch(() => {
      playBeepFallback(440, 0.05);
      setTimeout(() => playBeepFallback(550, 0.05), 80);
      setTimeout(() => playBeepFallback(660, 0.05), 160);
      setTimeout(() => playBeepFallback(880, 0.15), 240);
    });
  },
};
