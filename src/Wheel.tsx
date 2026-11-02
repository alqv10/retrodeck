import type { CSSProperties, KeyboardEvent } from "react";
import { formatRemaining, formatTime } from "./format.ts";
import { playTick } from "./sfx.ts";
import { Stickers } from "./Stickers.tsx";
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
  /** Calcomanías pegadas en la carcasa: las URLs de las imágenes. */
  stickers?: string[];
  /** Se suma a la clase del chasis, para pintar este aparato y no los otros. */
  className?: string;
  style?: CSSProperties;
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
  stickers,
  className = "",
  style,
}: WheelProps) {
  const played = durationMs ? Math.min(100, (progressMs / durationMs) * 100) : 0;
  const { ref, dragging, pulse, handlers } = useRotaryDrag({
    onNext,
    onPrevious,
    triggerDegrees: 40,
    onDetent: playTick,
  });

  // La rueda con el teclado. Solo cuando el foco está en la rueda misma: los
  // botones de adentro ya responden a Enter por su cuenta y si no, cada tecla
  // dispararía dos veces.
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") onNext();
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") onPrevious();
    else if (e.key === " " || e.key === "Enter") onTogglePlay();
    else return;
    e.preventDefault();
    playTick();
  }

  return (
    <div className={`rd-pocket ${className}`} style={style} role="group" aria-label={`${brand} player`}>
      <div className="rd-pocket__screen">
        <p className="rd-pocket__brand">{brand}</p>
        {/* El live va en el track y el artista, nunca en la pantalla entera:
            adentro está el tiempo, que cambia cuatro veces por segundo. */}
        <p className="rd-pocket__track" aria-live="polite">
          {trackName}
        </p>
        <p className="rd-pocket__artist" aria-live="polite">
          {artist}
        </p>
        <div className="rd-pocket__progress">
          <span className="rd-pocket__elapsed">{formatTime(progressMs)}</span>
          <span className="rd-pocket__bar">
            <span className="rd-pocket__bar-fill" style={{ width: `${played}%` }} />
          </span>
          <span className="rd-pocket__remaining">{formatRemaining(durationMs - progressMs)}</span>
        </div>
      </div>

      <div
        ref={ref}
        className={`rd-wheel ${dragging ? "rd-wheel--dragging" : ""}`}
        tabIndex={0}
        role="group"
        aria-label="Click wheel: arrow keys change track, space plays"
        onKeyDown={handleKeyDown}
        {...handlers}
      >
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
          aria-label={isPaused ? "Play" : "Pause"}
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
          aria-label={isPaused ? "Play" : "Pause"}
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

      <Stickers list={stickers} />
    </div>
  );
}
