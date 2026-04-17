# fp-block
> library for [fp-block-game](https://github.com/afrontend/fp-block-game)

![demo](https://github.com/afrontend/fp-block/releases/download/demo-assets/demo.gif)

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

## Controls

| Key | Action |
|---|---|
| `←` / `→` | Move shuttle left / right |
| `↑` | Fire missile |
| `Space` | Pause / Resume |
| `s` | Save state |
| `l` | Load saved state |
| `q` / `Ctrl+C` | Quit |
| `Ctrl+D` | Dump state (JSON) and quit |

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

## Demo GIF 업데이트

터미널 동작 미리보기를 자동으로 재생성합니다.

```sh
# 의존 도구 설치 (최초 1회)
brew install asciinema
brew install agg
brew install gh && gh auth login

# 데모 생성 및 GitHub Releases 업로드
npm run demo-gif
```

`npm run demo-gif` 실행 순서:

1. `scripts/autoplay.js` — AI가 게임을 자동 플레이하고 자동 종료
2. `asciinema rec` — 터미널 출력을 `demo.cast`로 녹화
3. `agg` — `demo.cast` → `demo.gif` 변환
4. `gh release upload` — GitHub Releases `demo-assets` 태그에 업로드
5. `README.md` — GIF URL을 GitHub Releases 경로로 교체

master 브랜치에 푸시하면 `.github/workflows/demo.yml`이 위 과정을 자동으로 실행합니다.

## License

MIT © Bob Hwang
