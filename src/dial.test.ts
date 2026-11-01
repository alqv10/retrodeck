import assert from "node:assert/strict";
import { test } from "node:test";
import { station } from "./dial.ts";

test("station es estable y cae dentro del dial", () => {
  // La misma pista, la misma frecuencia: la aguja vuelve a donde estaba.
  assert.equal(station("spotify:track:42"), station("spotify:track:42"));
  assert.notEqual(station("track-1"), station("track-2"));

  // Nunca se sale del vidrio, ni con ids largos, raros o vacíos.
  for (const id of ["", "a", "track-1", "track-2", "x".repeat(400), "ñ☆/track#9"]) {
    const pos = station(id);
    assert.ok(pos >= 0 && pos < 1, `${id} cayó en ${pos}`);
  }
});
