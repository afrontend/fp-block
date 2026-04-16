#!/usr/bin/env node
// AI autoplay for fp-block demo recording.
// Strategy: track meteorite, evade when collision imminent, fire occasionally.

const clear = require("clear");
const { format } = require("../src/format.js");
const game = require("../lib/index.js");

const ROWS = 15;
const COLS = 15;
const TICK_INTERVAL_MS = 200;
const MAX_TICKS = 200;
// Rows from the bottom at which the meteorite is considered a collision threat.
const EVADE_ROW_THRESHOLD = 4;

let state = game.init(ROWS, COLS);
let tickCount = 0;

// Schedule the next fire tick randomly between 4 and 8 ticks from now.
const nextFireTick = () => tickCount + 4 + Math.floor(Math.random() * 5);
let fireTick = nextFireTick();

// Return panel positions (row, col) of all cells with the given color.
const getColoredCells = (panel, color) => {
  const cells = [];
  for (let r = 0; r < panel.length; r++) {
    for (let c = 0; c < panel[r].length; c++) {
      if (panel[r][c].color === color) {
        cells.push({ r, c });
      }
    }
  }
  return cells;
};

const avgCol = cells =>
  cells.length === 0
    ? -1
    : cells.reduce((sum, p) => sum + p.c, 0) / cells.length;

// Return true when the meteorite is close to the bottom AND its column range
// overlaps the shuttle's column range.
const willCollide = (shuttleCells, meteoriteCells) => {
  if (meteoriteCells.length === 0) return false;

  const meteoriteMaxRow = Math.max(...meteoriteCells.map(p => p.r));
  if (meteoriteMaxRow < ROWS - 1 - EVADE_ROW_THRESHOLD) return false;

  const shuttleMinCol = Math.min(...shuttleCells.map(p => p.c));
  const shuttleMaxCol = Math.max(...shuttleCells.map(p => p.c));
  const meteoriteMinCol = Math.min(...meteoriteCells.map(p => p.c));
  const meteoriteMaxCol = Math.max(...meteoriteCells.map(p => p.c));

  return meteoriteMinCol <= shuttleMaxCol && meteoriteMaxCol >= shuttleMinCol;
};

// Choose the next key based on current game state.
const chooseKey = (currentState, tick) => {
  const shuttleCells = getColoredCells(currentState.shuttlePanel, "pink");
  const meteoriteCells = getColoredCells(currentState.meteoritePanel, "blue");

  const shuttleCol = avgCol(shuttleCells);
  const meteoriteCol = avgCol(meteoriteCells);

  // No meteorite on screen yet — just fire.
  if (meteoriteCol === -1) return "up";

  // Collision imminent — evade toward the side with more open space.
  if (willCollide(shuttleCells, meteoriteCells)) {
    return shuttleCol <= meteoriteCol ? "left" : "right";
  }

  // Fire at the randomly scheduled tick, then reschedule.
  if (tick >= fireTick) {
    fireTick = nextFireTick();
    return "up";
  }

  // Close enough to center — fire.
  if (Math.abs(meteoriteCol - shuttleCol) < 1.5) return "up";

  // Move toward meteorite.
  return meteoriteCol > shuttleCol ? "right" : "left";
};

const timer = setInterval(() => {
  if (tickCount >= MAX_TICKS) {
    clearInterval(timer);
    process.exit(0);
  }

  state = game.key(chooseKey(state, tickCount), state);
  state = game.tick(state);

  clear();
  console.log(format(game.join(state)));
  tickCount++;
}, TICK_INTERVAL_MS);
