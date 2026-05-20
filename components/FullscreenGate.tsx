'use client';

import { useEffect, useState } from 'react';

function isFullscreenActive() {
  return Boolean(document.fullscreenElement);
}

function isFullscreenSupported() {
  return Boolean(document.documentElement.requestFullscreen);
}

export default function FullscreenGate() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const updateState = () => {
      setIsFullscreen(isFullscreenActive());
      setIsSupported(isFullscreenSupported());
    };

    updateState();
    document.addEventListener('fullscreenchange', updateState);
    return () => document.removeEventListener('fullscreenchange', updateState);
  }, []);

  const enterFullscreen = async () => {
    setErrorMessage('');

    if (!isFullscreenSupported()) {
      setIsSupported(false);
      return;
    }

    try {
      await document.documentElement.requestFullscreen();
    } catch {
      setErrorMessage('브라우저가 전체화면 전환을 차단했습니다. 버튼을 다시 눌러주세요.');
    }
  };

  if (isFullscreen || isDismissed) return null;

  return (
    <div className="fixed inset-0 z-20000 flex items-center justify-center bg-black/95 px-6">
      <div className="tablet-dialog border-2 border-green-500 bg-black/90 p-7 text-center shadow-[0_0_32px_rgba(0,255,65,0.18)]">
        <p className="mb-2 tablet-label text-green-600">
          {'// PRESENTATION DISPLAY MODE'}
        </p>
        <h1 className="text-3xl font-black tracking-[0.2em] text-green-400 text-glow sm:text-4xl">
          전체화면으로 시작
        </h1>
        <p className="mt-4 text-base leading-8 tracking-widest text-green-500">
          맥북/외부 모니터 복제 화면에서 UI를 가장 크게 보려면 전체화면으로 시작하세요.
        </p>

        {!isSupported && (
          <p className="mt-4 border border-yellow-700 bg-yellow-950/30 px-4 py-3 text-sm leading-7 tracking-widest text-yellow-300">
            이 브라우저는 전체화면 API를 지원하지 않습니다. 브라우저 메뉴의 전체화면 기능(F11 또는 View 옵션)을 사용하세요.
          </p>
        )}

        {errorMessage && (
          <p className="mt-4 border border-red-900 bg-red-950/40 px-4 py-3 text-sm tracking-widest text-red-300">
            {errorMessage}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={enterFullscreen}
            className="min-h-14 flex-1 border-2 border-green-400 px-5 py-3 text-base font-bold tracking-[0.2em] text-green-400 text-glow transition-all hover:bg-green-400 hover:text-black active:scale-[0.98]"
          >
            FULLSCREEN START
          </button>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="min-h-14 border border-green-900 px-5 py-3 text-sm font-bold tracking-[0.16em] text-green-600 transition-all hover:border-green-700 hover:text-green-500 active:scale-[0.98] sm:w-44"
          >
            그냥 진행
          </button>
        </div>
      </div>
    </div>
  );
}
