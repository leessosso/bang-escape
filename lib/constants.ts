// ─── Stage 0: Login ──────────────────────────────────────────────
export const LOGIN_PASSWORD = '0721'; // 마 7:21

// ─── Stage: Morse Code (Signal Intercept) ────────────────────────
// 정답: AMEN (모스부호로 표시됨 / 참조표는 현장 QR 코드로 제공)
export const MORSE_ANSWER = 'AMEN';

export const MORSE_CODE: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.',
  F: '..-.', G: '--.', H: '....', I: '..', J: '.---',
  K: '-.-', L: '.-..', M: '--', N: '-.', O: '---',
  P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-',
  U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--',
  Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--',
  '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.',
};

// ─── Stage: Frequency Calibration ────────────────────────────────
// 4개 채널, 각 채널의 목표 주파수(0-9)
export const FREQ_TARGETS = [3, 7, 1, 9];
// 각 채널의 시작값 (목표에서 3~5칸 이상 떨어진 값)
export const FREQ_INITIAL = [7, 2, 6, 4];

// ─── Stage: Photo Timeline ───────────────────────────────────────
export const PHOTO_COUNT = 5;

// 정답 순서: 인덱스 배열 (0~4). 실제 이미지 넣을 때 맞게 수정하세요.
// 예: [2, 0, 4, 1, 3] → photo-3이 첫 번째, photo-1이 두 번째, ...
export const CORRECT_PHOTO_ORDER: number[] = [0, 1, 2, 3, 4];

// ─── Stage: Memory Matrix ─────────────────────────────────────────
export const MEMORY_GRID_SIZE = 5; // 5×5 = 25칸

// Round 2는 두 번 분할 플래시: 각 4칸을 1.5초씩 따로 보여줌 (총 8칸 기억)
export const MEMORY_ROUND2_PHASES: [number[], number[]] = [
  [1, 9, 18, 20],  // Phase 1: (0,1)(1,4)(3,3)(4,0)
  [0, 7, 14, 23],  // Phase 2: (0,0)(1,2)(2,4)(4,3)
];

// Round 3은 세 번 분할 플래시: 각 3칸을 1.5초씩 따로 보여줌 (총 9칸 기억)
// 각 Phase는 단순 직선 패턴을 피한 불규칙 배치
//
// Phase 1:  . X . . .    Phase 2:  . . . X .    Phase 3:  . . . . .
//           . . . . .              X . . . .              . . X . .
//           . . . . X              . . . . .              . X . . .
//           . . . . .              . . . . X              . . . . .
//           . . X . .              . . . . .              X . . . .
export const MEMORY_ROUND3_PHASES: [number[], number[], number[]] = [
  [1, 14, 22],  // Phase 1: (0,1)(2,4)(4,2)
  [3, 5, 19],   // Phase 2: (0,3)(1,0)(3,4)
  [7, 11, 20],  // Phase 3: (1,2)(2,1)(4,0)
];
export const MEMORY_SHOW_MS_R3 = 1300; // Round 2/3 분할 플래시당 표시 시간 (ms)

export const MEMORY_ROUNDS: number[][] = [
  [0, 3, 6, 10, 12, 16, 19, 24],                                            // Round 1: 8칸
  [...MEMORY_ROUND2_PHASES[0], ...MEMORY_ROUND2_PHASES[1]],                 // Round 2: 8칸 (4개씩 2회 분할 플래시)
  [...MEMORY_ROUND3_PHASES[0], ...MEMORY_ROUND3_PHASES[1], ...MEMORY_ROUND3_PHASES[2]], // Round 3: 9칸 (3회 분할 플래시)
];
export const MEMORY_SHOW_MS = 1000;

// ─── Stage: Circuit (4×4) ─────────────────────────────────────────
export const CIRCUIT_GRID_SIZE = 4; // 4×4 = 16 tiles
// Entry: 좌측 2번 행(row=2, col=0) 서쪽, Exit: 우측 2번 행(row=2, col=3) 동쪽
export const CIRCUIT_ENTRY = { row: 2, col: 0, dir: 3 } as const; // W
export const CIRCUIT_EXIT = { row: 2, col: 3, dir: 1 } as const; // E

// 파이프 타일 유형: 각 방향 연결 여부 [N, E, S, W]
export type PipeTileType = 'straight' | 'curve' | 'tee' | 'cross' | 'dead';

