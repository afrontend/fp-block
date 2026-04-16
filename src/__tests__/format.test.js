const { format } = require("../format.js");
const game = require("../../lib/index.js");

describe("format", () => {
  it("문자열을 반환한다", () => {
    const state = game.init(5, 5);
    const result = format(game.join(state));
    expect(typeof result).toBe("string");
  });

  it("rows 수만큼 줄로 나뉜다 (|\\r\\n 구분자)", () => {
    const state = game.init(5, 5);
    const result = format(game.join(state));
    expect(result.split("|\r\n")).toHaveLength(5);
  });

  it("각 줄은 columns 수만큼의 항목을 공백으로 이어 붙인 형태이다", () => {
    const state = game.init(5, 5);
    const result = format(game.join(state));
    const lines = result.split("|\r\n");
    lines.forEach(line => {
      // 5열이면 항목 사이 공백 4개 → split(' ')의 길이는 5 이상
      expect(line.split(" ").length).toBeGreaterThanOrEqual(5);
    });
  });
});
