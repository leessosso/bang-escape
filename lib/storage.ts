const STORAGE_KEY = 'church-escape-state';

export interface StageData {
  2?: number[];
  5?: number[];
  [stageId: number]: unknown;
}

export type PendingClueAfter = 1 | 3;

export interface GameState {
  currentStage: number;
  isComplete: boolean;
  stageData: StageData;
  /** 스테이지 1·3 클리어 직후 단서 화면 대기 */
  pendingClueAfter?: PendingClueAfter;
}

export function createDefaultGameState(): GameState {
  return {
    currentStage: 0,
    isComplete: false,
    stageData: {},
  };
}

export const defaultGameState: GameState = createDefaultGameState();

function normalizeStageData(value: unknown): StageData {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as StageData;
}

function normalizeState(value: unknown): GameState {
  if (!value || typeof value !== 'object') return createDefaultGameState();

  const state = value as Partial<GameState>;
  const legacyCompletedAt = (state as { completedAt?: unknown }).completedAt;
  const rawPending = state.pendingClueAfter;
  let pendingClueAfter: PendingClueAfter | undefined =
    rawPending === 1 || rawPending === 3 ? rawPending : undefined;
  const currentStage =
    typeof state.currentStage === 'number' && Number.isInteger(state.currentStage)
      ? Math.max(0, state.currentStage)
      : 0;
  // 단서 오버레이는 해당 스테이지에 머물 때만 유효 (깨진 저장본 정리)
  if (pendingClueAfter !== undefined && currentStage !== pendingClueAfter) {
    pendingClueAfter = undefined;
  }
  return {
    currentStage,
    isComplete: state.isComplete === true || typeof legacyCompletedAt === 'number',
    stageData: normalizeStageData(state.stageData),
    ...(pendingClueAfter !== undefined ? { pendingClueAfter } : {}),
  };
}

export function loadState(): GameState {
  if (typeof window === 'undefined') return createDefaultGameState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultGameState();
    return normalizeState(JSON.parse(raw));
  } catch {
    return createDefaultGameState();
  }
}

export function saveState(state: GameState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or disabled
  }
}

export function clearState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