export interface PipeTileDef {
  type: PipeTileType;
  base: [boolean, boolean, boolean, boolean]; // [N, E, S, W]
}

export const PIPE_TILES: Record<PipeTileType, PipeTileDef> = {
  straight: { type: 'straight', base: [true, false, true, false] }, // N+S
  curve: { type: 'curve', base: [false, true, true, false] }, // E+S
  tee: { type: 'tee', base: [false, true, true, true] }, // E+S+W
  cross: { type: 'cross', base: [true, true, true, true] }, // all
  dead: { type: 'dead', base: [true, false, false, false] }, // N only
};

/**
 * 4×4 솔루션 (인덱스 0~15, row-major)
 *
 * 경로 (★): (2,0)→(1,0)→(1,1)→(1,2)→(0,2)→(0,3)→(1,3)→(2,3)
 *
 *   col:     0        1        2        3
 * row 0: curve    straight curve★   curve★
 * row 1: curve★  str★     curve★   str★
 * row 2: curve★  curve    curve    curve★
 * row 3: straight straight straight curve
 *
 * 모든 타일이 2방향 연결 → 어떤 회전이든 인접 타일과 연결될 가능성이 있어 혼란 유발
 * rotation 의미: 0=base, 1=90°CW, 2=180°, 3=270°CW
 */
export const CIRCUIT_SOLUTION: Array<{ type: PipeTileType; rotation: number }> = [
  // row 0  (idx 0-3)
  { type: 'curve', rotation: 2 }, // (0,0) N+W  → 비경로
  { type: 'curve', rotation: 3 }, // (0,1) N+E  → 비경로 (인접 경로 타일과 비연결)
  { type: 'curve', rotation: 0 }, // (0,2) E+S  ★
  { type: 'curve', rotation: 1 }, // (0,3) S+W  ★
  // row 1  (idx 4-7)
  { type: 'curve', rotation: 0 }, // (1,0) E+S  ★
  { type: 'straight', rotation: 1 }, // (1,1) E+W  ★ (경로 직선, 유지)
  { type: 'curve', rotation: 2 }, // (1,2) N+W  ★
  { type: 'straight', rotation: 0 }, // (1,3) N+S  ★ (경로 직선, 유지)
  // row 2  (idx 8-11)
  { type: 'curve', rotation: 2 }, // (2,0) N+W  ★ ← entry
  { type: 'curve', rotation: 0 }, // (2,1) E+S  → 비경로
  { type: 'curve', rotation: 1 }, // (2,2) S+W  → 비경로
  { type: 'curve', rotation: 3 }, // (2,3) N+E  ★ ← exit
  // row 3  (idx 12-15)
  { type: 'curve', rotation: 3 }, // (3,0) N+E  → 비경로
  { type: 'curve', rotation: 0 }, // (3,1) E+S  → 비경로
  { type: 'curve', rotation: 3 }, // (3,2) N+E  → 비경로
  { type: 'curve', rotation: 2 }, // (3,3) N+W  → 비경로
];

// 초기 회전 오프셋 (1~3): 솔루션 + 오프셋 → 시작 배치 (항상 틀린 상태)
export const CIRCUIT_INITIAL_ROTATIONS: number[] = [
  2, 1, 2, 3,   // row 0
  2, 3, 1, 2,   // row 1
  1, 2, 3, 2,   // row 2
  3, 1, 3, 2,   // row 3
];

// ─── Stage: Caesar Cipher ─────────────────────────────────────────
export const CIPHER_MOVE = 3;
export const CIPHER_ANSWER = 'FAITH';
export const CIPHER_ENCRYPTED = CIPHER_ANSWER
  .split('')
  .map((c) => String.fromCharCode(((c.charCodeAt(0) - 65 + CIPHER_MOVE) % 26) + 65))
  .join(''); // → 'IDLWK'

// ─── Stage: Final Recovery ────────────────────────────────────────
export const FINAL_CODE = '1024';

// ─── Sound Paths ─────────────────────────────────────────────────
export const SOUNDS = {
  beep: '/sounds/beep.wav',
  success: '/sounds/success.wav',
  error: '/sounds/error.wav',
  unlock: '/sounds/unlock.wav',
  ambient: '/sounds/ambient.wav',
} as const;
