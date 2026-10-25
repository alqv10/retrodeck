import { useEffect, useRef, useState } from "react";
import { playDiscSpin, playSfx } from "./sfx.ts";

interface CdPlayerProps {
  artwork: string;
  albumId: string;
  trackName: string;
  artist: string;
  trackId: string;
  isPaused: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onTogglePlay: () => void;
}

type Phase = "idle" | "opening" | "ejecting" | "inserting" | "closing";

// Cambiar de disco: se levanta la tapa, sale el viejo, entra el nuevo, se cierra.
// Los ms son los mismos que las animaciones de CdPlayer.css.
const OPEN_MS = 300;
const EJECT_MS = 380;
const INSERT_MS = 560;
const CLOSE_MS = 320;

export function CdPlayer({
  artwork,
  albumId,
  trackName,
  artist,
  trackId,
  isPaused,
  onNext,
  onPrevious,
  onTogglePlay,
}: CdPlayerProps) {
  const [disc, setDisc] = useState(artwork);
  const [phase, setPhase] = useState<Phase>("idle");
  const previousAlbumId = useRef(albumId);
  const previousTrack = useRef(trackId);

  useEffect(() => {
    const previous = previousAlbumId.current;
    previousAlbumId.current = albumId;

    // Primer disco de la sesión, o el mismo con la portada recién llegada.
    if (!previous || previous === albumId) {
      setDisc(artwork);
      return;
    }

    setPhase("opening");
    // El mismo chasquido de plástico que la tapa del casete.
    playSfx("cassette-close", { volume: 0.5 });

    const timers = [
      setTimeout(() => setPhase("ejecting"), OPEN_MS),
      setTimeout(() => {
        setDisc(artwork);
        setPhase("inserting");
      }, OPEN_MS + EJECT_MS),
      setTimeout(() => {
        setPhase("closing");
        playSfx("cassette-close", { volume: 0.7 });
      }, OPEN_MS + EJECT_MS + INSERT_MS),
      setTimeout(() => {
        setPhase("idle");
        playDiscSpin();
      }, OPEN_MS + EJECT_MS + INSERT_MS + CLOSE_MS),
    ];
    return () => timers.forEach(clearTimeout);
  }, [albumId, artwork]);

  // Motor acelerando al saltar de pista. En un disco nuevo no: ahí ya suena al
  // final de la secuencia de la tapa.
  useEffect(() => {
    const previous = previousTrack.current;
    previousTrack.current = trackId;
    if (previous && previous !== trackId && previousAlbumId.current === albumId) playDiscSpin();
  }, [trackId, albumId]);

  const lidOpen = phase === "opening" || phase === "ejecting" || phase === "inserting";
  const spinning = !isPaused && phase === "idle";

  return (
    <div className="rd-cd-player">
      <div className="rd-cd-player__body">
        <div className="rd-cd-player__lcd">
          <span className="rd-cd-player__lcd-track">{trackName || "NO DISC"}</span>
          <span className="rd-cd-player__lcd-artist">{artist || "—"}</span>
        </div>

        <div className="rd-cd-player__well">
          <div className={`rd-cd-player__disc rd-cd-player__disc--${phase} ${spinning ? "rd-cd-player__disc--spinning" : ""}`}>
            {disc && <img src={disc} alt="" draggable={false} />}
            <span className="rd-cd-player__sheen" aria-hidden="true" />
            <span className="rd-cd-player__hub" aria-hidden="true" />
          </div>

          <div className={`rd-cd-player__lid ${lidOpen ? "rd-cd-player__lid--open" : ""}`} aria-hidden="true">
            <span className="rd-cd-player__latch" />
          </div>
        </div>

        <div className="rd-cd-player__controls">
          <button className="rd-cd-player__button" onClick={onPrevious} aria-label="Previous track">
            <svg viewBox="0 0 24 24" width="13" height="13">
              <path d="M6 5h2v14H6zm3 7 11-7v14z" fill="currentColor" />
            </svg>
          </button>
          <button
            className="rd-cd-player__button rd-cd-player__button--play"
            onClick={onTogglePlay}
            aria-label="Play / pause"
          >
            {isPaused ? (
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M8 5l12 7-12 7z" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="16" height="16">
                <rect x="6" y="5" width="4" height="14" fill="currentColor" />
                <rect x="14" y="5" width="4" height="14" fill="currentColor" />
              </svg>
            )}
          </button>
          <button className="rd-cd-player__button" onClick={onNext} aria-label="Next track">
            <svg viewBox="0 0 24 24" width="13" height="13">
              <path d="M16 5h2v14h-2zM4 5l11 7-11 7z" fill="currentColor" />
            </svg>
          </button>
        </div>

        <span className="rd-cd-player__badge" aria-hidden="true">
          COMPACT DISC · DIGITAL AUDIO
        </span>
      </div>
    </div>
  );
}
