# AGENTS.md

Guidance for AI coding agents (Claude Code, Codex, OpenCode, pi, …) working in this repository.
`CLAUDE.md` only imports this file (`@AGENTS.md`); edit this file, not `CLAUDE.md`.

## What this is

`fp-block` is a functional block-shooter game-logic library (published to npm) plus a terminal demo: a tool at the bottom fires missiles at falling meteorites. It sits in the afrontend game stack:

```
fp-panel (npm) → fp-block (this repo, npm) → fp-block-game (React web app)
```

Grid primitives come from `fp-panel`; the web app `fp-block-game` consumes this package from npm. A change here reaches the web app only after publishing and bumping its dependency (or `npm link` locally).

## Commands

```sh
npm test            # ESLint (pretest) then vitest run
npm run test:watch  # vitest in watch mode
npm start           # terminal demo (node ./src/example.js)
npm run demo-gif    # record demo.cast/demo.gif (scripts/make-demo.sh, asciinema + agg)
npx vitest run src/__tests__/format.test.js   # single test file
```

ESLint + Prettier are configured in `eslint.config.js`; `pretest` runs ESLint, so lint errors block tests.

## Layout

- `lib/index.js` — the library (CJS, hand-written source, not build output)
- `lib/__tests__/` — vitest tests per concern (`key`, `tick`, `meteorite`, `pause`, `mutation`, …); `compatibility.test.js` pins the shared API contract
- `src/example.js` — terminal game (`src/format.js` renders the board; `src/__tests__/format.test.js` tests it); uses only Node built-ins (`util.styleText`, `util.parseArgs`, `readline.emitKeypressEvents`, ANSI clear), so the sole runtime dependency is `fp-panel`
- `scripts/autoplay.js`, `scripts/make-demo.sh` — automated play for the demo GIF
- `.github/workflows/demo.yml` — on push to `master`, regenerates the demo GIF (asciinema/agg are pinned by version + sha256; bump both together)
- `.github/workflows/test.yml` — `npm test` on push to `master` and on PRs (incl. Dependabot)
- Actions are pinned to commit SHAs with a `# vN` comment and updated via Dependabot (`.github/dependabot.yml`: github-actions + npm, monthly); keep the SHA pin when editing by hand. CI runs Node 24.

## Architecture

State machine on top of `fp-panel`. All transitions are pure and return a new state object (`mutation.test.js` guards against mutating input). The state holds named panels (tool, missile, meteorite, …) composed with `fp-panel` primitives.

Shared API (same shape across fp-tetris / fp-block / fp-snake / fp-space / fp-sokoban):

| Export | Description |
|---|---|
| `init({ rows, columns, ... })` | Initial state; `init(rows, columns, options)` still accepted; options include `missileCooldownTicks` |
| `tick(state)` | Advance one frame |
| `key(keyName, state)` | Input: `'left'`, `'right'`, `'up'` (fire, subject to missile cooldown), `'space'` (pause toggle); other keys are ignored |
| `join(state)` | Merge panels into one renderable panel |
| `toArray`, `isBlank`, `getTickInterval` | Rendering / timing helpers |
| `serializeState` / `restoreState` | Save / load |

Block-specific: `isMissileItem`, `makeMeteoriteShape`. Missiles are drawn `yellow` by convention.
