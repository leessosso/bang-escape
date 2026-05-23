import { VIDEOS } from './constants';
import { withBasePath } from './assetPath';

const FINAL_CCTV_SRC = withBasePath(VIDEOS.finalCctv);

let primed = false;

/** Stage 6 정답 제출(사용자 제스처) 직후 호출 — Stage 7 자동 재생+음성 허용 */
export function primeFinalCctvPlayback(): void {
  if (typeof window === 'undefined' || primed) return;

  const video = document.createElement('video');
  video.src = FINAL_CCTV_SRC;
  video.preload = 'auto';
  video.playsInline = true;
  video.muted = false;
  video.volume = 1;

  const finish = () => {
    primed = true;
    video.pause();
    video.currentTime = 0;
    video.removeAttribute('src');
    video.load();
  };

  void video.play().then(finish).catch(() => {
    primed = true;
  });
}
