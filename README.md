# fp-block
> library for [fp-block-game](https://github.com/afrontend/fp-block-game)

![demo](https://github.com/afrontend/fp-block/releases/download/demo-assets/demo.gif)

## Just run

```sh
npx fp-block
```

Use `--full` to fill the entire terminal window:

```sh
npx fp-block --full
```

## Run with source

```sh
git clone https://github.com/afrontend/fp-block.git
cd fp-block
npm install
npm start
```

### CLI options

| 옵션 | 설명 |
|--------|------|
| `-f, --full` | 터미널 전체 크기로 게임판을 표시한다. |
| `--rows <number>` | 게임판 행 수를 지정한다. |
| `--columns <number>` | 게임판 열 수를 지정한다. |

`--full`과 크기 옵션을 함께 사용하면 `--full`이 우선한다.

## Controls

| 키 | 동작 |
|----|------|
| `←` `→` | 좌우 이동 |
| `↑` | 미사일 발사 |
| `Space` | 일시정지 / 재개 |
| `h` | 도움말 열기 / 닫기 |
| `s` | 빠른 저장 |
| `l` | 빠른 불러오기 |
| `q` / `Ctrl+C` | 종료 |
| `Ctrl+D` | 복원 가능한 스냅숏 JSON을 출력하고 종료 |

빠른 저장 상태는 현재 실행 중에만 유지된다. 게임은 3초 카운트다운 후 시작한다.

## Library API

```js
const game = require('fp-block');
```

### `game.init(options)`
초기 상태를 만든다. 기존 위치 인자 호출도 지원한다.

```js
const state = game.init({
  rows: 15,
  columns: 15,
  missileCooldownTicks: 3,
});
const legacyState = game.init(15, 15);
```

보드 크기는 1~500으로 보정된다. 미사일은 기본적으로 발사 후 3 tick 동안 다시 발사할 수 없다.

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

### 공통 상태 API

```js
const panels = game.toArray(state);
const interval = game.getTickInterval(state); // 150
const snapshot = game.serializeState(state);
const restored = game.restoreState(snapshot);
```

스냅숏은 `{ game: 'fp-block', version: 1, state }` 형식의 JSON-safe 객체다. 빈 셀은 `isBlank(item)`으로 확인하며 기존 `isBlankItem(item)`도 하위 호환을 위해 유지된다.

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
