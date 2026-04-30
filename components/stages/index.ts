import type { ComponentType } from 'react';
import Stage0Login      from './Stage0Login';
import Stage1Frequency  from './Stage1Frequency';
import Stage2Photos     from './Stage2Photos';
import Stage3Morse      from './Stage3Morse';
import Stage4Memory     from './Stage4Memory';
import Stage5Circuit    from './Stage5Circuit';
import Stage6Cipher     from './Stage6Cipher';
import Stage7Final      from './Stage7Final';

export interface StageBaseProps {
  onComplete: () => void;
}

export interface StageRenderProps extends StageBaseProps {
  savedOrder?: number[];
  onOrderChange?: (order: number[]) => void;
  savedRotations?: number[];
  onRotationsChange?: (rotations: number[]) => void;
}

export interface StageConfig {
  id: number;
  label: string;
  component: ComponentType<StageRenderProps>;
}

/**
 * 스테이지 레지스트리
 *
 *  0  LOGIN       — 4자리 PIN 로그인
 *  1  FREQUENCY   — 주파수 교정
 *  2  PHOTOS      — 사진 타임라인 정렬  ← savedOrder     @ stageData[2]
 *  3  MORSE       — 모스 코드 해독 (QR 참조표)
 *  4  MEMORY      — 메모리 매트릭스
 *  5  CIRCUIT     — 파이프 회로 복원    ← savedRotations @ stageData[5]
 *  6  CIPHER      — 카이사르 암호 해독
 *  7  FINAL       — 최종 복구
 */
export const STAGE_REGISTRY: StageConfig[] = [
  { id: 0, label: 'LOGIN',     component: Stage0Login     },
  { id: 1, label: 'FREQUENCY', component: Stage1Frequency },
  { id: 2, label: 'PHOTOS',    component: Stage2Photos    },
  { id: 3, label: 'MORSE',     component: Stage3Morse     },
  { id: 4, label: 'MEMORY',    component: Stage4Memory    },
  { id: 5, label: 'CIRCUIT',   component: Stage5Circuit   },
  { id: 6, label: 'CIPHER',    component: Stage6Cipher    },
  { id: 7, label: 'FINAL',     component: Stage7Final     },
];

export {
  Stage0Login, Stage1Frequency, Stage2Photos, Stage3Morse,
  Stage4Memory, Stage5Circuit, Stage6Cipher, Stage7Final,
};
