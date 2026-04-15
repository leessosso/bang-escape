'use client';

export default function CRTOverlay() {
  return (
    <>
      {/* Scanlines + vignette via CSS pseudo-elements on body */}
      <div className="crt-scanlines pointer-events-none fixed inset-0 z-[9997]" />
      {/* Horizontal scan sweep line */}
      <div className="scan-sweep" />
    </>
  );
}
