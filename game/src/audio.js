// Nori Rush — Sushi Bar: sound effects.
// One job: tiny synthesized bleeps through WebAudio. No audio files, no network.
// Every sound is created lazily on the first user gesture, so the page never
// asks for audio before the player touches it.

let context = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function audioContext() {
  if (typeof window === 'undefined') return null;
  if (context !== null) return context;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  context = new AudioContextClass();
  return context;
}

// Warm the audio context up after a gesture (browsers block it before one).
export function unlockAudio() {
  const ctx = audioContext();
  if (ctx && ctx.state === 'suspended') void ctx.resume();
}

function tone(frequency, duration, type, volume, when = 0) {
  if (muted) return;
  const ctx = audioContext();
  if (!ctx) return;
  const start = ctx.currentTime + when;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

// A soft click when an ingredient lands on the plate.
export function playAdd() {
  tone(620, 0.07, 'triangle', 0.12);
}

// The knife chop: a short, low thock.
export function playChop() {
  tone(180, 0.08, 'square', 0.08);
  tone(90, 0.1, 'sine', 0.1, 0.01);
}

// Rice cooker done: a rising two-note ding.
export function playReady() {
  tone(880, 0.12, 'sine', 0.12);
  tone(1318, 0.16, 'sine', 0.1, 0.1);
}

// Serve bell: a bright chime.
export function playServe() {
  tone(1046, 0.14, 'sine', 0.14);
  tone(1568, 0.22, 'sine', 0.12, 0.09);
}

// Wrong move: a dull buzz.
export function playError() {
  tone(140, 0.18, 'sawtooth', 0.08);
}

// A ticket expired: a falling sigh.
export function playExpire() {
  tone(392, 0.2, 'sine', 0.1);
  tone(262, 0.3, 'sine', 0.1, 0.16);
}

// Level up: a little fanfare.
export function playLevelUp() {
  tone(523, 0.1, 'triangle', 0.12);
  tone(659, 0.1, 'triangle', 0.12, 0.09);
  tone(784, 0.2, 'triangle', 0.12, 0.18);
}
