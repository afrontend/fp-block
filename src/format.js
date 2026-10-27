const { inspect, styleText } = require("node:util");
const game = require("../lib/index.js");

const getColorItem = (item, char) => {
  // styleText 는 모르는 색 이름에 예외를 던지므로 없는 색(pink, orange 등)은 red 로 그린다
  const color = Object.hasOwn(inspect.colors, item.color) ? item.color : "red";
  return styleText(color, char);
};

const getMark = (item) =>
  game.isMissileItem(item) ? getColorItem(item, "*") : getColorItem(item, "■");

const format = (ary) =>
  ary
    .map((r) =>
      r.map((item) => (game.isBlankItem(item) ? " " : getMark(item))).join(" "),
    )
    .join("|\r\n");

module.exports = { format };
