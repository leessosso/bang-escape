const STORAGE_KEY = 'church-escape-state';

export interface StageData {
  2?: number[];
  5?: number[];
  [stageId: number]: unknown;
}

export interface GameState {
  currentStage: number;
  startedAt: number | null;
  completedAt: number | null;
  stageData: StageData;
}

export function createDefaultGameState(): GameState {
  return {
    currentStage: 0,
    startedAt: null,
    completedAt: null,
    stageData: {},
  };
}

export const defaultGameState: GameState = createDefaultGameState();

function normalizeTimestamp(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function normalizeStageData(value: unknown): StageData {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as StageData;
}

function normalizeState(value: unknown): GameState {
  if (!value || typeof value !== 'object') return createDefaultGameState();

  const state = value as Partial<GameState>;
  return {
    currentStage: typeof state.currentStage === 'number' && Number.isInteger(state.currentStage)
      ? Math.max(0, state.currentStage)
      : 0,
    startedAt: normalizeTimestamp(state.startedAt),
    completedAt: normalizeTimestamp(state.completedAt),
    stageData: normalizeStageData(state.stageData),
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
