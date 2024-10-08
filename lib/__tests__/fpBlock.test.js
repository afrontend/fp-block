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
            { color: "pink", zeroPoint: true, row: 0, column: 1 },
            { color: "grey" },
            { color: "grey" }
          ],
          [
            { color: "grey" },
            { color: "pink", zeroPoint: true, row: 1, column: 0 },
            { color: "pink", zeroPoint: true, row: 1, column: 1 },
            { color: "pink", zeroPoint: true, row: 1, column: 2 },
            { color: "grey" }
          ]
        ],
        "should return shuttlePanel"
      );
    });
    it("init return missilePanel", () => {
      const { missilePanel } = game.init(5, 5);
      assert.deepEqual(
        missilePanel,
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
        "should return missilePanel"
      );
    });
  });
});
