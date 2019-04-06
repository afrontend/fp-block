const assert = require("assert");
const p = require("../panel.js");

describe("panel", () => {
  it("createPanel should return 2 dim array ", () => {
    assert(p.createPanel().length === 0, "createPanel return zero size array");
    assert(p.createPanel(1, 1).length === 1, "createPanel return 1 size array");
    assert(
      p.createPanel(1, 100).length === 1,
      "createPanel return 1 size array"
    );
    assert(
      p.createPanel(1, 1)[0].length === 1,
      "createPanel return 1 size array"
    );
    assert(
      p.createPanel(100, 1)[0].length === 1,
      "createPanel return 1 size array"
    );
    assert(
      p.createPanel(17, 100).length === 17,
      "createPanel return 1 size array"
    );
    assert(
      p.createPanel(100, 18)[0].length === 18,
      "createPanel return 1 size array"
    );
  });
});
