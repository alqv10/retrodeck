# retrodeck

[![npm](https://img.shields.io/npm/v/retrodeck?color=%23e3b765&labelColor=%23131417)](https://www.npmjs.com/package/retrodeck) [![license](https://img.shields.io/npm/l/retrodeck?color=%23e3b765&labelColor=%23131417)](./LICENSE)

![Las cuatro carcasas: rueda, tornamesa, discman y casete](https://raw.githubusercontent.com/alqv10/retrodeck/main/docs/retrodeck.png)

Four retro music-player chassis as React components: a click wheel, a turntable, a
discman and a cassette deck. Pure CSS — no images, no canvas, no dependencies —
with the mechanical sounds that go with them.

**[See them running](https://retrodeck-jet.vercel.app)** — drag the wheel, change the plastic.

The components know nothing about where the audio comes from. You pass the track,
the artwork and three callbacks; they do the plastic.

```sh
npm i retrodeck
```

```jsx
import { Cassette } from "retrodeck";
import "retrodeck/retrodeck.css";

<div style={{ width: 300 }}>
  <Cassette
    albumName={album.name}
    albumId={album.id}
    artwork={album.cover}
    isPaused={isPaused}
    onNext={next}
    onPrevious={previous}
    onTogglePlay={toggle}
  />
</div>;
```

Every chassis is `width: 100%`, so it fills whatever box you put it in. Give it
somewhere between 250 and 320 px and it looks like the real thing.

## The four

### `<Wheel>`

An aluminium pocket player: a glass screen with a progress bar and a click wheel
you actually drag. It tracks a single pointer, so a second thumb landing on the
glass can't skip your song; every 10° is a detent click, every 40° a track.

| prop | type | |
| --- | --- | --- |
| `trackName`, `artist` | `string` | printed on the screen |
| `progressMs`, `durationMs` | `number` | drives the bar and both timers |
| `isPaused` | `boolean` | |
| `brand` | `string?` | the line above the track, default `"retrodeck"` |
| `onNext`, `onPrevious`, `onTogglePlay` | `() => void` | |

### `<Turntable>`

A matte black plinth with an S-shaped arm. The platter spins with the track and
brakes when you pause.

| prop | type | |
| --- | --- | --- |
| `artwork` | `string` | the label on the record |
| `remainingMs` | `number` | shown on the display |
| `isPaused` | `boolean` | |
| `spinTrigger` | `number` | bump it and the platter brakes and cues the next record |
| `etching` | `string?` | grooved into the dead wax, readable once the disc stops; default `"GRACE"` |
| `brand` | `string?` | silk-screened on the plinth, default `"retrodeck"` |
| `onNext`, `onPrevious`, `onTogglePlay` | `() => void` | |

### `<CdPlayer>`

A round glossy discman. A new `albumId` lifts the lid, ejects the old disc, drops
the new one in and spins the motor back up; skipping inside the same album just
revs the motor.

| prop | type | |
| --- | --- | --- |
| `artwork` | `string` | printed on the disc |
| `albumId`, `trackId` | `string` | identity only: a change drives the animation |
| `trackName`, `artist` | `string` | on the LCD |
| `isPaused` | `boolean` | |
| `onNext`, `onPrevious`, `onTogglePlay` | `() => void` | |

### `<Cassette>`

A moulded-plastic deck. The deck stays put; only the tape changes — the lid
opens, the old tape ejects, the new one goes in, the lid clunks shut.

| prop | type | |
| --- | --- | --- |
| `albumName` | `string` | handwritten on the label |
| `artwork` | `string` | the label's picture |
| `albumId` | `string` | identity only: a change swaps the tape |
| `etching` | `string?` | moulded into the tape shell, under the reels; default `"GRACE"` |
| `isPaused` | `boolean` | |
| `onNext`, `onPrevious`, `onTogglePlay` | `() => void` | |

## Colour

Two custom properties paint all four, each in its own material: saturated plastic
(cassette, discman), dark lacquer (turntable), brushed aluminium (wheel).

```css
.app {
  --rd-body: #9e2f2a;   /* the plastic */
  --rd-accent: #5ec98b; /* buttons, labels, displays */
}
```

Set them anywhere above the player — `:root`, a container, the chassis itself. The
defaults are amber on blue.

## Sound

The cassette and the turntable play short mp3s that ship with the package; the
wheel's click and the CD motor are synthesised with WebAudio, because a 30 ms clip
isn't worth the download. Nothing plays until the user touches something, which is
also what browsers require.

```js
import { setSfxVolume } from "retrodeck";

setSfxVolume(0.6); // 0 silences everything, including the synthesised clicks
```

Tie it to your player's volume: music turned down while the deck still clunks at
full blast is the thing people notice first.

## Two details

- The cassette label is handwriting: load [Permanent Marker](https://fonts.google.com/specimen/Permanent+Marker)
  and it looks right. Without it you get the browser's cursive fallback.
- The stylesheet is one import and sets nothing globally — no reset, no body
  styles. Class names are all `rd-`, custom properties all `--rd-`.

## Where it comes from

Extracted from [Radiostatio](https://radiostatio.vercel.app), a Spotify player
with retro cases, where these four have been in use with a real audio pipeline.

MIT.
