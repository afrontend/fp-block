#!/usr/bin/env node
const clear = require("clear");
const keypress = require("keypress");
const program = require("commander");
const fpBlock = require("../lib/index.js");
const pkg = require("../package.json");

program
  .version(pkg.version)
  .option("-f, --full", "terminal full size")
  .parse(process.argv);

const getMark = (item) => {
  return item.color === "yellow" ? "*" : "■";
}

const startGame = (rows = 15, columns = 15) => {
  const global = {
    state: fpBlock.initBlockTable(rows, columns)
  };

  keypress(process.stdin);

  process.stdin.on("keypress", (ch, key) => {
    if (key && key.ctrl && key.name === "c") {
      process.exit();
    }
    if (key && key.name === "q") {
      process.exit();
    }
    if (key) {
      global.state = fpBlock.keyBlockTable(key.name, global.state);
    }
  });

  process.stdin.setRawMode(true);
  process.stdin.resume();

  const format = ary =>
    ary.map(r => r.map(item => (fpBlock.isBlank(item) ? " " : getMark(item))).join(" "));

  global.timer = setInterval(() => {
    global.state = fpBlock.moveBlockTable(global.state);
    if (!program.full) {
      clear();
    }
    console.log(format(fpBlock.joinBlockTable(global.state)));
  }, 200);
};

const activate = program => {
  if (program.full) {
    startGame(process.stdout.rows - 1, process.stdout.columns / 2 - 4);
  } else {
    startGame();
  }
};

activate(program);
