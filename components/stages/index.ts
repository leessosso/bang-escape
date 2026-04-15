import Stage0Login      from './Stage0Login';
import Stage1Morse      from './Stage1Morse';
import Stage2Frequency  from './Stage2Frequency';
import Stage3Photos     from './Stage3Photos';
import Stage4Memory     from './Stage4Memory';
import Stage5Circuit    from './Stage5Circuit';
import Stage6Cipher     from './Stage6Cipher';
import Stage7Final      from './Stage7Final';

export interface StageConfig {
  id: number;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
}

/**
 * 스테이지 레지스트리
 *
 *  0  LOGIN       — 4자리 PIN 로그인
 *  1  MORSE       — 모스 코드 해독 (QR 참조표)
 *  2  FREQUENCY   — 주파수 교정
 *  3  PHOTOS      — 사진 타임라인 정렬  ← savedOrder     @ stageData[3]
 *  4  MEMORY      — 메모리 매트릭스
 *  5  CIRCUIT     — 파이프 회로 복원    ← savedRotations @ stageData[5]
 *  6  CIPHER      — 카이사르 암호 해독
 *  7  FINAL       — 최종 복구
 */
export const STAGE_REGISTRY: StageConfig[] = [
  { id: 0, label: 'LOGIN',     component: Stage0Login     },
  { id: 1, label: 'MORSE',     component: Stage1Morse     },
  { id: 2, label: 'FREQUENCY', component: Stage2Frequency },
  { id: 3, label: 'PHOTOS',    component: Stage3Photos    },
  { id: 4, label: 'MEMORY',    component: Stage4Memory    },
  { id: 5, label: 'CIRCUIT',   component: Stage5Circuit   },
  { id: 6, label: 'CIPHER',    component: Stage6Cipher    },
  { id: 7, label: 'FINAL',     component: Stage7Final     },
];

export {
  Stage0Login, Stage1Morse, Stage2Frequency, Stage3Photos,
  Stage4Memory, Stage5Circuit, Stage6Cipher, Stage7Final,
};
