import { useEffect, useRef, useState } from "react";

/** Portada generada: un SVG de dos tonos, para no cargar imágenes en la demo. */
const cover = (hue: number) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0" stop-color="hsl(${hue} 68% 58%)"/>` +
      `<stop offset="1" stop-color="hsl(${hue + 35} 62% 24%)"/></linearGradient></defs>` +
      `<rect width="300" height="300" fill="url(#g)"/>` +
      `<circle cx="150" cy="150" r="80" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="9"/>` +
      `<circle cx="150" cy="150" r="21" fill="rgba(255,255,255,.72)"/></svg>`,
  )}`;

const TRACKS = [
  { name: "Sound check", artist: "The Spare Parts", album: "Night Shift", hue: 28, durationMs: 183_000 },
  { name: "B side", artist: "The Spare Parts", album: "Night Shift", hue: 200, durationMs: 214_000 },
  { name: "Take three", artist: "Cassette Theory", album: "Second Pass", hue: 320, durationMs: 167_000 },
  { name: "Tape hiss", artist: "Cassette Theory", album: "Second Pass", hue: 96, durationMs: 151_000 },
];

/**
 * Un reproductor de mentira, con la misma forma que uno de verdad: las carcasas
 * no saben de dónde sale el audio. No suena música, solo los ruidos mecánicos.
 */
export function useFakePlayer() {
  const [index, setIndex] = useState(0);
  const [isPaused, setPaused] = useState(true);
  const [progressMs, setProgress] = useState(0);
  // La tornamesa frena y arranca el plato cuando este número cambia.
  const [spinTrigger, setSpinTrigger] = useState(0);
  // Posición acumulada hasta la última pausa, y desde cuándo corre el reloj.
  const played = useRef(0);
  const since = useRef(Date.now());

  const track = TRACKS[index];

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      const next = played.current + (Date.now() - since.current);
      if (next >= track.durationMs) {
        go(1);
        return;
      }
      setProgress(next);
    }, 250);
    return () => clearInterval(id);
  }, [isPaused, index, track.durationMs]);

  function go(step: number) {
    played.current = 0;
    since.current = Date.now();
    setProgress(0);
    setSpinTrigger((n) => n + 1);
    setIndex((i) => (i + step + TRACKS.length) % TRACKS.length);
  }

  return {
    trackName: track.name,
    artist: track.artist,
    albumName: track.album,
    albumId: track.album,
    trackId: `${index}`,
    artwork: cover(track.hue),
    isPaused,
    progressMs,
    spinTrigger,
    durationMs: track.durationMs,
    remainingMs: track.durationMs - progressMs,
    onNext: () => go(1),
    onPrevious: () => go(-1),
    onTogglePlay: () => {
      played.current = isPaused ? played.current : played.current + (Date.now() - since.current);
      since.current = Date.now();
      setPaused(!isPaused);
    },
  };
}
