const p = require("fp-panel");

const pipe =
  (...fns) =>
  (x) =>
    fns.reduce((v, f) => f(v), x);

const GAME_ID = "fp-block";
const SNAPSHOT_VERSION = 1;
const MAX_DIMENSION = 500;
const DEFAULT_COOLDOWN_TICKS = 3;

const normalizeDimension = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.min(Math.max(1, Math.trunc(number)), MAX_DIMENSION)
    : fallback;
};

const isPaused = (state) => (state.paused ?? state.pause) === true;
const withPaused = (state, paused) => ({ ...state, paused, pause: paused });

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
  rows < 2 || columns < 3
    ? p.createPanel(rows, columns)
    : pipe(
        paintShuttle,
        p.adjustToCenter,
        p.adjustToBottom,
      )(p.createPanel(rows, columns));

const createMeteoritePanel = (rows, columns) =>
  rows < 3 || columns < 3
    ? p.createPanel(rows, columns)
    : pipe(
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

const spaceKey = (state) => withPaused(state, !isPaused(state));

const leftKey = (state) => {
  const overlap =
    p.isOnTheLeftEdge(state.shuttlePanel) ||
    p.isOverlap(p.left(state.shuttlePanel), state.meteoritePanel);
  return {
    ...state,
    shuttlePanel: overlap ? state.shuttlePanel : p.left(state.shuttlePanel),
  };
};

const upKey = (state) =>
  (state.missileCooldown ?? 0) > 0
    ? state
    : {
        ...state,
        missilePanel: paintMissile(state.shuttlePanel, state.missilePanel),
        missileCooldown: state.missileCooldownTicks,
      };

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

const withPauseKey = (fn) => (state) => (isPaused(state) ? state : fn(state));

const keyHandlers = {
  [SPACE]: spaceKey,
  [LEFT]: withPauseKey(leftKey),
  [RIGHT]: withPauseKey(rightKey),
  [UP]: withPauseKey(upKey),
};

const init = (options = {}, legacyColumns, legacyOptions = {}) => {
  const normalizedOptions =
    typeof options === "number"
      ? { rows: options, columns: legacyColumns, ...legacyOptions }
      : (options ?? {});
  const rows = normalizeDimension(normalizedOptions.rows ?? 15, 15);
  const columns = normalizeDimension(normalizedOptions.columns ?? 15, 15);
  const missileCooldownTicks = Math.max(
    0,
    Math.trunc(
      Number(normalizedOptions.missileCooldownTicks ?? DEFAULT_COOLDOWN_TICKS),
    ) || 0,
  );
  return {
    bgPanel: p.createPanel(rows, columns),
    shuttlePanel: createShuttlePanel(rows, columns),
    missilePanel: p.createPanel(rows, columns),
    meteoritePanel: createMeteoritePanel(rows, columns),
    rows,
    columns,
    paused: false,
    pause: false,
    missileCooldown: 0,
    missileCooldownTicks,
  };
};

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

const tick = (state) => {
  if (isPaused(state)) return state;
  const next = checkCollision({
    ...state,
    missilePanel: p.up(state.missilePanel),
  });
  return {
    ...next,
    missileCooldown: Math.max(0, (state.missileCooldown ?? 0) - 1),
  };
};

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

const toArray = ({ bgPanel, shuttlePanel, missilePanel, meteoritePanel }) =>
  [bgPanel, shuttlePanel, missilePanel, meteoritePanel].map((panel) =>
    structuredClone(panel),
  );

const getTickInterval = () => 150;

const serializeState = (state) => ({
  game: GAME_ID,
  version: SNAPSHOT_VERSION,
  state: structuredClone(state),
});

const restoreState = (snapshot) => {
  if (!snapshot || snapshot.game !== GAME_ID) {
    throw new TypeError("fp-block 스냅숏이 아닙니다.");
  }
  if (snapshot.version !== SNAPSHOT_VERSION) {
    throw new RangeError(`지원하지 않는 스냅숏 버전: ${snapshot.version}`);
  }
  const restored = structuredClone(snapshot.state);
  if (
    !restored?.bgPanel ||
    !restored?.shuttlePanel ||
    !restored?.missilePanel ||
    !restored?.meteoritePanel
  ) {
    throw new TypeError("스냅숏에 필수 패널이 없습니다.");
  }
  const rows = normalizeDimension(restored.rows ?? restored.bgPanel.length, 15);
  const columns = normalizeDimension(
    restored.columns ?? restored.bgPanel[0]?.length,
    15,
  );
  const paused = isPaused(restored);
  return {
    ...restored,
    rows,
    columns,
    paused,
    pause: paused,
    missileCooldown: restored.missileCooldown ?? 0,
    missileCooldownTicks:
      restored.missileCooldownTicks ?? DEFAULT_COOLDOWN_TICKS,
  };
};

module.exports = {
  init,
  tick,
  key,
  join,
  isBlank: p.isBlankItem,
  isBlankItem: p.isBlankItem,
  isMissileItem,
  makeMeteoriteShape,
  toArray,
  getTickInterval,
  serializeState,
  restoreState,
};
