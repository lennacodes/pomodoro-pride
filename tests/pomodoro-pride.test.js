const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  relativeLuminance,
  buildGradient,
  buildStripes,
  formatDuration,
  heatLevel,
  hexToRgba,
} = require("./helpers");

// ── relativeLuminance ──────────────────────────────────────────────────

describe("relativeLuminance", () => {
  it("returns 0 for pure black", () => {
    assert.equal(relativeLuminance("#000000"), 0);
  });

  it("returns 1 for pure white", () => {
    assert.ok(Math.abs(relativeLuminance("#ffffff") - 1) < 0.001);
  });

  it("returns ~0.2126 for pure red", () => {
    const lum = relativeLuminance("#ff0000");
    assert.ok(Math.abs(lum - 0.2126) < 0.001);
  });

  it("returns ~0.7152 for pure green", () => {
    const lum = relativeLuminance("#00ff00");
    assert.ok(Math.abs(lum - 0.7152) < 0.001);
  });

  it("returns ~0.0722 for pure blue", () => {
    const lum = relativeLuminance("#0000ff");
    assert.ok(Math.abs(lum - 0.0722) < 0.001);
  });

  it("dark colors have low luminance", () => {
    assert.ok(relativeLuminance("#1a1a1a") < 0.05);
    assert.ok(relativeLuminance("#333333") < 0.1);
  });

  it("light colors have high luminance", () => {
    assert.ok(relativeLuminance("#eeeeee") > 0.8);
    assert.ok(relativeLuminance("#f5a9b8") > 0.3); // trans pink
  });
});

// ── buildGradient ──────────────────────────────────────────────────────

describe("buildGradient", () => {
  it("builds a gradient with two colors", () => {
    const result = buildGradient(["#ff0000", "#0000ff"], 180);
    assert.equal(result, "linear-gradient(180deg, #ff0000 0.0%, #0000ff 100.0%)");
  });

  it("builds a gradient with three colors", () => {
    const result = buildGradient(["#ff0000", "#00ff00", "#0000ff"], 90);
    assert.ok(result.startsWith("linear-gradient(90deg,"));
    assert.ok(result.includes("#00ff00 50.0%"));
  });

  it("includes the specified angle", () => {
    const result = buildGradient(["#fff", "#000"], 45);
    assert.ok(result.startsWith("linear-gradient(45deg,"));
  });
});

// ── buildStripes ───────────────────────────────────────────────────────

describe("buildStripes", () => {
  it("builds equal-width stripes for a 3-color flag", () => {
    const flag = { colors: ["#ff0000", "#ffffff", "#0000ff"] };
    const result = buildStripes(flag, 180);
    // Each stripe should be 33.33% wide with hard edges
    assert.ok(result.includes("#ff0000 0.00%"));
    assert.ok(result.includes("#ff0000 33.33%"));
    assert.ok(result.includes("#ffffff 33.33%"));
    assert.ok(result.includes("#ffffff 66.67%"));
    assert.ok(result.includes("#0000ff 66.67%"));
    assert.ok(result.includes("#0000ff 100.00%"));
  });

  it("uses custom stops when provided", () => {
    const flag = {
      colors: ["#d60270", "#9b4f96", "#0038a8"],
      stops: [
        { color: "#d60270", start: 0, end: 40 },
        { color: "#9b4f96", start: 40, end: 60 },
        { color: "#0038a8", start: 60, end: 100 },
      ]
    };
    const result = buildStripes(flag, 180);
    assert.ok(result.includes("#d60270 0%"));
    assert.ok(result.includes("#d60270 40%"));
    assert.ok(result.includes("#9b4f96 40%"));
    assert.ok(result.includes("#9b4f96 60%"));
    assert.ok(result.includes("#0038a8 60%"));
    assert.ok(result.includes("#0038a8 100%"));
  });

  it("includes the specified angle", () => {
    const flag = { colors: ["#000", "#fff"] };
    const result = buildStripes(flag, 90);
    assert.ok(result.startsWith("linear-gradient(90deg,"));
  });
});

// ── formatDuration ─────────────────────────────────────────────────────

describe("formatDuration", () => {
  it("formats zero seconds", () => {
    assert.equal(formatDuration(0), "0m");
  });

  it("formats minutes only", () => {
    assert.equal(formatDuration(300), "5m");
    assert.equal(formatDuration(1500), "25m");
  });

  it("formats hours only", () => {
    assert.equal(formatDuration(3600), "1h");
    assert.equal(formatDuration(7200), "2h");
  });

  it("formats hours and minutes", () => {
    assert.equal(formatDuration(5400), "1h 30m");
    assert.equal(formatDuration(9000), "2h 30m");
  });

  it("rounds minutes", () => {
    assert.equal(formatDuration(3629), "1h"); // 1h + 29s, mins rounds to 0
    assert.equal(formatDuration(3660), "1h 1m");
    assert.equal(formatDuration(29), "0m"); // 29 seconds rounds to 0 minutes
  });
});

// ── heatLevel ──────────────────────────────────────────────────────────

describe("heatLevel", () => {
  it("returns 0 for no sessions", () => {
    assert.equal(heatLevel(0), 0);
  });

  it("returns 1 for 1-2 sessions", () => {
    assert.equal(heatLevel(1), 1);
    assert.equal(heatLevel(2), 1);
  });

  it("returns 2 for 3-4 sessions", () => {
    assert.equal(heatLevel(3), 2);
    assert.equal(heatLevel(4), 2);
  });

  it("returns 3 for 5-6 sessions", () => {
    assert.equal(heatLevel(5), 3);
    assert.equal(heatLevel(6), 3);
  });

  it("returns 4 for 7+ sessions", () => {
    assert.equal(heatLevel(7), 4);
    assert.equal(heatLevel(100), 4);
  });
});

// ── hexToRgba ──────────────────────────────────────────────────────────

describe("hexToRgba", () => {
  it("converts 6-char hex to rgba", () => {
    assert.equal(hexToRgba("#ff0000", 0.5), "rgba(255, 0, 0, 0.5)");
  });

  it("converts 3-char hex to rgba", () => {
    assert.equal(hexToRgba("#f00", 0.5), "rgba(255, 0, 0, 0.5)");
  });

  it("handles hex without # prefix", () => {
    assert.equal(hexToRgba("00ff00", 1), "rgba(0, 255, 0, 1)");
  });

  it("passes through alpha value", () => {
    assert.equal(hexToRgba("#000000", 0), "rgba(0, 0, 0, 0)");
    assert.equal(hexToRgba("#000000", 0.22), "rgba(0, 0, 0, 0.22)");
    assert.equal(hexToRgba("#000000", 1), "rgba(0, 0, 0, 1)");
  });

  it("converts white correctly", () => {
    assert.equal(hexToRgba("#ffffff", 0.8), "rgba(255, 255, 255, 0.8)");
  });
});
