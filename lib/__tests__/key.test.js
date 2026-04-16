const game = require("../index.js");

describe("key 함수", () => {
  it("유효하지 않은 키는 state를 그대로 반환한다", () => {
    const state = game.init(10, 10);
    expect(game.key("unknown", state)).toBe(state);
    expect(game.key("enter", state)).toBe(state);
    expect(game.key("a", state)).toBe(state);
  });

  it("left 키는 shuttle을 왼쪽으로 이동시킨다", () => {
    const state = game.init(15, 15);
    const nextState = game.key("left", state);
    // 이동 전/후 shuttlePanel이 달라야 한다
    expect(nextState.shuttlePanel).not.toEqual(state.shuttlePanel);
  });

  it("right 키는 shuttle을 오른쪽으로 이동시킨다", () => {
    const state = game.init(15, 15);
    const nextState = game.key("right", state);
    expect(nextState.shuttlePanel).not.toEqual(state.shuttlePanel);
  });

  it("up 키는 missile을 발사한다", () => {
    const state = game.init(15, 15);
    const nextState = game.key("up", state);
    expect(nextState.missilePanel).not.toEqual(state.missilePanel);
  });

  it("left/right/up 키는 bgPanel과 meteoritePanel을 변경하지 않는다", () => {
    const state = game.init(15, 15);
    ["left", "right", "up"].forEach(k => {
      const nextState = game.key(k, state);
      expect(nextState.bgPanel).toEqual(state.bgPanel);
      expect(nextState.meteoritePanel).toEqual(state.meteoritePanel);
    });
  });
});
