import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { station } from "./dial.ts";
import { playKnob, playStatic } from "./sfx.ts";
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
  /** Serigrafía en el frente, al lado de las teclas. */
  brand?: string;
  /**
   * Calcomanías pegadas en el vidrio, abajo a la izquierda: las URLs de las
   * imágenes. Es el lugar para el chiste privado de cada uno — el paquete no
   * trae ninguna. Se pegan en el orden que vengan y cada una sale torcida
   * distinto, como se pegan de verdad.
   */
  stickers?: string[];
  /** Se suma a la clase del chasis, para pintar este aparato y no los otros. */
  className?: string;
  style?: CSSProperties;
}

// Lo que tarda la aguja en cruzar el dial. Coincide con la transición de
// .rd-radio__needle en Radio.css, y con lo que dura la estática.
const TUNE_MS = 620;

// Las dos escalas impresas en el vidrio, como en cualquier receptor: FM arriba
// en MHz y AM abajo en kHz. Son decorativas: lo que manda es la fracción.
const FM = [88, 92, 96, 100, 104, 108];
const AM = [530, 800, 1100, 1400, 1700];

// El tramo del vidrio por donde corren los números y la aguja. Lo que queda a
// los costados es para las etiquetas de banda y de unidad.
const START = 14;
const SPAN = 64;

/** De una fracción (0-1) al porcentaje dentro del tramo útil. */
function at(fraction: number) {
  return START + fraction * SPAN;
}

function markAt(values: number[], value: number) {
  const first = values[0];
  const last = values[values.length - 1];
  return at((value - first) / (last - first));
}

export function Radio({
  trackName,
  artist,
  trackId,
  isPaused,
  onNext,
  onPrevious,
  onTogglePlay,
  brand = "retrodeck",
  stickers,
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
    onDetent: playKnob,
  });

  // La perilla con el teclado. Solo si el foco está en la perilla misma: las
  // teclas de abajo ya responden a Enter por su cuenta.
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") onNext();
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") onPrevious();
    else if (e.key === " " || e.key === "Enter") onTogglePlay();
    else return;
    e.preventDefault();
    playKnob();
  }

  const freq = at(station(trackId));
  // La perilla sigue a la emisora, no al dedo: el arrastre devuelve un ángulo
  // relativo que vuelve a cero al soltar, y la marca pegaba un salto al final.
  const knobAngle = freq * 3.4;

  return (
    <div className={`rd-radio ${className}`} style={style} role="group" aria-label={`${brand} radio`}>
      <div className="rd-radio__case">
        <div className="rd-radio__face">
          <div className={`rd-radio__dial ${isPaused ? "" : "rd-radio__dial--lit"}`}>
            <div className="rd-radio__readout">
              <span className="rd-radio__station" aria-live="polite">
                {tuning ? "· · ·" : trackName || "—"}
              </span>
              <span className="rd-radio__artist" aria-live="polite">
                {tuning ? "" : artist}
              </span>
            </div>

            <div className="rd-radio__scale" aria-hidden="true">
              <span className="rd-radio__band">FM</span>
              {FM.map((mark) => (
                <span key={mark} className="rd-radio__mark" style={{ left: `${markAt(FM, mark)}%` }}>
                  {mark}
                </span>
              ))}
              <span className="rd-radio__unit">MHz</span>
            </div>

            <div className="rd-radio__rule" aria-hidden="true" />

            <div className="rd-radio__scale rd-radio__scale--am" aria-hidden="true">
              <span className="rd-radio__band">AM</span>
              {AM.map((mark) => (
                <span key={mark} className="rd-radio__mark" style={{ left: `${markAt(AM, mark)}%` }}>
                  {mark}
                </span>
              ))}
              <span className="rd-radio__unit">kHz</span>
            </div>

            <span
              className={`rd-radio__needle ${tuning ? "rd-radio__needle--tuning" : ""}`}
              style={{ left: `${freq}%` }}
              aria-hidden="true"
            />

            {stickers && stickers.length > 0 && (
              <div className="rd-radio__stickers" aria-hidden="true">
                {stickers.map((src, i) => (
                  <img key={src} className="rd-radio__sticker" src={src} alt="" draggable={false} style={{ "--rd-tilt": `${i % 2 ? 5 : -7}deg` } as CSSProperties} />
                ))}
              </div>
            )}

            <span className="rd-radio__glass" aria-hidden="true" />
          </div>

          <div
            ref={ref}
            className={`rd-radio__knob ${dragging ? "rd-radio__knob--dragging" : ""}`}
            tabIndex={0}
            role="group"
            aria-label="Tuning knob: arrow keys change station, space plays"
            onKeyDown={handleKeyDown}
            {...handlers}
          >
            <span className="rd-radio__knob-face" style={{ transform: `rotate(${knobAngle}deg)` }} aria-hidden="true">
              <span className="rd-radio__knob-notch" />
            </span>
          </div>
        </div>

        <div className="rd-radio__base">
          <span className={`rd-radio__lamp ${isPaused ? "" : "rd-radio__lamp--on"}`} aria-hidden="true" />
          <span className="rd-radio__brand" aria-hidden="true">
            {brand}
          </span>

          <div className="rd-radio__keys">
            <button className="rd-radio__key" onClick={onPrevious} aria-label="Previous track">
              <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
                <path d="M6 5h2v14H6zm3 7 11-7v14z" fill="currentColor" />
              </svg>
            </button>
            <button className="rd-radio__key" onClick={onTogglePlay} aria-label={isPaused ? "Play" : "Pause"}>
              {isPaused ? (
                <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
                  <path d="M8 5l12 7-12 7z" fill="currentColor" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
                  <rect x="6" y="5" width="4" height="14" fill="currentColor" />
                  <rect x="14" y="5" width="4" height="14" fill="currentColor" />
                </svg>
              )}
            </button>
            <button className="rd-radio__key" onClick={onNext} aria-label="Next track">
              <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
                <path d="M16 5h2v14h-2zM4 5l11 7-11 7z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
