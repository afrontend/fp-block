const p = require("fp-panel");

const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((v, f) => f(v), x);

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const sampleSize = (arr, n) => shuffle(arr).slice(0, n);

// Configuration

const COLORS = {
  meteorite: "blue",
  shuttle: "pink",
  missile: "yellow",
};

// Paint panel

const paintShuttle = (panel) =>
  p.paint(
    panel,
    [
      { row: 0, column: 1, zeroPoint: true },
      { row: 1, column: 0, zeroPoint: true },
      { row: 1, column: 1, zeroPoint: true },
      { row: 1, column: 2, zeroPoint: true },
    ],
    COLORS.shuttle,
  );

const makeMeteoriteShape = () => {
  const meteorite = [
    { row: 0, column: 0 },
    { row: 0, column: 1 },
    { row: 0, column: 2 },
    { row: 1, column: 0 },
    { row: 1, column: 1, zeroPoint: true },
    { row: 1, column: 2 },
    { row: 2, column: 0 },
    { row: 2, column: 1 },
    { row: 2, column: 2 },
  ];

  return sampleSize(meteorite, 7);
};

const paintRandomMeteorite = (panel) =>
  p.paint(panel, makeMeteoriteShape(), COLORS.meteorite);

// Create panel

const createShuttlePanel = (rows, columns) =>
  pipe(
    paintShuttle,
    p.adjustToCenter,
    p.adjustToBottom,
  )(p.createPanel(rows, columns));

const createMeteoritePanel = (rows, columns) =>
  pipe(
    paintRandomMeteorite,
    p.adjustToRandomCenter,
  )(p.createPanel(rows, columns));

// Make tool panel

const paintMissile = (shuttlePanel, missilePanel) =>
  p.paint(
    missilePanel,
    p.getZeroPoints(shuttlePanel).map((point) => ({
      ...point,
      zeroPoint: true,
    })),
    COLORS.missile,
  );

// Process event

const spaceKey = (state) => ({ ...state, paused: !state.paused });

const leftKey = (state) => {
  const overlap =
    p.isOnTheLeftEdge(state.shuttlePanel) ||
    p.isOverlap(p.left(state.shuttlePanel), state.meteoritePanel);
  return {
    ...state,
    shuttlePanel: overlap ? state.shuttlePanel : p.left(state.shuttlePanel),
  };
};

const upKey = (state) => ({
  ...state,
  missilePanel: paintMissile(state.shuttlePanel, state.missilePanel),
});

const rightKey = (state) => {
  const overlap =
    p.isOnTheRightEdge(state.shuttlePanel) ||
    p.isOverlap(p.right(state.shuttlePanel), state.meteoritePanel);
  return {
    ...state,
    shuttlePanel: overlap ? state.shuttlePanel : p.right(state.shuttlePanel),
  };
};

// Key definition

const SPACE = "space";
const LEFT = "left";
const RIGHT = "right";
const UP = "up";

const withPauseKey = (fn) => (state) => (state.paused ? state : fn(state));

const keyHandlers = {
  [SPACE]: spaceKey,
  [LEFT]: withPauseKey(leftKey),
  [RIGHT]: withPauseKey(rightKey),
  [UP]: withPauseKey(upKey),
};

const init = (rows = 15, columns = 15) => ({
  bgPanel: p.createPanel(rows, columns),
  shuttlePanel: createShuttlePanel(rows, columns),
  missilePanel: p.createPanel(rows, columns),
  meteoritePanel: createMeteoritePanel(rows, columns),
  rows,
  columns,
  paused: false,
});

const respawnMeteoritePanel = (state) => ({
  ...state,
  meteoritePanel: p.isBlankPanel(state.meteoritePanel)
    ? createMeteoritePanel(state.rows, state.columns)
    : state.meteoritePanel,
});

// Collision resolution: missiles and meteorites cancel each other's overlapping
// cells. The meteorite then advances one row down.
const resolveCollision = (state) => ({
  ...state,
  missilePanel: p.sub(state.missilePanel, state.meteoritePanel),
  meteoritePanel: p.sub(state.meteoritePanel, state.missilePanel),
});

const downMeteorite = (state) => ({
  ...state,
  meteoritePanel: p.down(state.meteoritePanel),
});

const checkCollision = pipe(
  resolveCollision,
  downMeteorite,
  respawnMeteoritePanel,
);

const tick = (state) =>
  state.paused
    ? state
    : checkCollision({
        ...state,
        missilePanel: p.up(state.missilePanel),
      });

const key = (keyName, state) =>
  keyHandlers[keyName] ? keyHandlers[keyName](state) : state;

const join = (state) =>
  p.add([
    state.bgPanel,
    state.shuttlePanel,
    state.missilePanel,
    state.meteoritePanel,
  ]);

const isMissileItem = (item) => item.color === COLORS.missile;

module.exports = {
  init,
  tick,
  key,
  join,
  isBlankItem: p.isBlankItem,
  isMissileItem,
  makeMeteoriteShape,
};
