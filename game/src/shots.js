// Nori Rush — Sushi Bar: screenshots.
// One job: stage the four screenshot scenes (?shot=start|play|serve|end) by
// playing the real rules forward from a fresh world with a simple autopilot,
// so every frame is what a short game really looks like. The same seed always
// gives the same frame.

import { ING_BY_ID } from './config.js';
import {
  STEP,
  addIngredient,
  createWorld,
  plateMatchesTicket,
  serve,
  startGame,
  stepWorld,
  takeFromTray,
} from './world.js';

// The autopilot's next move, working through everything the oldest ticket
// still needs in one pass: take ready items, add direct ones, start prep
// where a station is free — and keep working on the next item while one
// cooks or slices, instead of idling. With `holdServe` it builds the plate
// but never serves, so the serve scene can stop on a finished dish.
function autopilot(world, holdServe = false) {
  const ticket = world.tickets[0];
  if (!ticket) return;
  const need = ticket.recipe.items.filter((item) => !world.plate.includes(item));
  if (need.length === 0) {
    if (!holdServe) serve(world);
    return;
  }
  for (const wanted of need) {
    const trayIndex = world.tray.indexOf(wanted);
    if (trayIndex !== -1) {
      takeFromTray(world, wanted);
      return;
    }
    const ingredient = ING_BY_ID[wanted];
    if (ingredient.prep !== null) {
      const stationBusy = ingredient.prep === 'cooker' ? world.cooker.state !== 'idle' : world.slicer.state !== 'idle';
      if (!stationBusy) {
        addIngredient(world, wanted);
        return;
      }
      continue;
    }
    addIngredient(world, wanted);
    return;
  }
}

function simulate(world, seconds, holdServe = false) {
  const steps = Math.floor(seconds / STEP);
  for (let index = 0; index < steps; index += 1) {
    if (world.screen !== 'play') break;
    autopilot(world, holdServe);
    stepWorld(world, STEP);
  }
}

// Stage the named scene on a fresh world and return it.
export function stageShot(name, seed) {
  const world = createWorld(seed);
  world.best = 0;
  if (name === 'start') {
    // The cover: an early live frame, not the title card — tickets on the
    // board, a dish coming together on the plate, the cooker running.
    startGame(world);
    simulate(world, 6);
    return world;
  }
  if (name === 'serve') {
    startGame(world);
    // Build, but never serve, until a plate matches a ticket: bell glowing,
    // dish finished and ready to go.
    for (let index = 0; index < 90 / STEP; index += 1) {
      if (world.screen !== 'play') break;
      autopilot(world, true);
      stepWorld(world, STEP);
      const match = world.tickets.some((ticket) => plateMatchesTicket(world.plate, ticket));
      if (match && world.plate.length >= 2) break;
    }
    return world;
  }
  if (name === 'end') {
    startGame(world);
    simulate(world, 180);
    if (world.screen === 'play') {
      world.shiftLeft = 0;
      world.screen = 'complete';
      world.best = Math.max(world.best, world.score);
    }
    return world;
  }
  // 'play': a busy mid-shift frame — dishes served, a plate half built, and
  // tickets waiting. Keep simulating until the plate is mid-assembly.
  startGame(world);
  for (let index = 0; index < 45 / STEP; index += 1) {
    if (world.screen !== 'play') break;
    autopilot(world);
    stepWorld(world, STEP);
    if (world.served >= 1 && world.plate.length >= 1 && world.tickets.length >= 2) break;
  }
  return world;
}
