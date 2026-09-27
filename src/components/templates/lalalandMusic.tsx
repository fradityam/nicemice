import { useCallback, useEffect, useRef, useState } from 'react';
import { Music } from 'lucide-react';

const FADE_IN_MS = 2000;
const RESUME_FADE_MS = 600;

/**
 * Looping background music that starts from a user gesture (browsers block autoplay),
 * fades in, pauses while the tab is hidden / the screen is locked, and resumes on return
 * only if the guest hadn't paused it themselves.
 */
export function useBackgroundMusic(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  // What the guest wants. Pauses we make because the page went hidden don't change it.
  const wantsPlay = useRef(false);
  const [playing, setPlaying] = useState(false);

  const stopFade = useCallback(() => clearInterval(fadeTimer.current), []);

  // Timer-driven rather than requestAnimationFrame: animation frames stop whenever nothing
  // on screen is changing, and an audio fade shouldn't depend on rendering.
  const fadeIn = useCallback((audio: HTMLAudioElement, ms: number) => {
    stopFade();
    audio.volume = 0;
    // iOS Safari: volume is read-only (always 1), so there is nothing to fade.
    if (audio.volume !== 0) return;
    const t0 = performance.now();
    fadeTimer.current = setInterval(() => {
      const t = Math.min(1, (performance.now() - t0) / ms);
      audio.volume = t * t; // squared so the fade sounds even rather than jumping early
      if (t >= 1) stopFade();
    }, 30);
  }, [stopFade]);

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.preload = 'none';
    audio.src = src;
    audioRef.current = audio;

    const onPlay = () => {
      setPlaying(true);
      if (!document.hidden) wantsPlay.current = true;
    };
    const onPause = () => {
      setPlaying(false);
      if (!document.hidden) wantsPlay.current = false;
    };
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    // Don't compete with the page's own loading: start buffering the song only once the
    // page has finished loading and the browser is idle.
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const warm = () => {
      audio.preload = 'auto';
      audio.load();
    };
    const schedule = () => {
      if ('requestIdleCallback' in window) idleId = window.requestIdleCallback(warm, { timeout: 3000 });
      else timeoutId = setTimeout(warm, 1500);
    };
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });

    const onVisibility = () => {
      if (document.hidden) {
        if (!audio.paused) audio.pause();
      } else if (wantsPlay.current && audio.paused) {
        audio.play().then(() => fadeIn(audio, RESUME_FADE_MS)).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stopFade();
      window.removeEventListener('load', schedule);
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', onVisibility);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      audioRef.current = null;
    };
  }, [src, fadeIn, stopFade]);

  /** Call synchronously inside the click handler that opens the invitation. */
  const start = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.paused) return;
    wantsPlay.current = true;
    audio.volume = 0;
    audio.play().then(() => fadeIn(audio, FADE_IN_MS)).catch(() => {
      wantsPlay.current = false;
    });
  }, [fadeIn]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => fadeIn(audio, RESUME_FADE_MS)).catch(() => {});
    } else {
      stopFade();
      audio.pause();
    }
  }, [fadeIn, stopFade]);

  return { playing, start, toggle };
}

/** Floating play/pause control, bottom-right of the invitation column. */
export function MusicToggle({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[430px]">
      <button
        type="button"
        onClick={onToggle}
        aria-label={playing ? 'Jeda musik' : 'Putar musik'}
        aria-pressed={playing}
        className="pointer-events-auto absolute right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] flex size-11 cursor-pointer items-center justify-center rounded-full bg-[#081a51] shadow-[0_2px_10px_rgba(0,0,0,0.35)] ring-1 ring-[#FFFF00]/40"
      >
        <Music
          aria-hidden="true"
          className={`size-5 text-[#FFFF00] motion-safe:animate-spin transition-opacity ${playing ? 'opacity-100' : 'opacity-60'}`}
          style={{ animationDuration: '6s', animationPlayState: playing ? 'running' : 'paused' }}
        />
      </button>
    </div>
  );
}
