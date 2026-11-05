export function angleFromCenter(cx: number, cy: number, x: number, y: number) {
  return (Math.atan2(y - cy, x - cx) * 180) / Math.PI;
}

/**
 * Lo que se movió el dedo entre dos ángulos, por el camino corto. Sin esto,
 * cruzar el 180° (la izquierda de la rueda) se lee como media vuelta de golpe
 * y la canción salta sola.
 */
export function shortestDelta(from: number, to: number) {
  let step = to - from;
  if (step > 180) step -= 360;
  if (step < -180) step += 360;
  return step;
}

/**
 * El tirón de las muescas: alrededor de cada una la perilla se resiste y entre
 * dos se adelanta, en vez de seguir al dedo como si girara en el aire. Con
 * strength menor a 1 nunca camina para atrás mientras el dedo avanza.
 */
export function detentFeel(angle: number, detent: number, strength = 0.7) {
  return angle - (detent / (2 * Math.PI)) * strength * Math.sin((2 * Math.PI * angle) / detent);
}

/** La velocidad que le queda a una perilla suelta después de dt ms de roce. */
export function coastVelocity(velocity: number, dtMs: number, tauMs: number) {
  return velocity * Math.exp(-dtMs / tauMs);
}
