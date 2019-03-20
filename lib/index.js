const _ = require("lodash");
const fp = require("lodash/fp");

// Configuration

const GLOBAL = {
  color: "grey",
  count: 0,
  pause: false
};

// Panel functions

const getAry = (len, fn) =>
  _.range(len).map(() => (_.isFunction(fn) ? fn() : _.cloneDeep(fn)));

const createItem = () => ({ color: GLOBAL.color });
const getEmptyRow = columns => getAry(columns, createItem());
const createPanel = (() => {
  let savedRows = 0;
  let savedColumns = 0;
  return (rows, columns) => {
    savedRows = rows ? rows : savedRows;
    savedColumns = columns ? columns : savedColumns;
    return getAry(savedRows, getEmptyRow(savedColumns));
  };
})();

const to1DimAry = _.flattenDepth;
const getEmptyRows = (count, columns) => getAry(count, getEmptyRow(columns));

// Pause panel

const isPaused = () => GLOBAL.pause === true;

// Check panel

const isBlank = item => item.color === GLOBAL.color;
const isNotBlank = item => item.color !== GLOBAL.color;
const isBottom = panel => isNotBlankRow(_.last(panel));
const isNotBlankRow = fp.some(isNotBlank);
const isNotFullRow = fp.some(isBlank);

const isOnTheLeftEdge = panel =>
  _.reduce(
    panel,
    (count, rows) => (isNotBlank(_.first(rows)) ? count + 1 : count),
    0
  );

const isOnTheRightEdge = panel =>
  _.reduce(
    panel,
    (count, rows) => (isNotBlank(_.last(rows)) ? count + 1 : count),
    0
  );

const isOverlapItem = (a, b) => isNotBlank(a) && isNotBlank(b);
const isOverlap = (aPanel, bPanel) =>
  _.some(
    _.zipWith(to1DimAry(aPanel), to1DimAry(bPanel), isOverlapItem),
    fp.isEqual(true)
  );

const zipPanelItem = (a, b, c) => (isNotBlank(a) ? a : isNotBlank(b) ? b : c);
const assignPanel = ({ bgPanel, shuttlePanel, meteoritePanel }) =>
  _.chunk(
    _.zipWith(
      to1DimAry(bgPanel),
      to1DimAry(shuttlePanel),
      to1DimAry(meteoritePanel),
      zipPanelItem
    ),
    bgPanel[0].length
  );

// Move panel
//
const upPanel = panel => {
  const columns = panel[0].length;
  const newPanel = _.cloneDeep(panel);
  newPanel.shift();
  newPanel.push(getEmptyRow(columns));
  return newPanel;
};

const downPanel = panel => {
  const columns = panel[0].length;
  const newPanel = _.cloneDeep(panel);
  newPanel.pop();
  newPanel.unshift(getEmptyRow(columns));
  return newPanel;
};

const leftPanel = panel =>
  _.cloneDeep(panel).map(rows => {
    rows.shift();
    rows.push(createItem());
    return rows;
  });

const rightPanel = panel =>
  _.cloneDeep(panel).map(rows => {
    rows.pop();
    rows.unshift(createItem());
    return rows;
  });

const flipMatrix = matrix =>
  matrix[0].map((column, index) => matrix.map(row => row[index]));

/* eslint no-unused-vars:off */
const rotateRegion = (area, panel) => {
  const newPanel = _.cloneDeep(panel);
  const fromAry = [];
  _.range(area.startRow, area.endRow + 1).forEach(row => {
    _.range(area.startColumn, area.endColumn + 1).forEach(column => {
      fromAry.push(
        _.isUndefined(newPanel[row]) || _.isUndefined(newPanel[row][column])
          ? createItem()
          : newPanel[row][column]
      );
    });
  });
  const from2Ary = _.chunk(fromAry, Math.abs(area.startRow - area.endRow) + 1);
  const toAry = to1DimAry(flipMatrix(from2Ary.reverse()));
  _.range(area.startRow, area.endRow + 1).forEach(row => {
    _.range(area.startColumn, area.endColumn + 1).forEach(column => {
      const item = toAry.shift();
      const nop =
        _.isUndefined(newPanel[row]) || _.isUndefined(newPanel[row][column])
          ? ""
          : (newPanel[row][column] = _.cloneDeep(item));
    });
  });
  return newPanel;
};

