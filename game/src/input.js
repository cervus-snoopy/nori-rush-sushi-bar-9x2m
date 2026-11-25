// Nori Rush — Sushi Bar: input.
// One job: turn mouse clicks and key presses into game actions. The hit areas
// (bins, stations, plate, bell, buttons) are rectangles the renderer lays out
// in layout.js terms — input asks render for them through `zones()` so the two
// never drift apart.

import { INGREDIENTS } from './config.js';

// Every clickable rectangle, named. Filled in by render.js each frame.
let zones = [];

export function setZones(next) {
  zones = next;
}

function zoneAt(x, y) {
  for (let index = zones.length - 1; index >= 0; index -= 1) {
    const zone = zones[index];
    if (x >= zone.x && x < zone.x + zone.w && y >= zone.y && y < zone.y + zone.h) return zone;
  }
  return null;
}

// Attach input to a canvas and a world. `world` is the live game state object
// from world.js; `actions` are the verbs input may call on it.
export function attachInput(canvas, world, actions) {
  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    actions.unlockAudio();
    const zone = zoneAt(x, y);
    if (!zone) return;
    if (zone.kind === 'bin') actions.addIngredient(zone.id);
    else if (zone.kind === 'tray') actions.takeFromTray(zone.id);
    else if (zone.kind === 'serve') actions.serve();
    else if (zone.kind === 'clear') actions.clearPlate();
    else if (zone.kind === 'start') actions.start();
    else if (zone.kind === 'restart') actions.restart();
    else if (zone.kind === 'pause') actions.togglePause();
    else if (zone.kind === 'mute') actions.toggleMute();
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    const ingredient = INGREDIENTS.find((ing) => ing.key === key);
    if (ingredient) {
      actions.unlockAudio();
      actions.addIngredient(ingredient.id);
      return;
    }
    if (key === ' ') {
      event.preventDefault();
      actions.unlockAudio();
      actions.serve();
    } else if (key === 'c' || key === 'backspace') {
      actions.clearPlate();
    } else if (key === 'p' || key === 'escape') {
      actions.togglePause();
    } else if (key === 'r') {
      actions.restart();
    } else if (key === 'm') {
      actions.toggleMute();
    } else if (key === 'enter') {
      actions.unlockAudio();
      actions.start();
    }
  });
}
