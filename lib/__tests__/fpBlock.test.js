const assert = require("assert");
const game = require("../index.js");

describe("fpBlock", () => {
  describe("init", () => {
    it("init return bgPanel", () => {
      const { bgPanel } = game.init(5, 5);
      assert.deepEqual(
        bgPanel,
        [
          [
            { color: "grey" },
            { color: "grey" },
            { color: "grey" },
            { color: "grey" },
            { color: "grey" }
          ],
          [
            { color: "grey" },
            { color: "grey" },
            { color: "grey" },
            { color: "grey" },
            { color: "grey" }
          ],
          [
            { color: "grey" },
            { color: "grey" },
            { color: "grey" },
            { color: "grey" },
            { color: "grey" }
          ],
          [
            { color: "grey" },
            { color: "grey" },
            { color: "grey" },
            { color: "grey" },
            { color: "grey" }
          ],
          [
            { color: "grey" },
            { color: "grey" },
            { color: "grey" },
            { color: "grey" },
            { color: "grey" }
          ]
        ],
        "should return bgPanel"
      );
    });
    it("init return shuttlePanel", () => {
      const { shuttlePanel } = game.init(5, 5);
      assert.deepEqual(
        shuttlePanel,
        [
          [
            { color: "grey" },
            { color: "grey" },
            { color: "grey" },
            { color: "grey" },
            { color: "grey" }
          ],
          [
            { color: "grey" },
            { color: "grey" },
            { color: "grey" },
            { color: "grey" },
            { color: "grey" }
          ],
          [
            { color: "grey" },
            { color: "grey" },
            { color: "grey" },
            { color: "grey" },
            { color: "grey" }
          ],
          [
            { color: "grey" },
            { color: "grey" },
            { color: "pink", zeroPoint: true },
            { color: "grey" },
            { color: "grey" }
          ],
          [
            { color: "grey" },
            { color: "pink", zeroPoint: true },
            { color: "pink", zeroPoint: true },
            { color: "pink", zeroPoint: true },
            { color: "grey" }
          ]
        ],
        "should return shuttlePanel"
      );
    });
  });
});