const rotatePanel = (panel, moreSize = 2) => {
  const zeroPoints = [];
  panel.forEach((rows, rIndex) =>
    rows.forEach((item, cIndex) =>
      item.zeroPoint === true
        ? zeroPoints.push(Object.assign(item, { row: rIndex, column: cIndex }))
        : item
    )
  );

  const area =
    zeroPoints.length === 0
      ? {
          startRow: 0,
          startColumn: 0,
          endRow: 0,
          endColumn: 0
        }
      : _.reduce(
          zeroPoints,
          (keep, zeroPoint) => ({
            startRow: Math.min(keep.startRow, zeroPoint.row),
            startColumn: Math.min(keep.startColumn, zeroPoint.column),
            endRow: Math.max(keep.endRow, zeroPoint.row),
            endColumn: Math.max(keep.endColumn, zeroPoint.column)
          }),
          {
            startRow: 100,
            startColumn: 100,
            endRow: -1,
            endColumn: -1
          }
        );

  const newArea =
    zeroPoints.length === 1
      ? {
          startRow: _.first(zeroPoints).row - moreSize,
          startColumn: _.first(zeroPoints).column - moreSize,
          endRow: _.first(zeroPoints).row + moreSize,
          endColumn: _.first(zeroPoints).column + moreSize
        }
      : _.clone(area);

  return rotateRegion(newArea, panel);
};

// Remove row on panel

const addEmptyRow = (panel, rows) => {
  const columns = panel[0].length;
  const newPanel = _.cloneDeep(panel);
  const count = rows - newPanel.length;
  GLOBAL.count += count;
  newPanel.unshift(...getEmptyRows(count, columns));
  _.last(_.last(newPanel)).count = GLOBAL.count;
  return newPanel;
};

const removeFullRow = panel => {
  const rows = panel.length;
  const newPanel = _.filter(_.cloneDeep(panel), row => isNotFullRow(row));
  return addEmptyRow(newPanel, rows);
};

// Paint on panel

const paint = (panel, posAry, color) => {
  _(posAry).each(pos => {
    panel[pos.row][pos.column].color = color;
    panel[pos.row][pos.column].zeroPoint = pos.zeroPoint
      ? pos.zeroPoint
      : false;
  });
  return panel;
};

const repeat = (fn, initValue, count) => {
  return _.reduce(_.range(count), (memo, num) => fn(memo), initValue);
};

const adjustCenter = panel => {
  const max = _.reduce(
    panel,
    (maxIndex, rows) => {
      const lastIndex = _.findLastIndex(rows, item => isNotBlank(item));
      return maxIndex > lastIndex ? maxIndex : lastIndex;
    },
    0
  );
  const columns = panel[0].length;
  const shift = columns > max ? ((columns - max) / 2).toFixed(0) : 0;
  return repeat(rightPanel, panel, shift);
};

const adjustBottom = panel => {
  const max = _.reduce(
    panel,
    (count, rows) => {
      return _.every(rows, item => isBlank(item)) ? count + 1 : count;
    },
    0
  );
  const columns = panel[0].length;
  return repeat(downPanel, panel, max);
};

const paintT = panel =>
  paint(
    panel,
    [
      { row: 0, column: 1 },
      { row: 1, column: 0 },
      { row: 1, column: 1, zeroPoint: true },
      { row: 1, column: 2 }
    ],
    "pink"
  );

const panelList = [_.flow([createPanel, paintT, adjustCenter])];

// Create panel

const createShuttlePanel = _.flow([
  createPanel,
  paintT,
  adjustCenter,
  adjustBottom
]);

// Make tool panel

const addMeteorite = bgPanel => {
  const meteoritePanel = panelList[_.random(0, panelList.length - 1)]();
  const overlap = bgPanel ? isOverlap(bgPanel, meteoritePanel) : false;
  return overlap ? createPanel() : meteoritePanel;
};

