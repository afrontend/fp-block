# fp-block
> library for [fp-block-game](https://github.com/afrontend/fp-block-game)

![console block screenshot](https://agvim.files.wordpress.com/2019/03/fp-block.png "console block screenshot")

## Just run

```sh
npx fp-block
```

## Run with source

```sh
git clone https://github.com/afrontend/fp-block.git
cd fp-block
npm install
npm start
```

## CLI Options

| Option | Description |
|---|---|
| `-f, --full` | Terminal full size mode |

## Key Bindings

| Key | Action |
|---|---|
| `←` / `→` | Move shuttle left / right |
| `↑` | Fire missile |
| `Space` | Pause / Resume |
| `s` | Save state |
| `l` | Load saved state |
| `q` / `Ctrl+C` | Quit |
| `Ctrl+D` | Dump state (JSON) and quit |

## Game Elements

| Element | Color | Description |
|---|---|---|
| Shuttle | Pink | Player-controlled ship at the bottom |
| Meteorite | Blue | Enemy that falls from the top, random shape (7 cells) |
| Missile | Yellow | Fired upward from the shuttle |

## Library API

```js
const game = require('fp-block');
```

### `game.init(rows = 15, columns = 15)`
Returns the initial game state with all panels.

```js
const state = game.init(15, 15);
// { bgPanel, shuttlePanel, missilePanel, meteoritePanel }
```

### `game.tick(state)`
Advances the game by one frame. Moves the missile up, meteorite down, and checks for collisions. Returns `state` unchanged when paused.

```js
const nextState = game.tick(state);
```

### `game.key(keyName, state)`
Applies a key input to the state. Valid keys: `'left'`, `'right'`, `'up'`, `'space'`.

```js
const nextState = game.key('left', state);
```

### `game.join(state)`
Merges all panels into a single 2D array for rendering.

```js
const panel = game.join(state);
```

### `game.isBlankItem(item)`
Returns `true` if the cell is a blank (background) cell.

### `game.isMissileItem(item)`
Returns `true` if the cell belongs to a missile.

### `game.makeMeteoriteShape()`
Returns a random meteorite shape as an array of 7 cell descriptors from a 3×3 grid.

## License

MIT © Bob Hwang
