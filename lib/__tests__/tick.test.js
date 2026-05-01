const game = require("../index.js");

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Row indices that contain at least one non-blank cell. */
const nonBlankRows = (panel) => {
  const rows = new Set();
  panel.forEach((row, r) => {
    if (row.some((item) => !game.isBlankItem(item))) rows.add(r);
  });
  return [...rows].sort((a, b) => a - b);
};

/** Column indices that contain at least one non-blank cell. */
const nonBlankCols = (panel) => {
  const cols = new Set();
  panel.forEach((row) => {
    row.forEach((item, c) => {
      if (!game.isBlankItem(item)) cols.add(c);
    });
  });
  return [...cols].sort((a, b) => a - b);
};

const isBlankPanel = (panel) =>
  panel.every((row) => row.every((item) => game.isBlankItem(item)));

// ─── tick ─────────────────────────────────────────────────────────────────────

describe("tick", () => {
  it("일시정지 상태에서는 같은 참조를 반환한다", () => {
    const s0 = game.key("space", game.init(10, 10));
    expect(game.tick(s0)).toBe(s0);
  });

  it("발사된 미사일은 매 tick 위로 이동한다", () => {
    const s0 = game.key("up", game.init(15, 15));
    const rowsBefore = nonBlankRows(s0.missilePanel);
    const s1 = game.tick(s0);
    const rowsAfter = nonBlankRows(s1.missilePanel);
    rowsBefore.forEach((row, i) => {
      expect(rowsAfter[i]).toBe(row - 1);
    });
  });

  it("운석은 매 tick 아래로 이동한다", () => {
    const s0 = game.init(15, 15);
    const rowsBefore = nonBlankRows(s0.meteoritePanel);
    const s1 = game.tick(s0);
    const rowsAfter = nonBlankRows(s1.meteoritePanel);
    rowsBefore.forEach((row, i) => {
      expect(rowsAfter[i]).toBe(row + 1);
    });
  });

  it("미사일이 운석에 닿으면 겹친 셀이 사라진다", () => {
    let state = game.init(15, 15);
    for (let i = 0; i < 5; i++) state = game.key("up", state);
    for (let i = 0; i < 14; i++) state = game.tick(state);
    // 운석이 시작할 때 7개 셀 — 일부가 파괴되어야 한다
    expect(nonBlankCols(state.meteoritePanel).length).toBeLessThan(7);
  });

  it("운석이 전부 파괴되면 새 운석이 생성된다", () => {
    let state = game.init(15, 15);
    for (let i = 0; i < 20; i++) {
      state = game.key("up", state);
      state = game.tick(state);
    }
    expect(isBlankPanel(state.meteoritePanel)).toBe(false);
  });

  it("tick 후에도 bgPanel과 shuttlePanel은 변경되지 않는다", () => {
    const s0 = game.init(10, 10);
    const s1 = game.tick(s0);
    expect(s1.bgPanel).toEqual(s0.bgPanel);
    expect(s1.shuttlePanel).toEqual(s0.shuttlePanel);
  });
});

// ─── join ─────────────────────────────────────────────────────────────────────

describe("join", () => {
  it("올바른 행·열 수의 2D 배열을 반환한다", () => {
    const state = game.init(10, 12);
    const grid = game.join(state);
    expect(grid.length).toBe(10);
    expect(grid[0].length).toBe(12);
  });

  it("shuttle 셀이 포함된다", () => {
    const state = game.init(15, 15);
    const grid = game.join(state);
    const hasShuttle = grid.some((row) =>
      row.some((item) => !game.isBlankItem(item)),
    );
    expect(hasShuttle).toBe(true);
  });

  it("발사 후 tick하면 미사일 셀이 join에 반영된다", () => {
    const s0 = game.init(15, 15);
    const s1 = game.tick(game.key("up", s0));
    const countNonBlank = (grid) =>
      grid.flat().filter((item) => !game.isBlankItem(item)).length;
    expect(countNonBlank(game.join(s1))).toBeGreaterThan(
      countNonBlank(game.join(s0)),
    );
  });
});

// ─── key — left/right 경계 ───────────────────────────────────────────────────

describe("key — 경계", () => {
  it("왼쪽 끝에서 left 키를 눌러도 shuttle이 이동하지 않는다", () => {
    let state = game.init(15, 15);
    for (let i = 0; i < 15; i++) state = game.key("left", state);
    const colsAtEdge = nonBlankCols(state.shuttlePanel);
    state = game.key("left", state);
    expect(nonBlankCols(state.shuttlePanel)).toEqual(colsAtEdge);
  });

  it("오른쪽 끝에서 right 키를 눌러도 shuttle이 이동하지 않는다", () => {
    let state = game.init(15, 15);
    for (let i = 0; i < 15; i++) state = game.key("right", state);
    const colsAtEdge = nonBlankCols(state.shuttlePanel);
    state = game.key("right", state);
    expect(nonBlankCols(state.shuttlePanel)).toEqual(colsAtEdge);
  });
});
