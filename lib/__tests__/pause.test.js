const game = require("../index.js");

describe("pause (space key)", () => {
  it("일시정지 중 tick은 state를 그대로 반환한다", () => {
    const state = game.init(10, 10);
    const paused = game.key("space", state);
    expect(game.tick(paused)).toBe(paused);
  });

  it("일시정지 중 left/right/up 키는 state를 변경하지 않는다", () => {
    const state = game.init(10, 10);
    const paused = game.key("space", state);
    expect(game.key("left", paused)).toEqual(paused);
    expect(game.key("right", paused)).toEqual(paused);
    expect(game.key("up", paused)).toEqual(paused);
  });

  it("일시정지 해제 후 tick은 새 state를 반환한다", () => {
    const state = game.init(10, 10);
    const paused = game.key("space", state);
    const unpaused = game.key("space", paused);
    expect(game.tick(unpaused)).not.toBe(unpaused);
  });

  it("space 키는 paused를 false에서 true로 토글한다", () => {
    const state = game.init(10, 10);
    expect(state.paused).toBe(false);
    expect(game.key("space", state).paused).toBe(true);
  });

  it("space 키를 두 번 누르면 paused가 원래대로 돌아온다", () => {
    const state = game.init(10, 10);
    const twice = game.key("space", game.key("space", state));
    expect(twice.paused).toBe(false);
  });

  it("left/right/up 키는 paused 필드를 유지한다", () => {
    const state = game.init(10, 10);
    const paused = game.key("space", state);
    expect(game.key("left", paused).paused).toBe(true);
    expect(game.key("right", paused).paused).toBe(true);
    expect(game.key("up", paused).paused).toBe(true);
  });
});
