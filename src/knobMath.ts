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
