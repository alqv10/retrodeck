import assert from "node:assert/strict";
import { test } from "node:test";
import { coastVelocity, detentFeel, shortestDelta } from "./knobMath.ts";

test("shortestDelta toma el camino corto", () => {
  assert.equal(shortestDelta(10, 40), 30);
  assert.equal(shortestDelta(40, 10), -30);
  // El salto del 180°: de 170 a -170 son 20 grados para adelante, no -340.
  assert.equal(shortestDelta(170, -170), 20);
  assert.equal(shortestDelta(-170, 170), -20);
  assert.equal(shortestDelta(0, 180), 180);
  assert.equal(shortestDelta(0, -180), -180);
});

test("las muescas atraen sin hacer caminar la perilla para atrás", () => {
  assert.equal(detentFeel(0, 10), 0);
  assert.ok(Math.abs(detentFeel(30, 10) - 30) < 1e-9);
  // Cerca de la muesca se queda atrás del dedo; pasando la mitad, se adelanta.
  assert.ok(detentFeel(2, 10) < 2);
  assert.ok(detentFeel(8, 10) > 8);
  let previous = detentFeel(-40, 10);
  for (let a = -39.9; a <= 40; a += 0.1) {
    const now = detentFeel(a, 10);
    assert.ok(now > previous, `retrocede en ${a}`);
    previous = now;
  }
});

test("la inercia se apaga sola y no cambia de sentido", () => {
  assert.equal(coastVelocity(0.6, 0, 180), 0.6);
  assert.ok(Math.abs(coastVelocity(0.6, 180, 180) - 0.6 / Math.E) < 1e-9);
  assert.ok(coastVelocity(-0.6, 900, 180) < 0);
  assert.ok(Math.abs(coastVelocity(-0.6, 900, 180)) < 0.01);
});
