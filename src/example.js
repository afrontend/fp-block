#!/usr/bin/env node
const clear = require("clear");
const keypress = require("keypress");
const { program } = require("commander");
const game = require("../lib/index.js");
const pkg = require("../package.json");
const { format } = require("./format.js");
const chalk = require("chalk");

program
  .version(pkg.version)
  .option("-f, --full", "terminal full size")
  .parse(process.argv);

const dump = (state) => {
  console.log(JSON.stringify(state));
};

const save = (gameCtx) => {
  gameCtx.savedState = structuredClone(gameCtx.state);
};

const reload = (gameCtx) => {
  gameCtx.state = gameCtx.savedState;
};

const HELP_TEXT = [
  "",
  "  Controls:",
  "  ← →      Move left / right",
  "  ↑         Fire missile",
  "  Space     Pause / resume",
  "  s         Save state",
  "  l         Load state",
  "  h         Toggle this help",
  "  q / ^C    Quit",
].join("\r\n");

const startGame = (rows = 15, columns = 15) => {
  const gameContext = {
    state: game.init(rows, columns),
    showHelp: false,
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
      save(gameContext);
    }
    if (key && key.name === "l") {
      reload(gameContext);
    }
    if (key && key.name === "h") {
      gameContext.showHelp = !gameContext.showHelp;
    }
    if (key && key.ctrl && key.name === "d") {
      dump(gameContext.state);
      process.exit();
    }
    if (key) {
      gameContext.state = game.key(key.name, gameContext.state);
    }
  });

  process.stdin.setRawMode(true);
  process.stdin.resume();

  gameContext.timer = setInterval(() => {
    if (!gameContext.showHelp) {
      gameContext.state = game.tick(gameContext.state);
    }
    if (!program.opts().full) {
      clear();
    }
    console.log(format(game.join(gameContext.state)));
    if (gameContext.showHelp) {
      console.log(HELP_TEXT);
    }
  }, 200);
};

const runCountdown = (rows, columns) => {
  const counts = [5, 4, 3, 2, 1];
  let i = 0;

  const tick = () => {
    clear();
    console.log("\r\n");
    console.log(chalk.yellow("  fp-block\r\n"));
    console.log(chalk.cyan("  Press [ h ] for help\r\n"));
    console.log(chalk.white("  Starting in... ") + chalk.bold.green(counts[i]));
    i++;
    if (i < counts.length) {
      setTimeout(tick, 1000);
    } else {
      setTimeout(() => startGame(rows, columns), 1000);
    }
  };

  tick();
};

const activate = () => {
  if (program.opts().full) {
    runCountdown(process.stdout.rows - 1, process.stdout.columns / 2 - 1);
  } else {
    runCountdown();
  }
};

activate();