// Process event

const getColorCount = panel =>
  _.reduce(
    to1DimAry(panel),
    (sum, item) => sum + (isNotBlank(item) ? 1 : 0),
    0
  );

const spaceKey = ({ bgPanel, meteoritePanel }) => {
  GLOBAL.pause = !isPaused();
  return {
    bgPanel,
    meteoritePanel
  };
};

const leftKey = ({ bgPanel, shuttlePanel, meteoritePanel }) => {
  const overlap =
    isOnTheLeftEdge(shuttlePanel) ||
    isOverlap(leftPanel(shuttlePanel), meteoritePanel);
  return {
    bgPanel,
    shuttlePanel: overlap ? shuttlePanel : leftPanel(shuttlePanel),
    meteoritePanel
  };
};

const upKey = ({ bgPanel, meteoritePanel }) => {
  const rotatedToolPanel = rotatePanel(meteoritePanel);
  const overlap =
    getColorCount(meteoritePanel) !== getColorCount(rotatedToolPanel) ||
    isOverlap(bgPanel, rotatedToolPanel);
  return {
    bgPanel,
    meteoritePanel: overlap ? meteoritePanel : rotatedToolPanel
  };
};

const rightKey = ({ bgPanel, shuttlePanel, meteoritePanel }) => {
  const overlap =
    isOnTheRightEdge(shuttlePanel) ||
    isOverlap(rightPanel(shuttlePanel), meteoritePanel);
  return {
    bgPanel,
    shuttlePanel: overlap ? shuttlePanel : rightPanel(shuttlePanel),
    meteoritePanel
  };
};

const downKey = ({ bgPanel, meteoritePanel }) => {
  const overlap =
    isBottom(meteoritePanel) || isOverlap(bgPanel, downPanel(meteoritePanel));
  const newBgPanel = overlap
    ? assignPanel({ bgPanel, meteoritePanel })
    : bgPanel;
  const newToolPanel = overlap
    ? addMeteorite(newBgPanel)
    : downPanel(meteoritePanel);
  return {
    bgPanel: removeFullRow(newBgPanel),
    meteoritePanel: newToolPanel
  };
};

// Key definition

const withPauseKey = fn => panels => (isPaused() ? panels : fn(panels));
const scrollDownPanel = withPauseKey(downKey);

const keyFnList = [
  { key: "space", fn: spaceKey },
  { key: "left", fn: withPauseKey(leftKey) },
  { key: "up", fn: withPauseKey(upKey) },
  { key: "right", fn: withPauseKey(rightKey) },
  { key: "down", fn: scrollDownPanel }
];

const shuttleKeyFnList = [
  { key: "left", fn: withPauseKey(leftKey) },
  { key: "right", fn: withPauseKey(rightKey) }
];

const isValidKey = (key, fnList) =>
  _.some(fnList, item => _.isEqual(item.key, key));

const initBlockTable = (rows = 15, columns = 15) => ({
  bgPanel: createPanel(rows, columns),
  shuttlePanel: createShuttlePanel(),
  meteoritePanel: createPanel()
});

const moveBlockTable = state => ({
  bgPanel: state.bgPanel,
  shuttlePanel: upPanel(state.shuttlePanel),
  meteoritePanel: state.meteoritePanel
});

const keyBlockTable = (key, state) =>
  isValidKey(key, shuttleKeyFnList)
    ? _.find(shuttleKeyFnList, item => _.isEqual(item.key, key)).fn({
        bgPanel: state.bgPanel,
        shuttlePanel: state.shuttlePanel,
        meteoritePanel: state.meteoritePanel
      })
    : {
        bgPanel: state.bgPanel,
        shuttlePanel: state.shuttlePanel,
        meteoritePanel: state.meteoritePanel
      };

const joinBlockTable = state =>
  assignPanel({
    bgPanel: state.bgPanel,
    shuttlePanel: state.shuttlePanel,
    meteoritePanel: state.meteoritePanel
  });

module.exports = {
  initBlockTable,
  moveBlockTable,
  keyBlockTable,
  joinBlockTable,
  isBlank
};
