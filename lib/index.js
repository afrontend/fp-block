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

const isOverlapItem = (bg, tool) => isNotBlank(bg) && isNotBlank(tool);
const isOverlap = (bgPanel, missilePanel) =>
  _.some(
    _.zipWith(to1DimAry(bgPanel), to1DimAry(missilePanel), isOverlapItem),
    fp.isEqual(true)
  );

const zipPanelItem = (bg, tool) => (isBlank(tool) ? bg : tool);
const assignPanel = ({ bgPanel, missilePanel }) => {
  const columns = bgPanel[0].length;
  return _.chunk(
    _.zipWith(to1DimAry(bgPanel), to1DimAry(missilePanel), zipPanelItem),
    columns
  );
};

// Move panel

const downPanel = panel => {
  const columns = panel[0].length;
  const newPanel = _.cloneDeep(panel);
  newPanel.pop();
  newPanel.unshift(getEmptyRow(columns));
  return newPanel;
};

const leftPanel = panel => {
  return _.cloneDeep(panel).map(rows => {
    rows.shift();
    rows.push(createItem());
    return rows;
  });
};

const rightPanel = panel => {
  return _.cloneDeep(panel).map(rows => {
    rows.pop();
    rows.unshift(createItem());
    return rows;
  });
};

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

const paintT = panel => {
  return paint(
    panel,
    [
      { row: 0, column: 1 },
      { row: 1, column: 0 },
      { row: 1, column: 1, zeroPoint: true },
      { row: 1, column: 2 }
    ],
    "pink"
  );
};

const panelList = [_.flow([createPanel, paintT, adjustCenter])];

// Make tool panel

const createRandomToolPanel = bgPanel => {
  const missilePanel = panelList[_.random(0, panelList.length - 1)]();
  const overlap = bgPanel ? isOverlap(bgPanel, missilePanel) : false;
  return overlap ? createPanel() : missilePanel;
};

// Process event

const getColorCount = panel =>
  _.reduce(
    to1DimAry(panel),
    (sum, item) => sum + (isNotBlank(item) ? 1 : 0),
    0
  );

const spaceKey = ({ bgPanel, missilePanel }) => {
  GLOBAL.pause = !(GLOBAL.pause === true);
  return {
    bgPanel,
    missilePanel
  };
};

const leftKey = ({ bgPanel, missilePanel }) => {
  const overlap =
    isOnTheLeftEdge(missilePanel) ||
    isOverlap(bgPanel, leftPanel(missilePanel));
  return {
    bgPanel,
    missilePanel: overlap ? missilePanel : leftPanel(missilePanel)
  };
};

const upKey = ({ bgPanel, missilePanel }) => {
  const rotatedToolPanel = rotatePanel(missilePanel);
  const overlap =
    getColorCount(missilePanel) !== getColorCount(rotatedToolPanel) ||
    isOverlap(bgPanel, rotatedToolPanel);
  return {
    bgPanel,
    missilePanel: overlap ? missilePanel : rotatedToolPanel
  };
};

const rightKey = ({ bgPanel, missilePanel }) => {
  const overlap =
    isOnTheRightEdge(missilePanel) ||
    isOverlap(bgPanel, rightPanel(missilePanel));
  return {
    bgPanel,
    missilePanel: overlap ? missilePanel : rightPanel(missilePanel)
  };
};

const downKey = ({ bgPanel, missilePanel }) => {
  const overlap =
    isBottom(missilePanel) || isOverlap(bgPanel, downPanel(missilePanel));
  const newBgPanel = overlap ? assignPanel({ bgPanel, missilePanel }) : bgPanel;
  const newToolPanel = overlap
    ? createRandomToolPanel(newBgPanel)
    : downPanel(missilePanel);
  return {
    bgPanel: removeFullRow(newBgPanel),
    missilePanel: newToolPanel
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

const isValidKey = key => _.some(keyFnList, item => _.isEqual(item.key, key));

const initBlockTable = (rows = 15, columns = 15) => ({
  bgPanel: createPanel(rows, columns),
  missilePanel: createPanel(rows, columns)
});

const moveBlockTable = state => ({
  bgPanel: state.bgPanel,
  missilePanel: state.missilePanel
});

const keyBlockTable = (key, state) => ({
  bgPanel: state.bgPanel,
  missilePanel: state.missilePanel
});

const joinBlockTable = state =>
  assignPanel({
    bgPanel: state.bgPanel,
    missilePanel: state.missilePanel
  });

module.exports = {
  initBlockTable,
  moveBlockTable,
  keyBlockTable,
  joinBlockTable
};