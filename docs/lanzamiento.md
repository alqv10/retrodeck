# Textos para publicar

Borradores para difundir el paquete. No son parte de la documentación: viven acá
para no reescribirlos cada vez.

## r/reactjs y r/webdev

**Título**

    retrodeck – four retro music-player chassis as React components, pure CSS, no deps

**Cuerpo**

    I built a Spotify player with retro cases a while back, and the cases were
    the part people actually reacted to — so I pulled them out into their own
    MIT package: a click wheel, a turntable, a discman and a cassette deck.

    All pure CSS. No images, no canvas, no dependencies. The components know
    nothing about where the audio comes from: you pass the track, the artwork
    and three callbacks, and they do the plastic.

    Three details I enjoyed getting right:

    - The click wheel follows a single pointer, so a second thumb landing on the
      glass can't skip your song. Every 10° is a detent click, every 40° a track.
    - Changing albums on the cassette deck runs a four-phase sequence — lid open,
      tape out, tape in, lid shut — fired by the album that arrived rather than
      by the click, so on a slow connection the artwork and the animation land
      together instead of the deck swapping an empty tape.
    - Two custom properties repaint all four, each in its own material:
      saturated plastic, dark lacquer, brushed aluminium.

    Demo (drag the wheel): https://retrodeck-jet.vercel.app
    Source: https://github.com/alqv10/retrodeck

## Show HN

**Título**

    Show HN: Retrodeck – Four retro music-player chassis as React components

**Cuerpo**

    These started inside a Spotify player I built for fun. The cases turned out
    to be the interesting part, so they are their own package now: pure CSS, no
    images and no dependencies, with the mechanical sounds that go with them.

    The audio is yours — the components only know the track, the artwork and
    three callbacks. The demo runs on a fake player so you can try the mechanics
    without an account.

    https://retrodeck-jet.vercel.app

## Bluesky / X

Con el GIF del casete adjunto (`docs/cassette.gif`):

    Pulled the four player cases out of my Spotify side project into an MIT
    package. A click wheel you can drag, a turntable that brakes when you pause,
    a discman that swaps discs, and this cassette deck.

    Pure CSS. No images, no dependencies.

    https://retrodeck-jet.vercel.app

## Cuándo

Martes o miércoles a la mañana, hora de Estados Unidos (entre las 8 y las 10 ET,
o sea entre las 7 y las 9 de la mañana acá). Un solo lugar por día: publicar en
todos a la vez no multiplica nada y en Reddit se nota.

## La ficha del repo

En github.com/alqv10/retrodeck, el engranaje al lado de "About":

- **Description**: Four retro music-player chassis as React components: click
  wheel, turntable, discman and cassette deck. Pure CSS, mechanical sound, zero
  dependencies.
- **Website**: https://retrodeck-jet.vercel.app
- **Topics**: react, ui-components, css, retro, skeuomorphism, music-player,
  cassette, turntable, typescript
