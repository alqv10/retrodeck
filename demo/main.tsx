import { StrictMode, useState, type CSSProperties, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { Cassette, CdPlayer, Radio, setSfxVolume, Turntable, Wheel } from "../src/index.ts";
import "../src/retrodeck.css";
import "./demo.css";
import { cover, useFakePlayer } from "./fakePlayer.ts";

// Dos calcos de ejemplo, dibujadas acá: el paquete no trae ninguna, el hueco es
// para la que quiera pegar cada uno.
const sticker = (svg: string) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">${svg}</svg>`)}`;
const STICKERS = [
  sticker(`<circle cx="20" cy="20" r="15" fill="#f2c14e"/><circle cx="15" cy="17" r="2" fill="#2b2b2b"/><circle cx="25" cy="17" r="2" fill="#2b2b2b"/><path d="M13 24c3 4 11 4 14 0" stroke="#2b2b2b" stroke-width="2.4" fill="none" stroke-linecap="round"/>`),
  sticker(`<path d="M20 4l4.6 10.2L35 15.8l-7.6 7.3 1.9 10.6L20 28.6l-9.3 5.1 1.9-10.6L5 15.8l10.4-1.6z" fill="#e0614f"/>`),
];

const PLASTICS = ["#1f5aa8", "#9e2f2a", "#2c7a56", "#3a3d44", "#b08a4a", "#5b3f9e"];
const ACCENTS = ["#e3b765", "#e0614f", "#5ec98b", "#6ab6f0", "#f08bc0", "#dcd8cf"];

function Snippet({ code }: { code: string }) {
  return (
    <pre className="snippet">
      <code>{code}</code>
    </pre>
  );
}

const DECKS = ["cassette", "cd", "turntable", "wheel", "radio"] as const;
type DeckName = (typeof DECKS)[number];

/**
 * El banco de pruebas: una cinta inventada por el visitante y un solo aparato
 * para verla entrar. El álbum se carga con el botón y no mientras se escribe:
 * si no, cada tecla sería un cambio de álbum, con su expulsión y su ruido.
 */
function Bench() {
  const player = useFakePlayer(0);
  const [deck, setDeck] = useState<DeckName>("cassette");
  const [draft, setDraft] = useState({ album: "Night Shift", artist: "The Spare Parts", track: "Sound check", hue: 28 });
  const [tape, setTape] = useState(draft);
  const [mark, setMark] = useState("GRACE");
  const [body, setBody] = useState("#9e2f2a");
  const [stickers, setStickers] = useState(true);

  const art = cover(tape.hue);
  const common = {
    stickers: stickers ? STICKERS : undefined,
    isPaused: player.isPaused,
    onNext: player.onNext,
    onPrevious: player.onPrevious,
    onTogglePlay: player.onTogglePlay,
    style: { "--rd-body": body } as CSSProperties,
  };

  const decks: Record<DeckName, ReactNode> = {
    cassette: <Cassette {...common} albumId={tape.album} albumName={tape.album} artwork={art} etching={mark} brand={mark || "retrodeck"} />,
    cd: (
      <CdPlayer
        {...common}
        albumId={tape.album}
        trackId={`${tape.album}-${player.trackId}`}
        trackName={tape.track}
        artist={tape.artist}
        artwork={art}
        badge={mark ? `${mark} · DIGITAL AUDIO` : undefined}
      />
    ),
    turntable: (
      <Turntable
        {...common}
        artwork={art}
        spinTrigger={player.spinTrigger}
        remainingMs={player.remainingMs}
        etching={mark}
        brand={mark || "retrodeck"}
      />
    ),
    wheel: (
      <Wheel
        {...common}
        trackName={tape.track}
        artist={tape.artist}
        progressMs={player.progressMs}
        durationMs={player.durationMs}
        brand={mark || "retrodeck"}
      />
    ),
    radio: (
      <Radio
        {...common}
        trackName={tape.track}
        artist={tape.artist}
        trackId={`${tape.album}-${player.trackId}`}
        brand={mark || "retrodeck"}
      />
    ),
  };

  const component = { cd: "CdPlayer", wheel: "Wheel", cassette: "Cassette", turntable: "Turntable", radio: "Radio" }[deck];
  // El snippet muestra solo lo que este banco cambia, con la misma lógica que
  // las props de arriba: sin marca, cada aparato vuelve a su default.
  const lines = [
    deck === "cassette" && `albumName="${tape.album}"`,
    deck !== "cassette" && deck !== "turntable" && `trackName="${tape.track}"\n  artist="${tape.artist}"`,
    mark && (deck === "cassette" || deck === "turntable") && `etching="${mark}"`,
    mark && deck === "cd" && `badge="${mark} · DIGITAL AUDIO"`,
    mark && deck !== "cd" && `brand="${mark}"`,
    stickers && `stickers={["/smile.svg", "/star.svg"]}`,
    `style={{ "--rd-body": "${body}" }}`,
    "…",
  ].filter(Boolean);
  const code = `<${component}\n  ${lines.join("\n  ")}\n/>`;

  return (
    <section className="bench">
      <h2>Make your own</h2>
      <p>
        Write a record, pick a chassis, paint that one only. <code>style</code> and <code>className</code> land on the
        chassis, so one player can break from the page palette without a second stylesheet. <code>stickers</code> takes
        any image URLs and slaps them on with a die-cut white edge, wherever they'd go on that machine.
      </p>

      <div className="bench__grid">
        <form
          className="bench__form"
          onSubmit={(e) => {
            e.preventDefault();
            setTape(draft);
          }}
        >
          <div className="bench__tabs" role="group" aria-label="Chassis">
            {DECKS.map((name) => (
              <button
                key={name}
                type="button"
                className={`bench__tab ${deck === name ? "bench__tab--on" : ""}`}
                onClick={() => setDeck(name)}
                aria-pressed={deck === name}
              >
                {name}
              </button>
            ))}
          </div>

          <label className="bench__field">
            Album
            <input value={draft.album} onChange={(e) => setDraft({ ...draft, album: e.target.value })} maxLength={28} />
          </label>
          <label className="bench__field">
            Artist
            <input value={draft.artist} onChange={(e) => setDraft({ ...draft, artist: e.target.value })} maxLength={28} />
          </label>
          <label className="bench__field">
            Track
            <input value={draft.track} onChange={(e) => setDraft({ ...draft, track: e.target.value })} maxLength={28} />
          </label>
          <label className="bench__field">
            Etched mark
            <input value={mark} onChange={(e) => setMark(e.target.value.slice(0, 14))} maxLength={14} />
          </label>
          <label className="bench__field bench__field--row">
            Cover
            <input
              type="range"
              min="0"
              max="359"
              value={draft.hue}
              onChange={(e) => setDraft({ ...draft, hue: Number(e.target.value) })}
              aria-label="Cover hue"
            />
          </label>
          <label className="bench__field bench__field--row">
            Plastic
            <input type="color" value={body} onChange={(e) => setBody(e.target.value)} aria-label="This chassis only" />
          </label>
          <label className="bench__field bench__field--row">
            Stickers
            <input type="checkbox" checked={stickers} onChange={(e) => setStickers(e.target.checked)} />
          </label>

          <button className="bench__load" type="submit">
            Load it
          </button>
          <Snippet code={code} />
        </form>

        <div className={deck === "wheel" ? "stage stage--wheel" : "stage"}>{decks[deck]}</div>
      </div>
    </section>
  );
}

function Demo() {
  // Uno por aparato: cada carcasa con su propia cinta y su propio silencio.
  const wheel = useFakePlayer(0);
  const turntable = useFakePlayer(1);
  const discman = useFakePlayer(2);
  const cassette = useFakePlayer(3);
  const radio = useFakePlayer(1);
  const wheelBay = useFakePlayer(1);
  const [plastic, setPlastic] = useState(PLASTICS[0]);
  const [accent, setAccent] = useState(ACCENTS[0]);
  const [sound, setSound] = useState(true);

  function toggleSound() {
    setSfxVolume(sound ? 0 : 0.6);
    setSound(!sound);
  }

  // ?capture=cassette deja un solo aparato sobre el fondo y nada más, para
  // grabar el GIF sin titulares ni bloques de código alrededor. Sin valor,
  // salen los cinco en fila.
  const capture = new URLSearchParams(location.search).get("capture");
  if (capture !== null) {
    const decks: Record<string, ReactNode> = {
      wheel: <Wheel {...wheel} brand="retrodeck" stickers={STICKERS} />,
      turntable: <Turntable {...turntable} stickers={STICKERS} />,
      cd: <CdPlayer {...discman} stickers={STICKERS} />,
      cassette: <Cassette {...cassette} stickers={STICKERS} />,
      radio: <Radio {...radio} stickers={STICKERS} />,
    };
    const shown = capture in decks ? [capture] : Object.keys(decks);
    return (
      <div className="capture" style={{ "--rd-body": plastic, "--rd-accent": accent } as CSSProperties}>
        {shown.map((k) => (
          <div key={k} className={k === "wheel" ? "stage stage--wheel" : "stage"}>
            {decks[k]}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="page" style={{ "--rd-body": plastic, "--rd-accent": accent } as CSSProperties}>
      <header className="rail">
        <span className="rail__name">retrodeck</span>
        <nav className="rail__links">
          <a href="https://www.npmjs.com/package/retrodeck">npm</a>
          <a href="https://github.com/alqv10/retrodeck">source</a>
        </nav>
      </header>

      <section className="hero">
        <div className="hero__words">
          <h1>Players that feel like objects.</h1>
          <p className="hero__lead">
            Five chassis as React components: click wheel, turntable, discman, cassette deck, dial radio. Pure CSS, mechanical
            sound, no dependencies. You bring the audio.
          </p>
          <Snippet code="npm i retrodeck" />
          <p className="hero__hint">Drag the wheel. It counts detents and clicks like the real thing.</p>
        </div>
        <div className="hero__object">
          <div className="stage stage--wheel">
            <Wheel {...wheel} brand="retrodeck" />
          </div>
        </div>
      </section>

      <section className="bay">
        <div className="stage">
          <Turntable {...turntable} />
        </div>
        <div className="bay__words">
          <h2>Turntable</h2>
          <p>
            The platter spins with the track and brakes when you pause. Bump <code>spinTrigger</code> and it cues the
            next record. Whatever you put in <code>etching</code> is grooved into the dead wax, readable once the disc stops — the
            cassette carries the same mark, moulded into the shell.
          </p>
          <Snippet
            code={`<Turntable
  artwork={cover}
  isPaused={isPaused}
  remainingMs={durationMs - progressMs}
  spinTrigger={changeCount}
  etching="GRACE"
  onNext={next}
  onPrevious={previous}
  onTogglePlay={toggle}
/>`}
          />
        </div>
      </section>

      <section className="bay bay--flip">
        <div className="stage">
          <CdPlayer {...discman} />
        </div>
        <div className="bay__words">
          <h2>Discman</h2>
          <p>
            A new <code>albumId</code> lifts the lid, ejects the old disc, drops the new one in and spins the motor back
            up. Skipping inside the same album just revs the motor.
          </p>
          <Snippet
            code={`<CdPlayer
  artwork={cover}
  albumId={album.id}
  trackId={track.id}
  trackName={track.name}
  artist={track.artist}
  isPaused={isPaused}
  onNext={next}
  onPrevious={previous}
  onTogglePlay={toggle}
/>`}
          />
        </div>
      </section>

      <section className="bay">
        <div className="stage">
          <Cassette {...cassette} />
        </div>
        <div className="bay__words">
          <h2>Cassette deck</h2>
          <p>
            The deck stays put; only the tape changes. Four phases, a plastic clunk on each, and the album title written
            on the label by hand.
          </p>
          <Snippet
            code={`<Cassette
  artwork={cover}
  albumId={album.id}
  albumName={album.name}
  isPaused={isPaused}
  onNext={next}
  onPrevious={previous}
  onTogglePlay={toggle}
/>`}
          />
        </div>
      </section>

      <section className="bay bay--flip">
        <div className="stage">
          <Radio {...radio} stickers={STICKERS} />
        </div>
        <div className="bay__words">
          <h2>Dial radio</h2>
          <p>
            Every track is a station: the id hashes to a fixed spot on the dial, so the needle always comes back to the
            same place. A new <code>trackId</code> sweeps it across and bursts the static while it travels — noise
            through a bandpass that sweeps with the needle, plus the whistle of crossing a carrier. Synthesised,
            nothing to download. The knob is the click wheel's own drag mechanic: turn it to tune, or focus it and use
            the arrow keys.
          </p>
          <Snippet
            code={`<Radio
  trackId={track.id}
  trackName={track.name}
  artist={track.artist}
  isPaused={isPaused}
  brand="retrodeck"
  onNext={next}
  onPrevious={previous}
  onTogglePlay={toggle}
/>`}
          />
        </div>
      </section>

      <section className="bay">
        <div className="stage stage--wheel">
          <Wheel {...wheelBay} brand="your app" />
        </div>
        <div className="bay__words">
          <h2>Click wheel</h2>
          <p>
            One pointer only, so a second thumb on the glass can't skip your song. Every ten degrees is a detent, forty
            is a track. The screen prints whatever you pass it.
          </p>
          <Snippet
            code={`<Wheel
  trackName={track.name}
  artist={track.artist}
  progressMs={progressMs}
  durationMs={track.durationMs}
  isPaused={isPaused}
  brand="your app"
  onNext={next}
  onPrevious={previous}
  onTogglePlay={toggle}
/>`}
          />
        </div>
      </section>

      <Bench />

      <section className="paint">
        <h2>Two variables paint all five</h2>
        <p>
          Every chassis mixes its colour from <code>--rd-body</code> and <code>--rd-accent</code>, each in its own
          material: saturated plastic, dark lacquer, brushed aluminium, tinted graphite. Set them anywhere above the
          player.
        </p>
        <Snippet code={`.app { --rd-body: #9e2f2a; --rd-accent: #5ec98b; }`} />
      </section>

      <footer className="foot">
        <span>MIT</span>
        <span>
          Built out of <a href="https://radiostatio.vercel.app">Radiostatio</a>, a Spotify player with retro cases.
        </span>
      </footer>

      <div className="panel">
        <div className="panel__group">
          <span className="panel__label">Plastic</span>
          <div className="panel__swatches">
            {PLASTICS.map((hex) => (
              <button
                key={hex}
                className={`swatch ${plastic === hex ? "swatch--on" : ""}`}
                style={{ background: hex }}
                onClick={() => setPlastic(hex)}
                aria-label={`Plastic ${hex}`}
                aria-pressed={plastic === hex}
              />
            ))}
          </div>
        </div>
        <div className="panel__group">
          <span className="panel__label">Accent</span>
          <div className="panel__swatches">
            {ACCENTS.map((hex) => (
              <button
                key={hex}
                className={`swatch ${accent === hex ? "swatch--on" : ""}`}
                style={{ background: hex }}
                onClick={() => setAccent(hex)}
                aria-label={`Accent ${hex}`}
                aria-pressed={accent === hex}
              />
            ))}
          </div>
        </div>
        <button className="panel__sound" onClick={toggleSound} aria-pressed={sound}>
          {sound ? "Sound on" : "Sound off"}
        </button>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Demo />
  </StrictMode>,
);
