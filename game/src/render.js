// Nori Rush — Sushi Bar: rendering.
// One job: draw everything from the world state onto the canvas, and tell
// input.js where every clickable rectangle is. No game rules live here.

import { COLORS, INGREDIENTS, ING_BY_ID, VIEW } from './config.js';
import { plateMatchesTicket } from './world.js';
import { setZones } from './input.js';

const TOP_H = 56;
const BOARD_Y = 64;
const BOARD_H = 132;
const KITCHEN_Y = 212;
const BINS_Y = 540;
const BINS_H = 196;
const HINT_Y = 764;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, value, x, y, size, color, weight = 'bold', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(value, x, y);
}

function drawHeart(ctx, x, y, size, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 16, size / 16);
  ctx.beginPath();
  ctx.moveTo(8, 14);
  ctx.bezierCurveTo(0, 8, 0, 3, 4, 3);
  ctx.bezierCurveTo(6, 3, 8, 5, 8, 6);
  ctx.bezierCurveTo(8, 5, 10, 3, 12, 3);
  ctx.bezierCurveTo(16, 3, 16, 8, 8, 14);
  ctx.closePath();
  ctx.fillStyle = filled ? COLORS.red : '#d8c9a8';
  ctx.fill();
  ctx.restore();
}

// A small iconic drawing of one ingredient, centred at (x, y), radius r.
export function drawFood(ctx, id, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  if (id === 'rice') {
    ctx.fillStyle = '#fff8e7';
    ctx.beginPath();
    ctx.arc(0, r * 0.2, r * 0.85, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e8ddc2';
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath();
      ctx.arc(-r * 0.5 + i * r * 0.25, -r * 0.25 + (i % 2) * r * 0.2, r * 0.09, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'nori') {
    ctx.fillStyle = '#1d4d2b';
    roundRect(ctx, -r * 0.8, -r * 0.8, r * 1.6, r * 1.6, r * 0.15);
    ctx.fill();
    ctx.strokeStyle = '#2f6b3f';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, -r * 0.25);
    ctx.lineTo(r * 0.5, -r * 0.25);
    ctx.moveTo(-r * 0.5, r * 0.25);
    ctx.lineTo(r * 0.5, r * 0.25);
    ctx.moveTo(-r * 0.25, -r * 0.5);
    ctx.lineTo(-r * 0.25, r * 0.5);
    ctx.moveTo(r * 0.25, -r * 0.5);
    ctx.lineTo(r * 0.25, r * 0.5);
    ctx.stroke();
  } else if (id === 'salmon') {
    ctx.fillStyle = '#ff8a5c';
    ctx.beginPath();
    ctx.moveTo(-r, r * 0.3);
    ctx.quadraticCurveTo(0, -r, r, r * 0.3);
    ctx.quadraticCurveTo(0, r * 0.8, -r, r * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffd9c2';
    ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(i * r * 0.45 - r * 0.2, -r * 0.4);
      ctx.lineTo(i * r * 0.45 + r * 0.2, r * 0.4);
      ctx.stroke();
    }
  } else if (id === 'tuna') {
    ctx.fillStyle = '#d94f4f';
    roundRect(ctx, -r * 0.9, -r * 0.55, r * 1.8, r * 1.1, r * 0.4);
    ctx.fill();
    ctx.fillStyle = '#f2a0a0';
    ctx.beginPath();
    ctx.arc(-r * 0.3, 0, r * 0.16, 0, Math.PI * 2);
    ctx.arc(r * 0.35, -r * 0.1, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'shrimp') {
    ctx.strokeStyle = '#ff9d9d';
    ctx.lineWidth = r * 0.55;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, r * 0.1, r * 0.6, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(-r * 0.55, -r * 0.35, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'wasabi') {
    ctx.fillStyle = '#7ac74f';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
    ctx.arc(r * 0.45, r * 0.3, r * 0.4, 0, Math.PI * 2);
    ctx.arc(-r * 0.45, r * 0.35, r * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a8e07e';
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 0.2, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'roe') {
    ctx.fillStyle = '#ff7b2f';
    const spots = [[-0.4, -0.2], [0.1, -0.45], [0.5, 0], [0, 0.3], [-0.45, 0.4], [0.45, 0.45]];
    for (const [dx, dy] of spots) {
      ctx.beginPath();
      ctx.arc(dx * r, dy * r, r * 0.28, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(-r * 0.4, -r * 0.35, r * 0.08, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'ginger') {
    ctx.fillStyle = '#f2d38a';
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.ellipse(-r * 0.4 + i * r * 0.4, (i % 2) * r * 0.2, r * 0.35, r * 0.55, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#d9a94f';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.7, r * 0.6, 0.3, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPatienceBar(ctx, x, y, w, h, ratio) {
  ctx.fillStyle = '#e8ddc2';
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fill();
  const color = ratio > 0.5 ? COLORS.green : ratio > 0.25 ? COLORS.gold : COLORS.red;
  ctx.fillStyle = color;
  if (ratio > 0.01) {
    roundRect(ctx, x, y, Math.max(h, w * ratio), h, h / 2);
    ctx.fill();
  }
}

function drawTicket(ctx, ticket, x, y, w, h, now) {
  const low = ticket.patience / ticket.maxPatience < 0.25;
  const pulse = low ? 0.75 + 0.25 * Math.sin(now * 6) : 1;
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = COLORS.ticket;
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = low ? COLORS.red : COLORS.ticketEdge;
  ctx.lineWidth = low ? 3 : 2;
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = ticket.customer.color;
  ctx.beginPath();
  ctx.arc(x + 22, y + 22, 13, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, ticket.customer.name.slice(0, 1), x + 22, y + 28, 16, '#fff', 'bold', 'center');
  text(ctx, ticket.customer.name, x + 42, y + 20, 15, COLORS.ink);
  text(ctx, ticket.recipe.name, x + 42, y + 40, 15, COLORS.muted);

  const dotR = 13;
  const dotY = y + 72;
  let dotX = x + 26;
  for (const item of ticket.recipe.items) {
    ctx.fillStyle = '#f2ead8';
    ctx.beginPath();
    ctx.arc(dotX, dotY, dotR + 3, 0, Math.PI * 2);
    ctx.fill();
    drawFood(ctx, item, dotX, dotY, dotR);
    dotX += 34;
  }
  drawPatienceBar(ctx, x + 14, y + h - 20, w - 28, 10, Math.max(0, ticket.patience / ticket.maxPatience));
}

function drawStationFrame(ctx, x, y, w, h, label) {
  ctx.fillStyle = COLORS.counterTop;
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.strokeStyle = COLORS.boardEdge;
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, label, x + w / 2, y + h - 10, 13, '#f7ead7', 'bold', 'center');
}

function drawCooker(ctx, world, x, y, w, h) {
  drawStationFrame(ctx, x, y, w, h, 'RICE COOKER  ·  key 1');
  const cx = x + w / 2;
  const cy = y + h / 2 - 6;
  ctx.fillStyle = '#3a3a3a';
  roundRect(ctx, cx - 62, cy - 18, 124, 64, 10);
  ctx.fill();
  ctx.fillStyle = '#c9c2b4';
  roundRect(ctx, cx - 62, cy - 26, 124, 16, 8);
  ctx.fill();
  ctx.fillStyle = world.tray.includes('rice') ? COLORS.green : '#8a8578';
  ctx.beginPath();
  ctx.arc(cx + 48, cy - 18, 6, 0, Math.PI * 2);
  ctx.fill();
  if (world.cooker.state === 'cooking') {
    const ratio = 1 - world.cooker.t / 3;
    ctx.strokeStyle = '#e8ddc2';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy + 8, 34, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
    ctx.stroke();
    text(ctx, 'COOKING…', cx, cy + 62, 13, '#f7ead7', 'bold', 'center');
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.arc(cx - 24 + i * 24, cy - 40 - ((world.time * 20 + i * 14) % 18), 5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (world.tray.includes('rice')) {
    text(ctx, 'RICE READY!', cx, cy + 62, 14, '#bff0cf', 'bold', 'center');
  } else {
    text(ctx, 'click Rice to cook', cx, cy + 62, 13, '#e8ddc2', 'normal', 'center');
  }
}

function drawSlicer(ctx, world, x, y, w, h) {
  drawStationFrame(ctx, x, y, w, h, 'KNIFE BOARD  ·  keys 3/5/7');
  const cx = x + w / 2;
  const cy = y + h / 2 - 6;
  ctx.fillStyle = '#e8cfa8';
  roundRect(ctx, cx - 78, cy - 30, 156, 76, 8);
  ctx.fill();
  ctx.strokeStyle = '#c9a86a';
  ctx.lineWidth = 2;
  ctx.stroke();
  if (world.slicer.state === 'slicing' && world.slicer.fish) {
    drawFood(ctx, world.slicer.fish, cx - 20, cy + 8, 26);
    ctx.strokeStyle = '#9aa0a6';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx + 18, cy - 34);
    ctx.lineTo(cx + 44, cy + 20);
    ctx.stroke();
    const ratio = 1 - world.slicer.t / 1.5;
    drawPatienceBar(ctx, cx - 60, cy + 34, 120, 8, ratio);
  } else {
    ctx.fillStyle = '#8a8578';
    ctx.beginPath();
    ctx.arc(cx, cy + 8, 22, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, 'click a fish to slice', cx, cy + 62, 13, '#e8ddc2', 'normal', 'center');
  }
}

function drawPlate(ctx, world, x, y, w, h) {
  ctx.fillStyle = COLORS.counterTop;
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.strokeStyle = COLORS.boardEdge;
  ctx.lineWidth = 2;
  ctx.stroke();
  const cx = x + w / 2;
  const cy = y + h / 2 - 8;
  ctx.fillStyle = COLORS.plate;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 118, 62, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = COLORS.plateEdge;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, cy, 92, 46, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#e3ddd0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const items = world.plate;
  items.forEach((item, index) => {
    const angle = (index / Math.max(1, items.length)) * Math.PI * 2 - Math.PI / 2;
    const px = cx + Math.cos(angle) * 52;
    const py = cy + Math.sin(angle) * 26;
    drawFood(ctx, item, px, py, 20);
  });
  if (items.length === 0) {
    text(ctx, 'empty plate', cx, cy + 6, 14, '#b9ac96', 'normal', 'center');
  }
  text(ctx, 'PREP PLATE  ·  click to clear', cx, y + h - 10, 13, '#f7ead7', 'bold', 'center');
}

function drawBell(ctx, world, x, y, w, h, canServe) {
  const glow = canServe ? 0.85 + 0.15 * Math.sin(world.time * 5) : 1;
  ctx.save();
  ctx.globalAlpha = glow;
  ctx.fillStyle = COLORS.counterTop;
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.strokeStyle = COLORS.boardEdge;
  ctx.lineWidth = 2;
  ctx.stroke();
  const cx = x + w / 2;
  const cy = y + h / 2 - 8;
  ctx.fillStyle = canServe ? COLORS.bell : '#c9a227';
  ctx.beginPath();
  ctx.arc(cx, cy + 6, 44, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#8a6d1f';
  ctx.beginPath();
  ctx.arc(cx, cy - 38, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.bellBase;
  roundRect(ctx, cx - 52, cy + 6, 104, 12, 6);
  ctx.fill();
  ctx.restore();
  text(ctx, canServe ? 'SERVE!  ·  Space' : 'SERVE BELL', cx, y + h - 10, 13, canServe ? '#ffe9a8' : '#f7ead7', 'bold', 'center');
}

function drawTray(ctx, world, x, y, w, h) {
  ctx.fillStyle = COLORS.counterTop;
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();
  ctx.strokeStyle = COLORS.boardEdge;
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'READY TRAY', x + w / 2, y + 22, 13, '#f7ead7', 'bold', 'center');
  for (let slot = 0; slot < 3; slot += 1) {
    const sx = x + 18 + slot * 62;
    const sy = y + 42;
    ctx.fillStyle = '#f7ead7';
    roundRect(ctx, sx, sy, 52, 52, 8);
    ctx.fill();
    const item = world.tray[slot];
    if (item) drawFood(ctx, item, sx + 26, sy + 26, 20);
  }
  text(ctx, 'click to take', x + w / 2, y + h - 10, 12, '#e8ddc2', 'normal', 'center');
}

function drawBins(ctx, world, zones) {
  const binW = 148;
  const gap = 10;
  const totalW = INGREDIENTS.length * binW + (INGREDIENTS.length - 1) * gap;
  let x = (VIEW.width - totalW) / 2;
  const y = BINS_Y + 8;
  const h = 150;
  for (const ing of INGREDIENTS) {
    const locked = ing.level > world.level;
    const busy = ing.prep === 'cooker'
      ? world.cooker.state !== 'idle'
      : ing.prep === 'slicer'
        ? world.slicer.state !== 'idle'
        : false;
    ctx.fillStyle = locked ? '#d8c9a8' : '#fffdf5';
    roundRect(ctx, x, y, binW, h, 12);
    ctx.fill();
    ctx.strokeStyle = locked ? '#b9ac96' : COLORS.ticketEdge;
    ctx.lineWidth = 2;
    ctx.stroke();
    if (locked) {
      text(ctx, `Lv ${ing.level}`, x + binW / 2, y + 34, 15, '#8a8578', 'bold', 'center');
      text(ctx, ing.name, x + binW / 2, y + 96, 15, '#8a8578', 'bold', 'center');
      text(ctx, 'locked', x + binW / 2, y + 120, 13, '#8a8578', 'normal', 'center');
    } else {
      ctx.fillStyle = '#f2ead8';
      ctx.beginPath();
      ctx.arc(x + binW / 2, y + 52, 34, 0, Math.PI * 2);
      ctx.fill();
      drawFood(ctx, ing.id, x + binW / 2, y + 52, 28);
      text(ctx, ing.name, x + binW / 2, y + 112, 16, COLORS.ink);
      const prepNote = ing.prep === 'cooker' ? 'needs cooking' : ing.prep === 'slicer' ? 'needs slicing' : 'ready to add';
      text(ctx, prepNote, x + binW / 2, y + 132, 12, busy ? COLORS.red : COLORS.muted, 'normal', 'center');
      ctx.fillStyle = COLORS.board;
      roundRect(ctx, x + 8, y + 8, 24, 24, 6);
      ctx.fill();
      text(ctx, ing.key, x + 20, y + 26, 14, '#fff', 'bold', 'center');
      if (busy) {
        ctx.fillStyle = COLORS.red;
        ctx.beginPath();
        ctx.arc(x + binW - 16, y + 20, 10, 0, Math.PI * 2);
        ctx.fill();
        text(ctx, '…', x + binW - 16, y + 25, 13, '#fff', 'bold', 'center');
      }
      zones.push({ kind: 'bin', id: ing.id, x, y, w: binW, h });
    }
    x += binW + gap;
  }
}

function drawHud(ctx, world, zones) {
  ctx.fillStyle = COLORS.board;
  ctx.fillRect(0, 0, VIEW.width, TOP_H);
  ctx.fillStyle = '#c94f4f';
  ctx.beginPath();
  ctx.arc(28, 28, 14, 0, Math.PI * 2);
  ctx.fill();
  drawFood(ctx, 'salmon', 28, 28, 10);
  text(ctx, 'NORI RUSH', 52, 36, 26, '#fff');
  text(ctx, 'sushi bar', 216, 36, 15, '#e8c9a8', 'normal');

  const mm = Math.floor(Math.max(0, world.shiftLeft) / 60);
  const ss = Math.floor(Math.max(0, world.shiftLeft) % 60).toString().padStart(2, '0');
  const urgent = world.shiftLeft < 30;
  text(ctx, `⏱ ${mm}:${ss}`, 540, 36, 22, urgent ? '#ff9d9d' : '#fff', 'bold', 'center');
  text(ctx, `SCORE ${world.score}`, 660, 36, 20, '#fff');
  text(ctx, `🪙 ${world.coins}`, 810, 36, 20, '#ffe9a8');
  text(ctx, `COMBO x${world.combo}`, 930, 36, 18, world.combo >= 3 ? '#7fe0a8' : '#e8c9a8');
  text(ctx, `LV ${world.level}`, 1040, 36, 16, '#e8c9a8');
  for (let i = 0; i < 3; i += 1) drawHeart(ctx, 1096 + i * 24, 20, 18, i < world.hearts);
  text(ctx, `LV ${world.level}`, 1040, 36, 16, '#e8c9a8');

  zones.push({ kind: 'mute', x: 1168, y: 10, w: 34, h: 34 });
  ctx.fillStyle = '#4a3a28';
  roundRect(ctx, 1168, 10, 34, 34, 8);
  ctx.fill();
  text(ctx, world.muted ? '✕' : '♪', 1185, 34, 16, '#fff', 'bold', 'center');
  zones.push({ kind: 'pause', x: 1210, y: 10, w: 34, h: 34 });
  ctx.fillStyle = '#4a3a28';
  roundRect(ctx, 1210, 10, 34, 34, 8);
  ctx.fill();
  text(ctx, world.paused ? '▶' : 'II', 1227, 34, 16, '#fff', 'bold', 'center');
}

function drawKitchenWall(ctx) {
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, TOP_H, VIEW.width, VIEW.height - TOP_H);
  ctx.fillStyle = COLORS.wallStripe;
  for (let y = TOP_H + 40; y < VIEW.height; y += 80) ctx.fillRect(0, y, VIEW.width, 4);
  ctx.fillStyle = COLORS.counter;
  ctx.fillRect(0, KITCHEN_Y + 258, VIEW.width, 26);
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(0, KITCHEN_Y + 258, VIEW.width, 4);
}

function drawBoard(ctx, world, now) {
  text(ctx, 'ORDER BOARD', 24, BOARD_Y + 2, 13, COLORS.muted, 'bold');
  if (world.tickets.length === 0) {
    text(ctx, 'No orders yet — the first customers are on their way…', 24, BOARD_Y + 70, 18, COLORS.muted, 'normal');
    return;
  }
  const cardW = 296;
  world.tickets.forEach((ticket, index) => {
    drawTicket(ctx, ticket, 24 + index * (cardW + 12), BOARD_Y + 10, cardW, BOARD_H - 14, now);
  });
}

function drawMessage(ctx, world) {
  if (world.messageT > 0 && world.message) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, world.messageT);
    text(ctx, world.message, VIEW.width / 2, KITCHEN_Y + 246, 18, world.messageColor, 'bold', 'center');
    ctx.restore();
  }
}

function drawFloaters(ctx, world) {
  for (const floater of world.floaters) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, floater.t);
    text(ctx, floater.text, floater.x, floater.y - (1.4 - floater.t) * 40, 26, floater.color, 'bold', 'center');
    ctx.restore();
  }
}

function drawPanel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(43,33,24,0.55)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = COLORS.ticket;
  roundRect(ctx, x, y, w, h, 16);
  ctx.fill();
  ctx.strokeStyle = COLORS.ticketEdge;
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawTitle(ctx, world, zones) {
  drawPanel(ctx, 290, 150, 700, 470);
  drawFood(ctx, 'salmon', 640, 210, 34);
  text(ctx, 'NORI RUSH', 640, 280, 64, COLORS.ink, 'bold', 'center');
  text(ctx, '— a sushi bar rush —', 640, 316, 22, COLORS.muted, 'normal', 'center');
  text(ctx, 'Tickets arrive at the top. Build each dish on the plate:', 640, 372, 18, COLORS.ink, 'normal', 'center');
  text(ctx, '• Rice cooks 3s · fish slices 1.5s — start them early', 640, 402, 18, COLORS.ink, 'normal', 'center');
  text(ctx, '• Click ingredients, or press keys 1–8', 640, 430, 18, COLORS.ink, 'normal', 'center');
  text(ctx, '• Space (or the bell) serves a matching plate', 640, 458, 18, COLORS.ink, 'normal', 'center');
  text(ctx, '• Serve fast for tips — 3 strikes and the shift ends', 640, 486, 18, COLORS.ink, 'normal', 'center');
  ctx.fillStyle = COLORS.red;
  roundRect(ctx, 490, 516, 300, 56, 12);
  ctx.fill();
  text(ctx, 'START SHIFT  ▶', 640, 553, 24, '#fff', 'bold', 'center');
  if (world.best > 0) text(ctx, `Best score: ${world.best}`, 640, 600, 16, COLORS.muted, 'normal', 'center');
  zones.push({ kind: 'start', x: 290, y: 150, w: 700, h: 470 });
}

function drawEnd(ctx, world, zones, complete) {
  drawPanel(ctx, 330, 170, 620, 430);
  text(ctx, complete ? 'SHIFT COMPLETE!' : 'SHIFT OVER', 640, 250, 44, COLORS.ink, 'bold', 'center');
  text(ctx, complete ? 'The last ticket is served. The bar is yours.' : 'Three customers left hungry.', 640, 292, 18, COLORS.muted, 'normal', 'center');
  const rows = [
    ['Score', `${world.score}`],
    ['Dishes served', `${world.served}`],
    ['Best combo', `x${world.bestCombo}`],
    ['Orders lost', `${world.expired}`],
    ['Mistakes', `${world.mistakes}`],
    ['Level reached', `${world.level}`],
  ];
  let y = 340;
  for (const [label, value] of rows) {
    text(ctx, label, 420, y, 19, COLORS.ink, 'normal');
    text(ctx, value, 860, y, 19, COLORS.ink, 'bold', 'right');
    y += 34;
  }
  const stars = world.served >= 20 ? 3 : world.served >= 12 ? 2 : world.served >= 6 ? 1 : 0;
  text(ctx, '★'.repeat(stars) + '☆'.repeat(3 - stars), 640, 580, 34, COLORS.gold, 'bold', 'center');
  zones.push({ kind: 'restart', x: 330, y: 170, w: 620, h: 430 });
}

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_OVER = 'over';

// Draw one frame. `now` is seconds (for pulsing animations).
export function render(ctx, world, now) {
  const zones = [];
  drawKitchenWall(ctx);
  drawHud(ctx, world, zones);
  drawBoard(ctx, world, now);

  const match = world.screen === 'play' && world.tickets.some((t) => plateMatchesTicket(world.plate, t));

  drawCooker(ctx, world, 40, KITCHEN_Y + 30, 210, 170);
  drawSlicer(ctx, world, 270, KITCHEN_Y + 30, 210, 170);
  drawPlate(ctx, world, 520, KITCHEN_Y + 10, 300, 210);
  drawBell(ctx, world, 860, KITCHEN_Y + 30, 160, 170, match);
  drawTray(ctx, world, 1040, KITCHEN_Y + 30, 200, 170);
  zones.push({ kind: 'serve', x: 860, y: KITCHEN_Y + 30, w: 160, h: 170 });
  zones.push({ kind: 'clear', x: 520, y: KITCHEN_Y + 10, w: 300, h: 210 });
  for (let slot = 0; slot < 3; slot += 1) {
    const item = world.tray[slot];
    if (item) zones.push({ kind: 'tray', id: item, x: 1040 + 18 + slot * 62, y: KITCHEN_Y + 72, w: 52, h: 52 });
  }

  drawMessage(ctx, world);
  drawFloaters(ctx, world);
  drawBins(ctx, world, zones);
  text(ctx, 'Click ingredients (or keys 1–8) to build · press the key again to take a finished item from the tray · Space serves · C clears · P pauses · M mutes', VIEW.width / 2, HINT_Y + 20, 15, COLORS.muted, 'normal', 'center');

  if (world.screen === 'title') drawTitle(ctx, world, zones);
  else if (world.screen === 'over') drawEnd(ctx, world, zones, false);
  else if (world.screen === 'complete') drawEnd(ctx, world, zones, true);
  else if (world.paused) {
    ctx.fillStyle = 'rgba(43,33,24,0.5)';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    text(ctx, 'PAUSED — press P to continue', VIEW.width / 2, VIEW.height / 2, 34, '#fff', 'bold', 'center');
  }
  setZones(zones);
}
