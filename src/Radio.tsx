import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { station } from "./dial.ts";
import { Stickers } from "./Stickers.tsx";
import { haptic, playKnob, playStatic, pressFeel } from "./sfx.ts";
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
   * trae ninguna. Se pegan en el orden que vengan, cada una torcida hacia la
   * de al lado: así el grupo se lee junto y no como dos calcos sueltas que se
   * dan la espalda.
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
const START = 16;
const SPAN = 62;

// Lo que gira la perilla por cada punto del dial, y cuánto se corre la aguja
// dentro de una emisora antes de enganchar la siguiente.
const KNOB_PER_DIAL = 3.4;
const NEEDLE_PLAY = 5;
const KNOB_STEP = 50;
// Un giro con la mano tarda en volver de Spotify: lo que llega dentro de este
// tiempo es la emisora que ya se giró, no un cambio que venga de afuera.
const OWN_TURN_MS = 3000;

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
  const handTurnAt = useRef(0);
  // Lo que giró la perilla sola, siguiendo a la emisora cuando el cambio vino
  // de las teclas o de la lista.
  const [dialTurn, setDialTurn] = useState(() => at(station(trackId)) * KNOB_PER_DIAL);

  // La sintonía se dispara de la canción que ya llegó, no del click: la aguja
  // y la estática arrancan junto con el dato, aunque la red tarde.
  useEffect(() => {
    const previous = previousTrack.current;
    previousTrack.current = trackId;
    if (!previous || previous === trackId) return;

    playStatic(TUNE_MS);
    setTuning(true);
    if (Date.now() - handTurnAt.current > OWN_TURN_MS) {
      setDialTurn((turn) => turn + (at(station(trackId)) - at(station(previous))) * KNOB_PER_DIAL);
    }
    const t = setTimeout(() => setTuning(false), TUNE_MS);
    return () => clearTimeout(t);
  }, [trackId]);

  const { ref, dragging, coasting, angle, rotation, handlers } = useRotaryDrag({
    onNext: () => {
      handTurnAt.current = Date.now();
      onNext();
    },
    onPrevious: () => {
      handTurnAt.current = Date.now();
      onPrevious();
    },
    triggerDegrees: KNOB_STEP,
    coast: true,
    onDetent: () => {
      playKnob();
      haptic();
    },
  });
  const inHand = dragging || coasting;

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
  // La aguja va atada a la perilla: se corre mientras se gira y recién al llegar
  // a la muesca de la emisora siguiente salta adonde cae esa.
  const needle = Math.min(START + SPAN, Math.max(START, freq + ((rotation % KNOB_STEP) / KNOB_STEP) * NEEDLE_PLAY));
  // Las dos partes se suman y ninguna se pisa: el dedo manda sobre lo que gira
  // y la emisora solo agrega lo suyo cuando el cambio vino de otro lado.
  const knobAngle = dialTurn + angle;

  return (
    <div className={`rd-radio ${className}`} style={style} role="group" aria-label={`${brand} radio`} {...pressFeel}>
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
              className={`rd-radio__needle ${tuning ? "rd-radio__needle--tuning" : inHand ? "rd-radio__needle--held" : ""}`}
              style={{ left: `${needle}%` }}
              aria-hidden="true"
            />

            <Stickers list={stickers} />

            <span className="rd-radio__glass" aria-hidden="true" />
          </div>

          <div
            ref={ref}
            className={`rd-radio__knob ${dragging ? "rd-radio__knob--dragging" : ""} ${inHand ? "rd-radio__knob--held" : ""} ${tuning ? "rd-radio__knob--tuning" : ""}`}
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
