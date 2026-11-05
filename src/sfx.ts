// Efectos mecánicos de las carcasas. Hasta cuatro <audio> por archivo, que se
// reparten los disparos: con uno solo, volver a tocar el mismo efecto antes de
// que termine cortaba el anterior y dos no podían sonar encima. Más de cuatro
// no se oyen como voces separadas y quedan nodos colgando, que en móvil corta.
const POOL = 4;
const pools = new Map<string, HTMLAudioElement[]>();
const stopTimers = new Map<HTMLAudioElement, number>();

function freeElement(name: SfxName) {
  const pool = pools.get(name) ?? [];
  const idle = pool.find((el) => el.paused || el.ended);
  if (idle) return idle;
  if (pool.length >= POOL) {
    // Todas sonando: la más vieja es la que menos se nota al cortar.
    const oldest = pool.shift()!;
    pool.push(oldest);
    return oldest;
  }
  const el = new Audio(FILES[name]);
  el.preload = "auto";
  pool.push(el);
  pools.set(name, pool);
  return el;
}

// Los efectos siguen el volumen del reproductor: bajar la música y que el
// casete siga sonando igual de fuerte es lo que más molesta.
let master = 0.6;

export function setSfxVolume(value: number) {
  master = value;
}

export type SfxName = keyof typeof FILES;

const FILES = {
  "cassette-eject": new URL("./sfx/cassette-eject.mp3", import.meta.url).href,
  "cassette-insert": new URL("./sfx/cassette-insert.mp3", import.meta.url).href,
  "cassette-close": new URL("./sfx/cassette-close.mp3", import.meta.url).href,
  "vinyl-stop": new URL("./sfx/vinyl-stop.mp3", import.meta.url).href,
};

interface SfxOptions {
  volume?: number;
  /** Segundo del archivo donde arrancar. */
  from?: number;
  /** Corta el audio a los N ms, para usar solo un trozo de un clip largo. */
  durationMs?: number;
}

export function playSfx(name: SfxName, { volume = 0.55, from = 0, durationMs }: SfxOptions = {}) {
  const el = freeElement(name);

  const timer = stopTimers.get(el);
  if (timer) clearTimeout(timer);

  el.volume = Math.min(1, Math.max(0, volume * master));
  // Sin el pause() el seek sobre un audio que ya está sonando no siempre
  // reinicia en Safari.
  el.pause();
  try {
    el.currentTime = from;
  } catch {
    // El clip aún no tiene metadata: suena desde el principio y ya.
  }
  // Los navegadores rechazan audio sin gesto del usuario; estos efectos salen
  // de un click o un drag, pero si igual falla no hay nada que hacer.
  void el.play().catch(() => {});

  if (durationMs !== undefined) {
    stopTimers.set(
      el,
      window.setTimeout(() => {
        el.pause();
        stopTimers.delete(el);
      }, durationMs),
    );
  }
}

/** Click seco de la rueda. Sintetizado: un mp3 de 30 ms no vale la descarga. */
let audioCtx: AudioContext | null = null;

/** Dos clics de una pieza real nunca son iguales: repetidos idénticos suenan a alarma. */
const vary = (value: number, amount: number) => value * (1 - amount + Math.random() * amount * 2);

export function playTick() {
  if (master === 0) return;
  audioCtx ??= new AudioContext();
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "square";
  osc.frequency.value = vary(1900, 0.04);
  gain.gain.setValueAtTime(vary(0.09, 0.15) * master, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.03);
}

/** El motor del CD acelerando al cambiar de pista. También sintetizado. */
export function playDiscSpin() {
  if (master === 0) return;
  audioCtx ??= new AudioContext();
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(170, now);
  osc.frequency.exponentialRampToValueAtTime(680, now + 0.26);
  osc.frequency.exponentialRampToValueAtTime(420, now + 0.42);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.05 * master, now + 0.06);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.46);
}

/** Ruido blanco de N segundos, para los efectos que no son tonos. */
function noiseBuffer(ctx: AudioContext, seconds: number) {
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/**
 * El tope de la perilla de sintonía: un golpe seco y grave, nada que ver con
 * el clic brillante de la rueda. Un tono solo suena a beep, así que el golpe
 * es un chasquido de ruido filtrado y abajo un triángulo corto que le da el
 * cuerpo de madera.
 */
export function playKnob() {
  if (master === 0) return;
  audioCtx ??= new AudioContext();
  const ctx = audioCtx;
  const now = ctx.currentTime;

  const click = ctx.createBufferSource();
  click.buffer = noiseBuffer(ctx, 0.02);
  const clickFilter = ctx.createBiquadFilter();
  clickFilter.type = "bandpass";
  clickFilter.frequency.value = vary(2600, 0.08);
  clickFilter.Q.value = 1.4;
  const clickGain = ctx.createGain();
  clickGain.gain.setValueAtTime(0.05 * master, now);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);
  click.connect(clickFilter).connect(clickGain).connect(ctx.destination);
  click.start(now);
  click.stop(now + 0.02);

  const body = ctx.createOscillator();
  body.type = "triangle";
  body.frequency.setValueAtTime(vary(320, 0.05), now);
  body.frequency.exponentialRampToValueAtTime(190, now + 0.045);
  const bodyGain = ctx.createGain();
  bodyGain.gain.setValueAtTime(0.055 * master, now);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
  body.connect(bodyGain).connect(ctx.destination);
  body.start(now);
  body.stop(now + 0.06);
}

