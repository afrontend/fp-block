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
});
