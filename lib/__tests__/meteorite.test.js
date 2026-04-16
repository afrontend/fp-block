const game = require("../index.js");

describe("makeMeteoriteShape", () => {
  it("정확히 7개의 셀을 반환한다", () => {
    const shape = game.makeMeteoriteShape();
    expect(shape).toHaveLength(7);
  });

  it("모든 셀은 3x3 범위(row/column 0~2) 안에 있다", () => {
    const shape = game.makeMeteoriteShape();
    shape.forEach(cell => {
      expect(cell.row).toBeGreaterThanOrEqual(0);
      expect(cell.row).toBeLessThanOrEqual(2);
      expect(cell.column).toBeGreaterThanOrEqual(0);
      expect(cell.column).toBeLessThanOrEqual(2);
    });
  });

  it("반복 호출 시 다른 배열을 반환한다 (무작위성 검증)", () => {
    const results = new Set(
      Array.from({ length: 10 }, () =>
        JSON.stringify(game.makeMeteoriteShape())
      )
    );
    // 10번 중 적어도 2가지 이상의 다른 결과가 나와야 한다
    expect(results.size).toBeGreaterThan(1);
  });

  it("각 셀은 row와 column 속성을 가진다", () => {
    const shape = game.makeMeteoriteShape();
    shape.forEach(cell => {
      expect(cell).toHaveProperty("row");
      expect(cell).toHaveProperty("column");
    });
  });
});
