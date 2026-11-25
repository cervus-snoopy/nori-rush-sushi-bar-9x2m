// Nori Rush — Sushi Bar: configuration and data.
// One job: every number, name and colour the game uses lives here.

export const VIEW = { width: 1280, height: 800 };

export const SHIFT_SECONDS = 180;
export const MAX_HEARTS = 3;
export const MAX_TICKETS = 4;
export const SERVE_BASE = 100;

// Ingredients. `prep` names the station that must prepare it first:
// 'cooker' for rice, 'slicer' for fish, null for a direct ingredient.
// `level` is the level that unlocks it.
export const INGREDIENTS = [
  { id: 'rice', name: 'Rice', key: '1', color: '#fff8e7', prep: 'cooker', prepSeconds: 3.0, level: 1 },
  { id: 'nori', name: 'Nori', key: '2', color: '#1d4d2b', prep: null, prepSeconds: 0, level: 1 },
  { id: 'salmon', name: 'Salmon', key: '3', color: '#ff8a5c', prep: 'slicer', prepSeconds: 1.5, level: 1 },
  { id: 'wasabi', name: 'Wasabi', key: '4', color: '#7ac74f', prep: null, prepSeconds: 0, level: 1 },
  { id: 'tuna', name: 'Tuna', key: '5', color: '#d94f4f', prep: 'slicer', prepSeconds: 1.5, level: 2 },
  { id: 'ginger', name: 'Ginger', key: '6', color: '#f2d38a', prep: null, prepSeconds: 0, level: 2 },
  { id: 'shrimp', name: 'Shrimp', key: '7', color: '#ff9d9d', prep: 'slicer', prepSeconds: 1.5, level: 3 },
  { id: 'roe', name: 'Roe', key: '8', color: '#ff7b2f', prep: null, prepSeconds: 0, level: 3 },
];

export const ING_BY_ID = Object.fromEntries(INGREDIENTS.map((ing) => [ing.id, ing]));

// Recipes: name, the exact set of ingredients, the level that unlocks it.
export const RECIPES = [
  { name: 'Salmon Maki', items: ['rice', 'nori', 'salmon'], level: 1 },
  { name: 'Salmon Nigiri', items: ['rice', 'salmon'], level: 1 },
  { name: 'Wasabi Maki', items: ['rice', 'nori', 'wasabi'], level: 1 },
  { name: 'Tuna Maki', items: ['rice', 'nori', 'tuna'], level: 2 },
  { name: 'Ginger Salmon', items: ['rice', 'salmon', 'ginger'], level: 2 },
  { name: 'Shrimp Nigiri', items: ['rice', 'shrimp'], level: 3 },
  { name: 'Roe Maki', items: ['rice', 'nori', 'roe'], level: 3 },
  { name: 'Deluxe Roll', items: ['rice', 'nori', 'salmon', 'roe'], level: 3 },
  { name: 'Dragon Roll', items: ['rice', 'nori', 'shrimp', 'wasabi'], level: 4 },
  { name: 'Rainbow Maki', items: ['rice', 'nori', 'salmon', 'tuna'], level: 4 },
];

export const CUSTOMERS = [
  { name: 'Mina', color: '#e56b8c' },
  { name: 'Kenji', color: '#4f8fd9' },
  { name: 'Aiko', color: '#8a5fd0' },
  { name: 'Taro', color: '#3fae8a' },
  { name: 'Yuki', color: '#e09a3e' },
  { name: 'Hana', color: '#c94f6d' },
];

// Patience (seconds) of a fresh ticket, by level.
export function patienceForLevel(level) {
  return Math.max(25, 45 - (level - 1) * 4);
}

// Seconds between new tickets arriving, by level.
export function spawnEveryForLevel(level) {
  return Math.max(5, 9 - (level - 1) * 1.2);
}

// How many tickets may sit on the board at once, by level.
export function maxTicketsForLevel(level) {
  return Math.min(MAX_TICKETS, 2 + level);
}

// Level from dishes served: a level every 5 dishes, capped at 5.
export function levelForServed(served) {
  return Math.min(5, 1 + Math.floor(served / 5));
}

// Palette.
export const COLORS = {
  wall: '#f7ead7',
  wallStripe: '#f2dfc4',
  counter: '#8a5a33',
  counterTop: '#a06a3e',
  board: '#2b2118',
  boardEdge: '#6b4a2a',
  ticket: '#fffdf5',
  ticketEdge: '#d8c9a8',
  plate: '#fdfdfd',
  plateEdge: '#c9c2b4',
  ink: '#2b2118',
  muted: '#7a6a58',
  red: '#d94f4f',
  green: '#3fae6a',
  gold: '#e0a32e',
  bell: '#f2c14e',
  bellBase: '#8a5a33',
};
