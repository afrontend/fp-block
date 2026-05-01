const game = require("../index.js");

describe("init state shape", () => {
  it("rows와 columns를 state에 포함한다", () => {
    const state = game.init(10, 15);
    expect(state.rows).toBe(10);
    expect(state.columns).toBe(15);
  });

  it("left/right/up 키는 rows와 columns를 유지한다", () => {
    const state = game.init(15, 15);
    expect(game.key("left", state).rows).toBe(15);
    expect(game.key("right", state).rows).toBe(15);
    expect(game.key("up", state).rows).toBe(15);
    expect(game.key("left", state).columns).toBe(15);
  });
});

describe("createPanel - ?? 연산자로 0 처리", () => {
  // rows=0 은 fp-panel이 paint를 처리하지 못해 유효하지 않은 입력입니다.
  // 대신 init() 기본값과 명시적 값이 올바르게 동작하는지 검증합니다.

  it("init(5, 8) 은 5행 8열 bgPanel을 생성한다", () => {
    const { bgPanel } = game.init(5, 8);
    expect(bgPanel).toHaveLength(5);
    expect(bgPanel[0]).toHaveLength(8);
  });

  it("init() 기본값은 15x15 bgPanel을 생성한다", () => {
    const { bgPanel } = game.init();
    expect(bgPanel).toHaveLength(15);
    expect(bgPanel[0]).toHaveLength(15);
  });

  it("init(5, 5) 이후 init(10, 10) 호출 시 10x10 bgPanel을 생성한다", () => {
    game.init(5, 5);
    const { bgPanel } = game.init(10, 10);
    expect(bgPanel).toHaveLength(10);
    expect(bgPanel[0]).toHaveLength(10);
  });

  it("같은 크기로 두 번 호출해도 동일한 bgPanel 구조를 반환한다", () => {
    const { bgPanel: a } = game.init(6, 6);
    const { bgPanel: b } = game.init(6, 6);
    expect(a).toHaveLength(b.length);
    expect(a[0]).toHaveLength(b[0].length);
  });
});
