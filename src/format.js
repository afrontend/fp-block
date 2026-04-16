const chalk = require("chalk");
const game = require("../lib/index.js");

const getColorItem = (item, char) => {
  if (chalk[item.color]) {
    return chalk[item.color](char);
  }
  return chalk.red(char);
};

const getMark = item =>
  game.isMissileItem(item) ? getColorItem(item, "*") : getColorItem(item, "■");

const format = ary =>
  ary
    .map(r =>
      r.map(item => (game.isBlankItem(item) ? " " : getMark(item))).join(" ")
    )
    .join("|\r\n");

module.exports = { format };
