const game = require("../index.js");

describe("addMissile - 원본 객체 변이 없음", () => {
  it("up 키 입력 후 shuttlePanel의 zeroPoint 셀이 변이되지 않는다", () => {
    const state = game.init(10, 10);

    const zeroPointsBefore = state.shuttlePanel
      .flat()
      .filter(item => item.zeroPoint)
      .map(item => ({ ...item })); // 깊은 복사로 before 상태 보존

    game.key("up", state);

    const zeroPointsAfter = state.shuttlePanel
      .flat()
      .filter(item => item.zeroPoint);

    expect(zeroPointsAfter).toEqual(zeroPointsBefore);
  });

  it("up 키를 여러 번 눌러도 shuttlePanel은 변이되지 않는다", () => {
    const state = game.init(10, 10);

    const shuttlePanelSnapshot = JSON.parse(
      JSON.stringify(state.shuttlePanel)
    );

    game.key("up", state);
    game.key("up", state);
    game.key("up", state);

    expect(state.shuttlePanel).toEqual(shuttlePanelSnapshot);
  });
});
