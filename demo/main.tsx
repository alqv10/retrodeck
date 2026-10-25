import { StrictMode, useState, type CSSProperties } from "react";
import { createRoot } from "react-dom/client";
import { Cassette, CdPlayer, setSfxVolume, Turntable, Wheel } from "../src/index.ts";
import "../src/retrodeck.css";
import "./demo.css";
import { useFakePlayer } from "./fakePlayer.ts";

const PLASTICS = ["#1f5aa8", "#9e2f2a", "#2c7a56", "#3a3d44", "#b08a4a", "#5b3f9e"];
const ACCENTS = ["#e3b765", "#e0614f", "#5ec98b", "#6ab6f0", "#f08bc0", "#dcd8cf"];

function Snippet({ code }: { code: string }) {
  return (
    <pre className="snippet">
      <code>{code}</code>
    </pre>
  );
}

function Demo() {
  const player = useFakePlayer();
  const [plastic, setPlastic] = useState(PLASTICS[0]);
  const [accent, setAccent] = useState(ACCENTS[0]);
  const [sound, setSound] = useState(true);

  function toggleSound() {
    setSfxVolume(sound ? 0 : 0.6);
    setSound(!sound);
  }

  return (
    <div className="page" style={{ "--rd-body": plastic, "--rd-accent": accent } as CSSProperties}>
      <header className="rail">
        <span className="rail__name">retrodeck</span>
        <nav className="rail__links">
          <a href="https://www.npmjs.com/package/retrodeck">npm</a>
          <a href="https://github.com/matiasgutierrez/retrodeck">source</a>
        </nav>
      </header>

      <section className="hero">
        <div className="hero__words">
          <h1>Players that feel like objects.</h1>
          <p className="hero__lead">
            Four chassis as React components: click wheel, turntable, discman, cassette deck. Pure CSS, mechanical
            sound, no dependencies. You bring the audio.
          </p>
          <Snippet code="npm i retrodeck" />
          <p className="hero__hint">Drag the wheel. It counts detents and clicks like the real thing.</p>
        </div>
        <div className="hero__object">
          <div className="stage stage--wheel">
            <Wheel {...player} brand="retrodeck" />
          </div>
        </div>
      </section>

      <section className="bay">
        <div className="stage">
          <Turntable {...player} etching="MADE BY HAND" />
        </div>
        <div className="bay__words">
          <h2>Turntable</h2>
          <p>
            The platter spins with the track and brakes when you pause. Bump <code>spinTrigger</code> and it cues the
            next record. Whatever you write in <code>etching</code> is grooved into the dead wax, readable once the disc
            stops.
          </p>
          <Snippet
            code={`<Turntable
  artwork={cover}
  isPaused={isPaused}
  remainingMs={durationMs - progressMs}
  spinTrigger={changeCount}
  etching="MADE BY HAND"
  onNext={next}
  onPrevious={previous}
  onTogglePlay={toggle}
/>`}
          />
        </div>
      </section>

      <section className="bay bay--flip">
        <div className="stage">
          <CdPlayer {...player} />
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
          <Cassette {...player} />
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

      <section className="bay">
        <div className="stage stage--wheel">
          <Wheel {...player} brand="your app" />
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

      <section className="paint">
        <h2>Two variables paint all four</h2>
        <p>
          Every chassis mixes its colour from <code>--rd-body</code> and <code>--rd-accent</code>, each in its own
          material: saturated plastic, dark lacquer, brushed aluminium. Set them anywhere above the player.
        </p>
        <Snippet code={`.app { --rd-body: #9e2f2a; --rd-accent: #5ec98b; }`} />
      </section>

      <footer className="foot">
        <span>MIT</span>
        <span>Built out of Radiostatio, a Spotify player with retro cases.</span>
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
