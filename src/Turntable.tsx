import { useEffect, useRef, useState } from "react";
import { formatRemaining } from "./format.ts";
import { playSfx } from "./sfx.ts";

interface TurntableProps {
  artwork: string;
  isPaused: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onTogglePlay: () => void;
  spinTrigger: number;
  remainingMs: number;
  /** Marca serigrafiada en el chasis. */
  brand?: string;
  /** Mensaje grabado en el lacre del vinilo, como en los discos de verdad. Se lee con el disco quieto. */
  etching?: string;
}

export function Turntable({
  artwork,
  isPaused,
  onNext,
  onPrevious,
  onTogglePlay,
  spinTrigger,
  remainingMs,
  brand = "retrodeck",
  etching,
}: TurntableProps) {
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    if (spinTrigger === 0) return;
    playSfx("vinyl-stop", { volume: 0.5 });
    setSelecting(true);
    const t = setTimeout(() => setSelecting(false), 900); // coincide con turntable-select
    return () => clearTimeout(t);
  }, [spinTrigger]);

  // El frenazo del plato suena solo al pausar: ni al montar ni al reanudar.
  const wasPaused = useRef(isPaused);
  useEffect(() => {
    if (isPaused && !wasPaused.current) playSfx("vinyl-stop", { volume: 0.45 });
    wasPaused.current = isPaused;
  }, [isPaused]);

  return (
    <div className="rd-turntable">
      <span className="rd-turntable__brand" aria-hidden="true">
        {brand}
      </span>

      <div className="rd-turntable__platter">
        <div
          className={`rd-turntable__record ${selecting ? "rd-turntable__record--selecting" : ""} ${!selecting && !isPaused ? "rd-turntable__record--spinning" : ""}`}
        >
          {artwork && <img src={artwork} alt="" draggable={false} />}
          <div className="rd-turntable__grooves" aria-hidden="true" />
          {etching && (
            <span className="rd-turntable__etching" aria-hidden="true">
              {etching}
            </span>
          )}
          <span className="rd-turntable__spindle" aria-hidden="true" />
        </div>
      </div>

      <div className={`rd-turntable__arm ${!isPaused ? "rd-turntable__arm--playing" : ""}`} aria-hidden="true">
        <div className="rd-turntable__arm-tube">
          <span className="rd-turntable__counterweight" />
          <span className="rd-turntable__headshell" />
        </div>
      </div>

      <div className="rd-turntable__controls">
        <span className="rd-turntable__time">{formatRemaining(remainingMs)}</span>
        <button className="rd-turntable__skip" onClick={onPrevious} aria-label="Previous track">
          <svg viewBox="0 0 24 24" width="12" height="12">
            <path d="M6 5h2v14H6zm3 7 11-7v14z" fill="currentColor" />
          </svg>
        </button>
        <button className="rd-turntable__play" onClick={onTogglePlay} aria-label="Play / pause">
          {isPaused ? (
            <svg viewBox="0 0 24 24" width="14" height="14">
              <path d="M8 5l12 7-12 7z" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="14" height="14">
              <rect x="6" y="5" width="4" height="14" fill="currentColor" />
              <rect x="14" y="5" width="4" height="14" fill="currentColor" />
            </svg>
          )}
        </button>
        <button className="rd-turntable__skip" onClick={onNext} aria-label="Next track">
          <svg viewBox="0 0 24 24" width="12" height="12">
            <path d="M16 5h2v14h-2zM4 5l11 7-11 7z" fill="currentColor" />
          </svg>
        </button>
      </div>

      <span className={`rd-turntable__power ${isPaused ? "" : "rd-turntable__power--on"}`} aria-hidden="true" />
    </div>
  );
}
