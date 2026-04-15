const STORAGE_KEY = 'church-escape-state';

export interface GameState {
  currentStage: number;
  startedAt: number | null;
  completedAt: number | null;
  stageData: Record<number, unknown>;
}

export const defaultGameState: GameState = {
  currentStage: 0,
  startedAt: null,
  completedAt: null,
  stageData: {},
};

export function loadState(): GameState {
  if (typeof window === 'undefined') return defaultGameState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultGameState;
    return JSON.parse(raw) as GameState;
  } catch {
    return defaultGameState;
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
