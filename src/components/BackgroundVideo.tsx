'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Muted, looping background video for hero sections. It sits on top of the
 * poster image the page renders underneath, so the image stays visible while the
 * video loads, if the file is missing, and for reduced-motion users.
 */
export function BackgroundVideo({ src, poster, className }: { src: string; poster?: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setEnabled(!mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    // Some browsers ignore the autoplay attribute after hydration; nudge it.
    if (enabled) ref.current?.play().catch(() => undefined);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <video
      ref={ref}
      className={className}
      data-ready={ready || undefined}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setReady(true)}
      onError={() => setEnabled(false)}
    />
  );
}
