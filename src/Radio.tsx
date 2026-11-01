import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { station } from "./dial.ts";
import { playStatic, playTick } from "./sfx.ts";
import { useRotaryDrag } from "./useRotaryDrag.ts";

interface RadioProps {
  trackName: string;
  artist: string;
  /** Cada canción es una emisora: de acá sale en qué punto del dial cae. */
  trackId: string;
  isPaused: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onTogglePlay: () => void;
  /** Serigrafía en el vidrio del dial. */
  brand?: string;
  /** Se suma a la clase del chasis, para pintar este aparato y no los otros. */
  className?: string;
  style?: CSSProperties;
}

// Lo que tarda la aguja en cruzar el dial. Coincide con la transición de
// .rd-radio__needle en Radio.css, y con lo que dura la estática.
const TUNE_MS = 620;

const MARKS = [88, 92, 96, 100, 104, 108];

export function Radio({
  trackName,
  artist,
  trackId,
  isPaused,
  onNext,
  onPrevious,
  onTogglePlay,
  brand = "retrodeck",
  className = "",
  style,
}: RadioProps) {
  const [tuning, setTuning] = useState(false);
  const previousTrack = useRef(trackId);

  // La sintonía se dispara de la canción que ya llegó, no del click: la aguja
  // y la estática arrancan junto con el dato, aunque la red tarde.
  useEffect(() => {
    const previous = previousTrack.current;
    previousTrack.current = trackId;
    if (!previous || previous === trackId) return;

    playStatic(TUNE_MS);
    setTuning(true);
    const t = setTimeout(() => setTuning(false), TUNE_MS);
    return () => clearTimeout(t);
  }, [trackId]);

  const { ref, dragging, handlers } = useRotaryDrag({
    onNext,
    onPrevious,
    triggerDegrees: 50,
    onDetent: playTick,
  });

  // La perilla con el teclado. Solo si el foco está en la perilla misma.
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") onNext();
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") onPrevious();
    else if (e.key === " " || e.key === "Enter") onTogglePlay();
    else return;
    e.preventDefault();
    playTick();
  }

  const freq = station(trackId);
  // La perilla sigue a la emisora, no al dedo: el arrastre devuelve un ángulo
  // relativo que vuelve a cero al soltar, y la marca pegaba un salto al final.
  const knobAngle = freq * 3.4;

  return (
    <div className={`rd-radio ${className}`} style={style} role="group" aria-label={`${brand} radio`}>
      <div className="rd-radio__case">
        <div className="rd-radio__dial">
          <div className="rd-radio__scale" aria-hidden="true">
            {MARKS.map((mark) => (
              <span key={mark} className="rd-radio__mark" style={{ left: `${((mark - 86) / 24) * 100}%` }}>
                {mark}
              </span>
            ))}
          </div>

          <span
            className={`rd-radio__needle ${tuning ? "rd-radio__needle--tuning" : ""}`}
            style={{ left: `${freq}%` }}
            aria-hidden="true"
          />

          <div className="rd-radio__station">
            <span className="rd-radio__station-name" aria-live="polite">
              {tuning ? "· · ·" : trackName || "—"}
            </span>
            <span className="rd-radio__station-artist" aria-live="polite">
              {tuning ? "" : artist}
            </span>
          </div>

          <span className="rd-radio__brand" aria-hidden="true">
            {brand}
          </span>
        </div>

        <div className="rd-radio__front">
          <div className="rd-radio__grille" aria-hidden="true" />

          <div className="rd-radio__right">
            <div
              ref={ref}
              className={`rd-radio__knob ${dragging ? "rd-radio__knob--dragging" : ""}`}
              tabIndex={0}
              role="group"
              aria-label="Tuning knob: arrow keys change station, space plays"
              onKeyDown={handleKeyDown}
              {...handlers}
            >
              <span className="rd-radio__knob-face" style={{ transform: `rotate(${knobAngle}deg)` }}>
                <span className="rd-radio__knob-notch" />
              </span>
            </div>

            <button
              className={`rd-radio__power ${isPaused ? "" : "rd-radio__power--on"}`}
              onClick={onTogglePlay}
              aria-label={isPaused ? "Play" : "Pause"}
            >
              <span className="rd-radio__lamp" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
