import { formatRemaining, formatTime } from "./format.ts";
import { playTick } from "./sfx.ts";
import { useRotaryDrag } from "./useRotaryDrag.ts";

interface WheelProps {
  onNext: () => void;
  onPrevious: () => void;
  isPaused: boolean;
  onTogglePlay: () => void;
  trackName: string;
  artist: string;
  progressMs: number;
  durationMs: number;
  /** Texto de la pantallita, arriba del track. */
  brand?: string;
}

export function Wheel({
  onNext,
  onPrevious,
  isPaused,
  onTogglePlay,
  trackName,
  artist,
  progressMs,
  durationMs,
  brand = "retrodeck",
}: WheelProps) {
  const played = durationMs ? Math.min(100, (progressMs / durationMs) * 100) : 0;
  const { ref, dragging, pulse, handlers } = useRotaryDrag({
    onNext,
    onPrevious,
    triggerDegrees: 40,
    onDetent: playTick,
  });

  return (
    <div className="rd-pocket">
      <div className="rd-pocket__screen">
        <p className="rd-pocket__brand">{brand}</p>
        <p className="rd-pocket__track">{trackName}</p>
        <p className="rd-pocket__artist">{artist}</p>
        <div className="rd-pocket__progress">
          <span className="rd-pocket__elapsed">{formatTime(progressMs)}</span>
          <span className="rd-pocket__bar">
            <span className="rd-pocket__bar-fill" style={{ width: `${played}%` }} />
          </span>
          <span className="rd-pocket__remaining">{formatRemaining(durationMs - progressMs)}</span>
        </div>
      </div>

      <div ref={ref} className={`rd-wheel ${dragging ? "rd-wheel--dragging" : ""}`} {...handlers}>
        {pulse > 0 && <span key={pulse} className="rd-wheel__pulse" />}
        <div className="rd-wheel__ticks" aria-hidden="true" />
        <span className="rd-wheel__label rd-wheel__label--top">MENU</span>
        <button
          className="rd-wheel__label rd-wheel__label--left"
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Previous track"
        >
          <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
            <path d="M6 5h2v14H6zm3 7 11-7v14z" fill="currentColor" />
          </svg>
        </button>
        <button
          className="rd-wheel__label rd-wheel__label--right"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Next track"
        >
          <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
            <path d="M16 5h2v14h-2zM4 5l11 7-11 7z" fill="currentColor" />
          </svg>
        </button>
        <button
          className="rd-wheel__label rd-wheel__label--bottom"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePlay();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Play / pause"
        >
          <svg viewBox="0 0 30 24" width="17" height="13" aria-hidden="true">
            <path d="M3 5l10 7-10 7z" fill="currentColor" />
            <rect x="18" y="5" width="3.4" height="14" fill="currentColor" />
            <rect x="24" y="5" width="3.4" height="14" fill="currentColor" />
          </svg>
        </button>
        <button
          className="rd-wheel__play"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePlay();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Play / pause"
        >
          {isPaused ? (
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path d="M8 5l12 7-12 7z" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="22" height="22">
              <rect x="6" y="5" width="4" height="14" fill="currentColor" />
              <rect x="14" y="5" width="4" height="14" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
