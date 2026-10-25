import assert from "node:assert/strict";
import { test } from "node:test";
import { shortestDelta } from "./knobMath.ts";

test("shortestDelta toma el camino corto", () => {
  assert.equal(shortestDelta(10, 40), 30);
  assert.equal(shortestDelta(40, 10), -30);
  // El salto del 180°: de 170 a -170 son 20 grados para adelante, no -340.
  assert.equal(shortestDelta(170, -170), 20);
  assert.equal(shortestDelta(-170, 170), -20);
  assert.equal(shortestDelta(0, 180), 180);
  assert.equal(shortestDelta(0, -180), -180);
});
