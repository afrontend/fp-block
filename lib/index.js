const _ = require("lodash");
const p = require("fp-panel");

// Configuration

const GLOBAL = {
  pause: false
};

// Pause panel

const isPaused = () => GLOBAL.pause === true;

const paintShuttle = panel =>
  p.paint(
    panel,
    [
      { row: 0, column: 1, zeroPoint: true },
      { row: 1, column: 0, zeroPoint: true },
      { row: 1, column: 1, zeroPoint: true },
      { row: 1, column: 2, zeroPoint: true }
    ],
    "pink"
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
    { row: 2, column: 2 }
  ];

  return _.initial(_.initial(_.shuffle(meteorite)));
};

const paintMeteorite = panel => p.paint(panel, makeMeteoriteShape(), "blue");

const createPanel = (() => {
  let savedRows = 0;
  let savedColumns = 0;
  return (rows, columns) => {
    savedRows = rows ? rows : savedRows;
    savedColumns = columns ? columns : savedColumns;
    return p.createPanel(savedRows, savedColumns);
  };
})();

// Create panel

const createShuttlePanel = _.flow([
  createPanel,
  paintShuttle,
  p.adjustToCenter,
  p.adjustToBottom
]);

const createMeteoritePanel = _.flow([
  createPanel,
  paintMeteorite,
  p.adjustToRandomCenter
]);

// Make tool panel

const addMissile = (shuttlePanel, missilePanel) => {
  const zeroPoints = p.getZeroPoints(shuttlePanel);
  p.paint(
    missilePanel,
    _.map(zeroPoints, point => {
      point.zeroPoint = true;
      return point;
    }),
    "yellow"
  );
  return missilePanel;
};

// Process event

const spaceKey = state => {
  GLOBAL.pause = !isPaused();
  return state;
};

const leftKey = ({ bgPanel, shuttlePanel, missilePanel, meteoritePanel }) => {
  const overlap =
    p.isOnTheLeftEdge(shuttlePanel) ||
    p.isOverlap(p.left(shuttlePanel), meteoritePanel);
  return {
    bgPanel,
    shuttlePanel: overlap ? shuttlePanel : p.left(shuttlePanel),
    missilePanel,
    meteoritePanel
  };
};

const upKey = ({ bgPanel, shuttlePanel, missilePanel, meteoritePanel }) => {
  return {
    bgPanel,
    shuttlePanel,
    missilePanel: addMissile(shuttlePanel, missilePanel),
    meteoritePanel
  };
};

const rightKey = ({ bgPanel, shuttlePanel, missilePanel, meteoritePanel }) => {
  const overlap =
    p.isOnTheRightEdge(shuttlePanel) ||
    p.isOverlap(p.right(shuttlePanel), meteoritePanel);
  return {
    bgPanel,
    shuttlePanel: overlap ? shuttlePanel : p.right(shuttlePanel),
    missilePanel,
    meteoritePanel
  };
};

// Key definition

const withPauseKey = fn => panels => (isPaused() ? panels : fn(panels));

const shuttleKeyFnList = [
  { key: "space", fn: spaceKey },
  { key: "left", fn: withPauseKey(leftKey) },
  { key: "right", fn: withPauseKey(rightKey) },
  { key: "up", fn: withPauseKey(upKey) }
];

const isValidKey = (key, fnList) =>
  _.some(fnList, item => _.isEqual(item.key, key));

const init = (rows = 15, columns = 15) => ({
  bgPanel: createPanel(rows, columns),
  shuttlePanel: createShuttlePanel(),
  missilePanel: createPanel(),
  meteoritePanel: createMeteoritePanel()
});

const checkMeteoritePanel = ({
  bgPanel,
  shuttlePanel,
  missilePanel,
  meteoritePanel
}) => ({
  bgPanel,
  shuttlePanel,
  missilePanel,
  meteoritePanel: p.isBlankPanel(meteoritePanel)
    ? createMeteoritePanel()
    : meteoritePanel
});

const diff = ({ bgPanel, shuttlePanel, missilePanel, meteoritePanel }) => {
  const newMissilePanel = p.sub(missilePanel, meteoritePanel);
  const newMeteoritePanel = p.sub(meteoritePanel, missilePanel);

  return {
    bgPanel,
    shuttlePanel,
    missilePanel: newMissilePanel,
    meteoritePanel: p.down(newMeteoritePanel)
  };
};

const checkCollisionWithMissileAndMeteorite = _.flow([
  diff,
  checkMeteoritePanel
]);

const tick = state =>
  isPaused()
    ? state
    : checkCollisionWithMissileAndMeteorite({
        bgPanel: state.bgPanel,
        shuttlePanel: state.shuttlePanel,
        missilePanel: p.up(state.missilePanel),
        meteoritePanel: state.meteoritePanel
      });

const key = (key, state) =>
  isValidKey(key, shuttleKeyFnList)
    ? _.find(shuttleKeyFnList, item => _.isEqual(item.key, key)).fn(state)
    : state;

const join = state =>
  p.add([
    state.bgPanel,
    state.shuttlePanel,
    state.missilePanel,
    state.meteoritePanel
  ]);

module.exports = {
  init,
  tick,
  key,
  join,
  isBlank: p.isBlankItem
};
