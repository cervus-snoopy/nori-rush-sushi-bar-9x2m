// Nori Rush — Sushi Bar: the world.
// One job: the whole game state and its rules — orders, the plate, the prep
// stations, scoring, hearts, levels and the shift timer. No drawing here;
// render.js reads this state and draws it.

import {
  CUSTOMERS,
  INGREDIENTS,
  ING_BY_ID,
  MAX_HEARTS,
  RECIPES,
  SERVE_BASE,
  SHIFT_SECONDS,
  levelForServed,
  maxTicketsForLevel,
  patienceForLevel,
  spawnEveryForLevel,
} from './config.js';
import {
  playAdd,
  playChop,
  playError,
  playExpire,
  playLevelUp,
  playReady,
  playServe,
} from './audio.js';

export const EVENT_OVER = 1;
export const EVENT_COMPLETE = 2;

export const STEP = 1 / 60;

// A small seeded RNG (mulberry32) so ?seed= replays the same shift.
export function makeRng(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let nextTicketId = 1;

function pickRecipe(rng, level) {
  const pool = RECIPES.filter((recipe) => recipe.level <= level);
  return pool[Math.floor(rng() * pool.length)];
}

function pickCustomer(rng) {
  return CUSTOMERS[Math.floor(rng() * CUSTOMERS.length)];
}

export function createWorld(seed) {
  return {
    seed,
    rng: makeRng(seed),
    screen: 'title',
    paused: false,
    muted: false,
    time: 0,
    shiftLeft: SHIFT_SECONDS,
    score: 0,
    coins: 0,
    combo: 0,
    bestCombo: 0,
    hearts: MAX_HEARTS,
    level: 1,
    served: 0,
    expired: 0,
    mistakes: 0,
    tickets: [],
    plate: [],
    cooker: { state: 'idle', t: 0 },
    slicer: { state: 'idle', t: 0, fish: null },
    tray: [],
    spawnIn: 2,
    message: '',
    messageT: 0,
    messageColor: '#2b2118',
    floaters: [],
    best: 0,
  };
}

export function resetWorld(world) {
  const fresh = createWorld(world.seed);
  fresh.best = world.best;
  fresh.muted = world.muted;
  Object.assign(world, fresh);
}

function showMessage(world, text, color = '#2b2118') {
  world.message = text;
  world.messageT = 2.2;
  world.messageColor = color;
}

function addFloater(world, x, y, text, color) {
  world.floaters.push({ x, y, text, color, t: 1.4 });
}

function spawnTicket(world) {
  const recipe = pickRecipe(world.rng, world.level);
  const customer = pickCustomer(world.rng);
  const patience = patienceForLevel(world.level);
  world.tickets.push({
    id: nextTicketId,
    recipe,
    customer,
    patience,
    maxPatience: patience,
  });
  nextTicketId += 1;
}

// Does the plate hold exactly the ticket's recipe (order does not matter)?
export function plateMatchesTicket(plate, ticket) {
  if (plate.length !== ticket.recipe.items.length) return false;
  const sortedPlate = [...plate].sort();
  const sortedRecipe = [...ticket.recipe.items].sort();
  return sortedPlate.every((item, index) => item === sortedRecipe[index]);
}

function firstMatchingTicket(world) {
  return world.tickets.find((ticket) => plateMatchesTicket(world.plate, ticket)) ?? null;
}

// The plate's first wrong ingredient, if any: one no open ticket wants.
function plateHasWrongItem(world) {
  const wanted = new Set();
  for (const ticket of world.tickets) {
    for (const item of ticket.recipe.items) wanted.add(item);
  }
  return world.plate.some((item) => !wanted.has(item));
}

function startPrep(world, ingredient) {
  if (ingredient.prep === 'cooker') {
    if (world.cooker.state !== 'idle') return false;
    world.cooker = { state: 'cooking', t: ingredient.prepSeconds };
    playChop();
    return true;
  }
  if (ingredient.prep === 'slicer') {
    if (world.slicer.state !== 'idle') return false;
    world.slicer = { state: 'slicing', t: ingredient.prepSeconds, fish: ingredient.id };
    playChop();
    return true;
  }
  return false;
}

// Add an ingredient: direct ones land on the plate, prepped ones start at
// their station. Returns true when something happened.
export function addIngredient(world, ingredientId) {
  if (world.screen !== 'play' || world.paused) return false;
  const ingredient = ING_BY_ID[ingredientId];
  if (!ingredient || ingredient.level > world.level) return false;
  if (ingredient.prep !== null) {
    if (world.tray.filter((item) => item === ingredientId).length >= 2) return false;
    if (startPrep(world, ingredient)) {
      showMessage(world, `${ingredient.name} on the ${ingredient.prep === 'cooker' ? 'cooker' : 'board'}…`);
      return true;
    }
    return false;
  }
  world.plate.push(ingredientId);
  playAdd();
  if (plateHasWrongItem(world)) {
    showMessage(world, 'That does not belong on any order!', '#d94f4f');
  }
  return true;
}

// Take a finished prepped item from the ready tray onto the plate.
export function takeFromTray(world, ingredientId) {
  if (world.screen !== 'play' || world.paused) return false;
  const index = world.tray.indexOf(ingredientId);
  if (index === -1) return false;
  world.tray.splice(index, 1);
  world.plate.push(ingredientId);
  playAdd();
  if (world.tray.length === 0 && world.message.includes('tray')) {
    world.message = '';
  }
  if (plateHasWrongItem(world)) {
    showMessage(world, 'That does not belong on any order!', '#d94f4f');
  }
  return true;
}

export function clearPlate(world) {
  if (world.screen !== 'play' || world.paused) return false;
  if (world.plate.length === 0) return false;
  world.plate = [];
  showMessage(world, 'Plate cleared.');
  return true;
}

export function serve(world) {
  if (world.screen !== 'play' || world.paused) return false;
  const ticket = firstMatchingTicket(world);
  if (!ticket) {
    world.mistakes += 1;
    world.combo = 0;
    playError();
    showMessage(world, 'No order matches this plate!', '#d94f4f');
    return false;
  }
  const tip = Math.round((ticket.patience / ticket.maxPatience) * 100);
  const comboBonus = world.combo >= 2 ? 50 : 0;
  const earned = SERVE_BASE + tip + comboBonus;
  world.score += earned;
  world.coins += earned;
  world.combo += 1;
  world.bestCombo = Math.max(world.bestCombo, world.combo);
  world.served += 1;
  world.tickets = world.tickets.filter((entry) => entry.id !== ticket.id);
  world.plate = [];
  playServe();
  addFloater(world, 640, 300, `+${earned}`, '#3fae6a');
  const newLevel = levelForServed(world.served);
  if (newLevel > world.level) {
    world.level = newLevel;
    playLevelUp();
    showMessage(world, `Level ${newLevel}! New recipes unlocked.`, '#2b7a4b');
  } else if (world.combo >= 3) {
    showMessage(world, `Combo x${world.combo}! +${earned} coins.`, '#2b7a4b');
  } else {
    showMessage(world, `Served ${ticket.recipe.name}! +${earned} coins.`, '#2b7a4b');
  }
  return true;
}

function expireTicket(world, ticket) {
  world.tickets = world.tickets.filter((entry) => entry.id !== ticket.id);
  world.expired += 1;
  world.hearts -= 1;
  world.combo = 0;
  playExpire();
  showMessage(world, `${ticket.customer.name} left hungry… -1 heart`, '#d94f4f');
  if (world.hearts <= 0) {
    world.screen = 'over';
    world.best = Math.max(world.best, world.score);
  }
}

function stepStation(world, station, dt, done) {
  if (station.state === 'idle' || station.state === 'ready') return;
  station.t -= dt;
  if (station.t <= 0) {
    station.state = 'ready';
    done();
  }
}

// Advance the world by dt seconds. `move` is unused here (the game is
// click-driven); it stays in the signature so shots.js can steer like the
// starter's autopilot. Returns an event mask.
export function stepWorld(world, dt) {
  if (world.screen !== 'play' || world.paused) return 0;
  world.time += dt;
  world.shiftLeft -= dt;
  if (world.messageT > 0) world.messageT -= dt;
  for (const floater of world.floaters) floater.t -= dt;
  world.floaters = world.floaters.filter((floater) => floater.t > 0);

  stepStation(world, world.cooker, dt, () => {
    if (world.tray.length < 3) {
      world.tray.push('rice');
      playReady();
      showMessage(world, 'Rice is ready — take it from the tray!');
    }
    // The finished rice sits in the tray; the cooker is free again at once.
    world.cooker = { state: 'idle', t: 0 };
  });
  stepStation(world, world.slicer, dt, () => {
    if (world.tray.length < 3) {
      world.tray.push(world.slicer.fish);
      playReady();
      showMessage(world, `${ING_BY_ID[world.slicer.fish].name} sliced — take it from the tray!`);
    }
    world.slicer = { state: 'idle', t: 0, fish: null };
  });

  for (const ticket of [...world.tickets]) {
    ticket.patience -= dt;
    if (ticket.patience <= 0) expireTicket(world, ticket);
  }
  if (world.screen !== 'play') return world.screen === 'over' ? EVENT_OVER : 0;

  world.spawnIn -= dt;
  if (world.spawnIn <= 0) {
    world.spawnIn = spawnEveryForLevel(world.level);
    if (world.tickets.length < maxTicketsForLevel(world.level)) spawnTicket(world);
  }

  if (world.shiftLeft <= 0) {
    world.shiftLeft = 0;
    world.screen = 'complete';
    world.best = Math.max(world.best, world.score);
    return EVENT_COMPLETE;
  }
  return 0;
}

export function startGame(world) {
  resetWorld(world);
  world.screen = 'play';
  spawnTicket(world);
  spawnTicket(world);
  world.spawnIn = spawnEveryForLevel(world.level);
  showMessage(world, 'Shift started! Build what the tickets ask for.');
}

export function togglePause(world) {
  if (world.screen !== 'play') return;
  world.paused = !world.paused;
}
