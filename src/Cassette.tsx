import { useEffect, useRef, useState } from "react";
import { playSfx } from "./sfx.ts";

interface CassetteProps {
  isPaused: boolean;
  albumName: string;
  artwork: string;
  albumId: string;
  onNext: () => void;
  onPrevious: () => void;
  onTogglePlay: () => void;
  /** Texto moldeado en el plástico de la cinta, abajo de los carretes. */
  etching?: string;
}

type Phase = "idle" | "opening" | "ejecting" | "inserting" | "closing";

// La secuencia mecánica: se abre la tapa, sale el casete viejo, entra el nuevo,
// se cierra la tapa. Los ms coinciden con las animaciones de Cassette.css.
const OPEN_MS = 300;
const EJECT_MS = 380;
const INSERT_MS = 560;
const CLOSE_MS = 320;

export function Cassette({
  isPaused,
  albumName,
  artwork,
  albumId,
  onNext,
  onPrevious,
  onTogglePlay,
  etching = "GRACE",
}: CassetteProps) {
  const [tape, setTape] = useState({ name: albumName, art: artwork });
  const [phase, setPhase] = useState<Phase>("idle");
  const previousUri = useRef(albumId);

  // El cambio de casete se dispara del álbum que ya llegó, no del click: así la
  // animación y la portada nueva van siempre juntas, aunque la red tarde.
  useEffect(() => {
    const previous = previousUri.current;
    previousUri.current = albumId;

    // Primer álbum de la sesión, o el mismo con datos frescos: entra sin ceremonia.
    if (!previous || previous === albumId) {
      setTape({ name: albumName, art: artwork });
      return;
    }

    setPhase("opening");
    playSfx("cassette-eject");

    const timers = [
      setTimeout(() => setPhase("ejecting"), OPEN_MS),
      setTimeout(() => {
        setTape({ name: albumName, art: artwork });
        setPhase("inserting");
        playSfx("cassette-insert");
      }, OPEN_MS + EJECT_MS),
      setTimeout(() => {
        setPhase("closing");
        playSfx("cassette-close");
      }, OPEN_MS + EJECT_MS + INSERT_MS),
      setTimeout(() => setPhase("idle"), OPEN_MS + EJECT_MS + INSERT_MS + CLOSE_MS),
    ];
    return () => timers.forEach(clearTimeout);
  }, [albumId, albumName, artwork]);

  const lidOpen = phase === "opening" || phase === "ejecting" || phase === "inserting";
  const reelsSpinning = !isPaused && phase === "idle";

  return (
    <div className="rd-cassette">
      <div className="rd-cassette__deck">
        <div className={`rd-cassette__bay ${lidOpen ? "rd-cassette__bay--open" : ""}`}>
          <div className={`rd-cassette__tape rd-cassette__tape--${phase}`}>
            <div className="rd-cassette__tape-label">
              {tape.art ? (
                <img src={tape.art} alt="" draggable={false} />
              ) : (
                <span className="rd-cassette__tape-art-empty" aria-hidden="true" />
              )}
              <p className="rd-cassette__tape-title">{tape.name || "Mixtape"}</p>
            </div>

            <div className="rd-cassette__tape-window">
              <div className={`rd-cassette__reel ${reelsSpinning ? "rd-cassette__reel--spinning" : ""}`} />
              <span className="rd-cassette__tape-span" aria-hidden="true" />
              <div className={`rd-cassette__reel ${reelsSpinning ? "rd-cassette__reel--spinning" : ""}`} />
            </div>
            {etching && (
              <span className="rd-cassette__etching" aria-hidden="true">
                {etching}
              </span>
            )}
            <span className="rd-cassette__tape-head" aria-hidden="true" />
          </div>

          <div className="rd-cassette__lid" aria-hidden="true">
            <span className="rd-cassette__lid-grip" />
          </div>
        </div>

        <div className="rd-cassette__speaker" aria-hidden="true" />

        <div className="rd-cassette__keys">
          <button className="rd-cassette__key" onClick={onPrevious} aria-label="Previous track">
            <svg viewBox="0 0 24 24" width="15" height="15">
              <path d="M6 5h2v14H6zm3 7 11-7v14z" fill="currentColor" />
            </svg>
          </button>
          <button className="rd-cassette__key rd-cassette__key--play" onClick={onTogglePlay} aria-label="Play / pause">
            {isPaused ? (
              <svg viewBox="0 0 24 24" width="17" height="17">
                <path d="M8 5l12 7-12 7z" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="17" height="17">
                <rect x="6" y="5" width="4" height="14" fill="currentColor" />
                <rect x="14" y="5" width="4" height="14" fill="currentColor" />
              </svg>
            )}
          </button>
          <button className="rd-cassette__key" onClick={onNext} aria-label="Next track">
            <svg viewBox="0 0 24 24" width="15" height="15">
              <path d="M16 5h2v14h-2zM4 5l11 7-11 7z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