/**
 * Una tecla de plástico. Bajar es un golpe con cuerpo, porque la tecla llega al
 * fondo; subir es solo el resorte: más agudo y bastante más bajito.
 */
function playPress(release: boolean) {
  if (master === 0) return;
  audioCtx ??= new AudioContext();
  const ctx = audioCtx;
  const now = ctx.currentTime;

  const click = ctx.createBufferSource();
  click.buffer = noiseBuffer(ctx, 0.016);
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = vary(release ? 3400 : 1900, 0.08);
  filter.Q.value = 1.1;
  const clickGain = ctx.createGain();
  clickGain.gain.setValueAtTime((release ? 0.022 : 0.06) * master, now);
  clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.014);
  click.connect(filter).connect(clickGain).connect(ctx.destination);
  click.start(now);
  click.stop(now + 0.016);
  if (release) return;

  const body = ctx.createOscillator();
  body.type = "sine";
  body.frequency.setValueAtTime(vary(210, 0.05), now);
  body.frequency.exponentialRampToValueAtTime(110, now + 0.035);
  const bodyGain = ctx.createGain();
  bodyGain.gain.setValueAtTime(0.07 * master, now);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
  body.connect(bodyGain).connect(ctx.destination);
  body.start(now);
  body.stop(now + 0.045);
}

/**
 * El golpecito en la mano, donde el aparato lo permite (Android sí, iPhone no).
 * Con el sonido en cero tampoco: quien silenció el aparato no espera que vibre.
 */
export function haptic(ms = 8) {
  if (master > 0) navigator.vibrate?.(ms);
}

let pressing = false;

/**
 * Va en el chasis y escucha en captura: así todas las teclas de adentro suenan
 * y vibran sin que cada una lo pida, incluso las que frenan el evento para que
 * no arranque el arrastre de la rueda.
 */
export const pressFeel = {
  onPointerDownCapture(e: { target: EventTarget }) {
    if (!(e.target as Element).closest?.("button")) return;
    pressing = true;
    playPress(false);
    haptic(12);
  },
  onPointerUpCapture() {
    if (pressing) playPress(true);
    pressing = false;
  },
  onPointerCancelCapture() {
    pressing = false;
  },
};

/**
 * Pasar entre emisoras. El ruido blanco plano suena a cinta, así que no alcanza
 * con filtrarlo: acá el pasabanda barre mientras la aguja viaja y encima va el
 * silbido del batido, el pitido que sube y baja al cruzar una portadora. Al
 * final los dos se apagan de golpe, que es la emisora enganchando.
 */
export function playStatic(durationMs = 620) {
  if (master === 0) return;
  audioCtx ??= new AudioContext();
  const ctx = audioCtx;
  const dur = durationMs / 1000;
  const now = ctx.currentTime;
  const lock = now + dur * 0.78;

  const hiss = ctx.createBufferSource();
  hiss.buffer = noiseBuffer(ctx, dur);
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = 3.2;
  band.frequency.setValueAtTime(900, now);
  band.frequency.exponentialRampToValueAtTime(2600, now + dur * 0.45);
  band.frequency.exponentialRampToValueAtTime(1100, lock);
  const hissGain = ctx.createGain();
  hissGain.gain.setValueAtTime(0.0001, now);
  hissGain.gain.exponentialRampToValueAtTime(0.11 * master, now + 0.04);
  hissGain.gain.setValueAtTime(0.11 * master, lock);
  hissGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  hiss.connect(band).connect(hissGain).connect(ctx.destination);
  hiss.start(now);
  hiss.stop(now + dur);

  const beat = ctx.createOscillator();
  beat.type = "sine";
  beat.frequency.setValueAtTime(2300, now);
  beat.frequency.exponentialRampToValueAtTime(380, now + dur * 0.6);
  beat.frequency.exponentialRampToValueAtTime(1800, lock);
  const beatGain = ctx.createGain();
  beatGain.gain.setValueAtTime(0.0001, now);
  beatGain.gain.exponentialRampToValueAtTime(0.03 * master, now + dur * 0.3);
  beatGain.gain.exponentialRampToValueAtTime(0.0001, lock);
  beat.connect(beatGain).connect(ctx.destination);
  beat.start(now);
  beat.stop(now + dur);
}
