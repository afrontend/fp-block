const game = require("../index.js");

describe("공통 호환 API", () => {
  it("객체와 위치 인자 초기화를 모두 지원한다", () => {
    expect(game.init({ rows: 6, columns: 7 }).rows).toBe(6);
    expect(game.init(6, 7).columns).toBe(7);
  });

  it("크기를 1~500 범위로 보정한다", () => {
    const state = game.init({ rows: 0, columns: 999 });
    expect(state.rows).toBe(1);
    expect(state.columns).toBe(500);
  });

  it("미사일 발사 대기시간을 상태에서 관리한다", () => {
    let state = game.init({ rows: 15, columns: 15, missileCooldownTicks: 3 });
    state = game.key("up", state);
    expect(state.missileCooldown).toBe(3);
    expect(game.key("up", state)).toBe(state);
    state = game.tick(game.tick(game.tick(state)));
    expect(state.missileCooldown).toBe(0);
  });

  it("paused와 deprecated pause를 함께 갱신한다", () => {
    const paused = game.key("space", game.init());
    expect(paused.paused).toBe(true);
    expect(paused.pause).toBe(true);
  });

  it("공통 렌더링 API를 제공한다", () => {
    const state = game.init();
    expect(game.toArray(state)).toHaveLength(4);
    expect(game.isBlank(state.bgPanel[0][0])).toBe(true);
    expect(game.isBlankItem(state.bgPanel[0][0])).toBe(true);
    expect(game.getTickInterval(state)).toBe(150);
  });

  it("JSON 왕복 가능한 스냅숏을 복원한다", () => {
    const state = game.init({ rows: 8, columns: 9 });
    const snapshot = JSON.parse(JSON.stringify(game.serializeState(state)));
    expect(snapshot.game).toBe("fp-block");
    expect(snapshot.version).toBe(1);
    expect(game.restoreState(snapshot).shuttlePanel).toEqual(
      state.shuttlePanel,
    );
  });
});
