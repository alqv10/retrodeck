import { useEffect, useRef, useState } from "react";
import { angleFromCenter, coastVelocity, detentFeel, shortestDelta } from "./knobMath.ts";

// Hasta dónde sigue sola una perilla soltada con impulso. El tope de velocidad
// es también el tope de canciones que se puede saltar de un manotazo: con estos
// dos valores recorre poco más de 100° y frena sola.
const MAX_COAST_SPEED = 0.6; // grados por ms
const MIN_COAST_SPEED = 0.03;
const COAST_TAU_MS = 180;
// Si el dedo se quedó quieto antes de soltar, no hay impulso que heredar.
const STILL_MS = 80;

interface RotaryDragOptions {
  onNext: () => void;
  onPrevious: () => void;
  triggerDegrees?: number;
  /** Muesca mecánica: suena bastante más seguido que el cambio de canción. */
  onDetent?: () => void;
  detentDegrees?: number;
  /** Sigue girando un poco al soltarla con impulso. Para perillas con masa. */
  coast?: boolean;
}

export function useRotaryDrag({
  onNext,
  onPrevious,
  triggerDegrees = 40,
  onDetent,
  detentDegrees = 10,
  coast = false,
}: RotaryDragOptions) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [coasting, setCoasting] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [rotation, setRotation] = useState(0);
  // Lo girado desde que existe el aparato: a diferencia de rotation, no vuelve
  // a cero al soltar. Es lo que dibuja una perilla que se queda donde la dejan.
  const [turned, setTurned] = useState(0);
  // El dedo que manda. En el teléfono es fácil que caiga un segundo dedo (o el
  // borde de la mano) sobre la rueda: sin esto, sus eventos se mezclan con los
  // del primero, los ángulos saltan y la canción cambia sola.
  const activePointer = useRef<number | null>(null);
  const lastAngle = useRef(0);
  const totalDelta = useRef(0);
  const turnedRef = useRef(0);
  const firedSinceStart = useRef(0);
  const detentsSinceStart = useRef(0);
  const velocity = useRef(0);
  const lastMoveAt = useRef(0);
  const coastFrame = useRef(0);

  useEffect(() => () => cancelAnimationFrame(coastFrame.current), []);

  function touchAngle(el: HTMLElement, e: React.PointerEvent) {
    const rect = el.getBoundingClientRect();
    const angle = angleFromCenter(rect.left + rect.width / 2, rect.top + rect.height / 2, e.clientX, e.clientY);
    // Directo al estilo: la sombra del dedo no tiene por qué pasar por React.
    el.style.setProperty("--rd-touch", `${angle}deg`);
    return angle;
  }

  /** Mover la superficie, sea con el dedo o por inercia: las muescas son las mismas. */
  function advance(step: number) {
    totalDelta.current += step;
    turnedRef.current += step;
    setRotation(totalDelta.current);
    setTurned(turnedRef.current);

    if (onDetent) {
      const detents = Math.trunc(totalDelta.current / detentDegrees);
      if (detents !== detentsSinceStart.current) {
        detentsSinceStart.current = detents;
        onDetent();
      }
    }

    const steps = Math.trunc(totalDelta.current / triggerDegrees);
    let diff = steps - firedSinceStart.current;
    while (diff !== 0) {
      if (diff > 0) {
        onNext();
        diff -= 1;
      } else {
        onPrevious();
        diff += 1;
      }
      setPulse((p) => p + 1);
    }
    firedSinceStart.current = steps;
  }

  /** Al quedar quieta, cae en la muesca más cercana y arranca la cuenta de nuevo. */
  function settle() {
    turnedRef.current = Math.round(turnedRef.current / detentDegrees) * detentDegrees;
    setTurned(turnedRef.current);
    setRotation(0);
    setCoasting(false);
  }

  function startCoast(speed: number) {
    let v = speed;
    let last = performance.now();
    setCoasting(true);
    const frame = (now: number) => {
      const dt = now - last;
      last = now;
      advance(v * dt);
      v = coastVelocity(v, dt, COAST_TAU_MS);
      if (Math.abs(v) < MIN_COAST_SPEED) settle();
      else coastFrame.current = requestAnimationFrame(frame);
    };
    coastFrame.current = requestAnimationFrame(frame);
  }

  function handlePointerDown(e: React.PointerEvent) {
    const el = ref.current;
    if (!el || activePointer.current !== null) return;
    // Agarrar una perilla que todavía gira la frena en seco.
    cancelAnimationFrame(coastFrame.current);
    setCoasting(false);
    activePointer.current = e.pointerId;
    lastAngle.current = touchAngle(el, e);
    totalDelta.current = 0;
    firedSinceStart.current = 0;
    detentsSinceStart.current = 0;
    velocity.current = 0;
    lastMoveAt.current = performance.now();
    setDragging(true);
    el.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (e.pointerId !== activePointer.current) return;
    const el = ref.current;
    if (!el) return;
    const current = touchAngle(el, e);
    const step = shortestDelta(lastAngle.current, current);
    lastAngle.current = current;

    const now = performance.now();
    const dt = Math.max(1, now - lastMoveAt.current);
    lastMoveAt.current = now;
    // Promediada: el último evento solo puede venir torcido por el dedo al levantarse.
    velocity.current = velocity.current * 0.6 + (step / dt) * 0.4;

    advance(step);
  }

  // También con pointercancel: el navegador se queda con el gesto cuando lo
  // confunde con uno del sistema, y si no soltamos acá el arrastre queda colgado.
  function endDrag(e: React.PointerEvent) {
    if (e.pointerId !== activePointer.current) return;
    activePointer.current = null;
    setDragging(false);
    if (ref.current?.hasPointerCapture(e.pointerId)) ref.current.releasePointerCapture(e.pointerId);

    const moving = performance.now() - lastMoveAt.current < STILL_MS;
    const speed = Math.max(-MAX_COAST_SPEED, Math.min(MAX_COAST_SPEED, velocity.current));
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (coast && !calm && moving && e.type === "pointerup" && Math.abs(speed) > MIN_COAST_SPEED * 3) startCoast(speed);
    else settle();
  }

  return {
    ref,
    dragging,
    coasting,
    pulse,
    rotation,
    /** Ángulo para dibujar: acumulado y con el tirón de las muescas. */
    angle: detentFeel(turned, detentDegrees),
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  };
}
