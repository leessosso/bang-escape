import Stage0Login     from './Stage0Login';
import StageSignal     from './StageSignal';
import StageFrequency  from './StageFrequency';
import Stage1Photos    from './Stage1Photos';
import StageMemory     from './StageMemory';
import Stage2Circuit   from './Stage2Circuit';
import StageCipher     from './StageCipher';
import Stage3Final     from './Stage3Final';

export interface StageConfig {
  id: number;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
}

/**
 * 스테이지 레지스트리
 *
 * 현재 순서 (index):
 *  0  SECURITY LOGIN
 *  1  MORSE DECODE      ← 모스 코드 (QR 참조표)
 *  2  SIGNAL LOCK       ← 주파수 교정 (힌트 없음)
 *  3  PHOTO TIMELINE    ← savedOrder  @ stageData[3]
 *  4  MEMORY MATRIX
 *  5  CIRCUIT RESTORE   ← savedRotations @ stageData[5]
 *  6  CAESAR CIPHER
 *  7  FINAL RECOVERY
 */
export const STAGE_REGISTRY: StageConfig[] = [
  { id: 0, label: 'SECURITY LOGIN',  component: Stage0Login    },
  { id: 1, label: 'MORSE DECODE',    component: StageSignal    },
  { id: 2, label: 'SIGNAL LOCK',     component: StageFrequency },
  { id: 3, label: 'PHOTO TIMELINE',  component: Stage1Photos   },
  { id: 4, label: 'MEMORY MATRIX',   component: StageMemory    },
  { id: 5, label: 'CIRCUIT RESTORE', component: Stage2Circuit  },
  { id: 6, label: 'CAESAR CIPHER',   component: StageCipher    },
  { id: 7, label: 'FINAL RECOVERY',  component: Stage3Final    },
];

export { Stage0Login, StageSignal, StageFrequency, Stage1Photos, StageMemory, Stage2Circuit, StageCipher, Stage3Final };
