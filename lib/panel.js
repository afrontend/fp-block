const _ = require("lodash");
const fp = require("lodash/fp");

const GLOBAL = {
  color: "grey",
  count: 0,
  pause: false
};

const getAry = (len, fnOrObject) =>
  _.range(len).map(() =>
    _.isFunction(fnOrObject) ? fnOrObject() : _.cloneDeep(fnOrObject)
  );

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

const getEmptyRows = (count, columns) => getAry(count, getEmptyRow(columns));
const isBlankItem = item => item.color === GLOBAL.color;
const isItem = item => item.color !== GLOBAL.color;
const isNotBlankRow = fp.some(isItem);
const isBottom = panel => isNotBlankRow(_.last(panel));
const isNotFullRow = fp.some(isBlankItem);

const paint = (panel, posAry, color) => {
  _(posAry).each(pos => {
    panel[pos.row][pos.column].color = color;
    panel[pos.row][pos.column].zeroPoint = pos.zeroPoint
      ? pos.zeroPoint
      : false;
  });
  return panel;
};

const getZeroPoints = panel => {
  const zeroPoints = [];
  panel.forEach((rows, rIndex) =>
    rows.forEach((item, cIndex) =>
      item.zeroPoint === true
        ? zeroPoints.push(Object.assign(item, { row: rIndex, column: cIndex }))
        : item
    )
  );
  return zeroPoints;
};

const up = panel => {
  const columns = panel[0].length;
  const newPanel = _.cloneDeep(panel);
  newPanel.shift();
  newPanel.push(getEmptyRow(columns));
  return newPanel;
};

const down = panel => {
  const columns = panel[0].length;
  const newPanel = _.cloneDeep(panel);
  newPanel.pop();
  newPanel.unshift(getEmptyRow(columns));
  return newPanel;
};

const left = panel =>
  _.cloneDeep(panel).map(rows => {
    rows.shift();
    rows.push(createItem());
    return rows;
  });

const right = panel =>
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
  const toAry = _.flattenDepth(flipMatrix(from2Ary.reverse()));
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

const rotate = (panel, moreSize = 2) => {
  const zeroPoints = getZeroPoints(panel);
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

const zipPanelItem = (a, b, c, d) =>
  isItem(a) ? a : isItem(b) ? b : isItem(c) ? c : d;
const assign = ({ bgPanel, shuttlePanel, missilePanel, meteoritePanel }) =>
  _.chunk(
    _.zipWith(
      _.flattenDepth(bgPanel),
      _.flattenDepth(shuttlePanel),
      _.flattenDepth(missilePanel),
      _.flattenDepth(meteoritePanel),
      zipPanelItem
    ),
    bgPanel[0].length
  );

const diffPanelItem = (a, b) => (isItem(b) ? createItem() : a);
const diff = ({ bgPanel, shuttlePanel, missilePanel, meteoritePanel }) => {
  const newMissilePanel = _.chunk(
    _.zipWith(
      _.flattenDepth(missilePanel),
      _.flattenDepth(meteoritePanel),
      diffPanelItem
    ),
    bgPanel[0].length
  );

  const newMeteoritePanel = _.chunk(
    _.zipWith(
      _.flattenDepth(meteoritePanel),
      _.flattenDepth(missilePanel),
      diffPanelItem
    ),
    bgPanel[0].length
  );

  return {
    bgPanel,
    shuttlePanel,
    missilePanel: newMissilePanel,
    meteoritePanel: newMeteoritePanel
  };
};

const repeat = (fn, initValue, count) =>
  _.reduce(_.range(count), (memo, num) => fn(memo), initValue);

const getMaxColumn = panel =>
  _.reduce(
    panel,
    (maxIndex, rows) => {
      const lastIndex = _.findLastIndex(rows, item => isItem(item));
      return maxIndex > lastIndex ? maxIndex : lastIndex;
    },
    0
  );

const getMaxRow = panel =>
  _.reduce(
    panel,
    (count, rows) => {
      return _.every(rows, item => isBlankItem(item)) ? count + 1 : count;
    },
    0
  );

const adjustCenter = panel => {
  const columns = panel[0].length;
  const max = getMaxColumn(panel);
  const shift = columns > max ? ((columns - max) / 2).toFixed(0) : 0;
  return repeat(right, panel, shift);
};

const adjustBottom = panel => repeat(down, panel, getMaxRow(panel));

const adjustRandomCenter = panel =>
  repeat(right, panel, _.random(0, panel[0].length - getMaxColumn(panel) - 1));

const getColorCount = panel =>
  _.reduce(_.flattenDepth(panel), (sum, item) => sum + (isItem(item) ? 1 : 0), 0);

const isEmpty = panel => getColorCount(panel) === 0;

const isOverlapItem = (a, b) => isItem(a) && isItem(b);
const isOverlap = (aPanel, bPanel) =>
  _.some(
    _.zipWith(_.flattenDepth(aPanel), _.flattenDepth(bPanel), isOverlapItem),
    fp.isEqual(true)
  );

const isOnTheLeftEdge = panel =>
  _.reduce(
    panel,
    (count, rows) => (isItem(_.first(rows)) ? count + 1 : count),
    0
  );

const isOnTheRightEdge = panel =>
  _.reduce(
    panel,
    (count, rows) => (isItem(_.last(rows)) ? count + 1 : count),
    0
  );

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

module.exports = {
  createPanel,
  paint,
  getZeroPoints,
  up,
  down,
  left,
  right,
  rotate,
  assign,
  diff,
  getMaxRow,
  getMaxColumn,
  adjustCenter,
  adjustBottom,
  adjustRandomCenter,
  isEmpty,
  isOverlap,
  isOnTheLeftEdge,
  isOnTheRightEdge,
  isBottom,
  isBlankItem
};
