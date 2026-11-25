// Nori Rush — Sushi Bar: entry point.
// One job: wire the canvas, the world, input and rendering together, run the
// frame loop, and stage screenshot scenes when ?shot= is in the URL.

import { VIEW } from './config.js';
import { attachInput } from './input.js';
import { render } from './render.js';
import { stageShot } from './shots.js';
import {
  addIngredient,
  clearPlate,
  createWorld,
  serve,
  startGame,
  stepWorld,
  takeFromTray,
  togglePause,
} from './world.js';
import { isMuted, setMuted, unlockAudio } from './audio.js';

const params = new URLSearchParams(window.location.search);
const seedParam = Number(params.get('seed'));
const seed = Number.isFinite(seedParam) ? seedParam : Math.floor(Math.random() * 100000);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let world;
if (shot) {
  world = stageShot(shot, seed);
} else {
  world = createWorld(seed);
}

const actions = {
  unlockAudio,
  addIngredient: (id) => {
    // Pressing an ingredient's key (or clicking its bin) while a finished
    // one waits in the tray takes it onto the plate instead of starting
    // another batch — so keyboard-only players can finish a dish.
    if (world.tray.includes(id)) takeFromTray(world, id);
    else addIngredient(world, id);
  },
  takeFromTray: (id) => takeFromTray(world, id),
  serve: () => serve(world),
  clearPlate: () => clearPlate(world),
  start: () => {
    if (world.screen === 'title') startGame(world);
  },
  restart: () => {
    if (world.screen === 'over' || world.screen === 'complete') startGame(world);
  },
  togglePause: () => togglePause(world),
  toggleMute: () => {
    setMuted(!isMuted());
    world.muted = isMuted();
  },
};
attachInput(canvas, world, actions);

// The live game state, for play-testing from the console or a test driver.
window.__game = { world, actions };

if (shot) {
  // A screenshot scene: one still frame of the staged world, no loop.
  render(ctx, world, 0);
} else {
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    stepWorld(world, dt);
    render(ctx, world, now / 1000);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

void VIEW;
