const { runGameContract } = require("fp-panel/testing");
const game = require("../index.js");

// 공통 API(초기화·크기 보정·일시정지·렌더링·스냅숏)는 fp-panel 계약으로 검사한다.
runGameContract(game, { name: "fp-block" });

describe("fp-block 고유 API", () => {
  it("미사일 발사 대기시간을 상태에서 관리한다", () => {
    let state = game.init({ rows: 15, columns: 15, missileCooldownTicks: 3 });
    state = game.key("up", state);
    expect(state.missileCooldown).toBe(3);
    expect(game.key("up", state)).toBe(state);
    state = game.tick(game.tick(game.tick(state)));
    expect(state.missileCooldown).toBe(0);
  });

  it("렌더링 레이어 4개와 isBlankItem, tick 주기를 제공한다", () => {
    const state = game.init();
    expect(game.toArray(state)).toHaveLength(4);
    expect(game.isBlankItem(state.bgPanel[0][0])).toBe(true);
    expect(game.getTickInterval(state)).toBe(150);
  });
});
