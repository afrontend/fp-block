#!/usr/bin/env node
const _ = require("lodash");
const clear = require("clear");
const keypress = require("keypress");
const program = require("commander");
const game = require("../lib/index.js");
const pkg = require("../package.json");
const chalk = require("chalk");

program
  .version(pkg.version)
  .option("-f, --full", "terminal full size")
  .parse(process.argv);

function getColorItem(item, char) {
  if (chalk[item.color]) {
    return chalk[item.color](char);
  }
  return chalk.red(char);
}

const getMark = item =>
  game.isMissileItem(item) ? getColorItem(item, "*") : getColorItem(item, "■");

const dump = state => {
  console.log(JSON.stringify(state));
};

const save = global => {
  global.savedState = _.cloneDeep(global.state);
};

const restore = global => {
  global.state = global.savedState;
};

const startGame = (rows = 15, columns = 15) => {
  const global = {
    state: game.init(rows, columns)
  };

  keypress(process.stdin);

  process.stdin.on("keypress", (ch, key) => {
    if (key && key.ctrl && key.name === "c") {
      process.exit();
    }
    if (key && key.name === "q") {
      process.exit();
    }
    if (key && key.name === "s") {
      save(global);
    }
    if (key && key.name === "l") {
      restore(global);
    }
    if (key && key.ctrl && key.name === "d") {
      dump(global.state);
      process.exit();
    }
    if (key) {
      global.state = game.key(key.name, global.state);
    }
  });

  process.stdin.setRawMode(true);
  process.stdin.resume();

  const format = ary =>
    ary
      .map(r =>
        r.map(item => (game.isBlankItem(item) ? " " : getMark(item))).join(" ")
      )
      .join("|\r\n");

  global.timer = setInterval(() => {
    global.state = game.tick(global.state);
    if (!program.full) {
      clear();
    }
    console.log(format(game.join(global.state)));
  }, 200);
};

const activate = program => {
  if (program.full) {
    startGame(process.stdout.rows - 1, process.stdout.columns / 2 - 1);
  } else {
    startGame();
  }
};

activate(program);
