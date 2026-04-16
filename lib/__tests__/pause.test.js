const game = require("../index.js");

describe("pause (space key)", () => {
  // spaceKey는 GLOBAL.pause를 변이하므로 각 테스트에서 쌍으로 토글해 초기화합니다.

  it("일시정지 중 tick은 state를 그대로 반환한다", () => {
    const state = game.init(10, 10);
    game.key("space", state); // pause ON
    expect(game.tick(state)).toBe(state); // 동일 참조
    game.key("space", state); // pause OFF (cleanup)
  });

  it("일시정지 중 left/right/up 키는 state를 변경하지 않는다", () => {
    const state = game.init(10, 10);
    game.key("space", state); // pause ON
    expect(game.key("left", state)).toEqual(state);
    expect(game.key("right", state)).toEqual(state);
    expect(game.key("up", state)).toEqual(state);
    game.key("space", state); // pause OFF (cleanup)
  });

  it("일시정지 해제 후 tick은 새 state를 반환한다", () => {
    const state = game.init(10, 10);
    game.key("space", state); // pause ON
    game.key("space", state); // pause OFF
    const nextState = game.tick(state);
    expect(nextState).not.toBe(state); // 새 객체 반환
  });
});
