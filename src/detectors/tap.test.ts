import { describe, it, expect } from "bun:test";
import { classifyTapGesture, isDoubleTap, isTapMovementValid } from "./tap";

describe("classifyTapGesture", () => {
  it("should return 'tap' for duration less than tapMaxTime", () => {
    expect(classifyTapGesture(50)).toBe("tap");
    expect(classifyTapGesture(100)).toBe("tap");
    expect(classifyTapGesture(199)).toBe("tap");
  });

  it("should return 'press' for duration between pressMinTime and holdMinTime", () => {
    expect(classifyTapGesture(200)).toBe("press");
    expect(classifyTapGesture(300)).toBe("press");
    expect(classifyTapGesture(499)).toBe("press");
  });

  it("should return 'hold' for duration >= holdMinTime", () => {
    expect(classifyTapGesture(500)).toBe("hold");
    expect(classifyTapGesture(1000)).toBe("hold");
    expect(classifyTapGesture(5000)).toBe("hold");
  });

  it("should use custom thresholds when provided", () => {
    const customThresholds = {
      tapMaxTime: 100,
      pressMinTime: 100,
      holdMinTime: 300,
    };

    expect(classifyTapGesture(50, customThresholds)).toBe("tap");
    expect(classifyTapGesture(99, customThresholds)).toBe("tap");
    expect(classifyTapGesture(100, customThresholds)).toBe("press");
    expect(classifyTapGesture(200, customThresholds)).toBe("press");
    expect(classifyTapGesture(300, customThresholds)).toBe("hold");
  });

  it("should handle edge cases at threshold boundaries", () => {
    // At exactly tapMaxTime (200), it should be press (not tap)
    expect(classifyTapGesture(200)).toBe("press");
    // At exactly holdMinTime (500), it should be hold
    expect(classifyTapGesture(500)).toBe("hold");
  });
});

describe("isDoubleTap", () => {
  it("should return false if lastTapTime is 0", () => {
    expect(isDoubleTap(1000, 0)).toBe(false);
  });

  it("should return true if gap is within doubleTapGap", () => {
    expect(isDoubleTap(1200, 1000, 300)).toBe(true);
    expect(isDoubleTap(1100, 1000, 300)).toBe(true);
    expect(isDoubleTap(1300, 1000, 300)).toBe(true);
  });

  it("should return false if gap exceeds doubleTapGap", () => {
    expect(isDoubleTap(1400, 1000, 300)).toBe(false);
    expect(isDoubleTap(2000, 1000, 300)).toBe(false);
  });

  it("should return false if currentTapTime is before lastTapTime", () => {
    expect(isDoubleTap(900, 1000, 300)).toBe(false);
  });

  it("should use default doubleTapGap when not provided", () => {
    // Default is 300ms
    expect(isDoubleTap(1200, 1000)).toBe(true);
    expect(isDoubleTap(1400, 1000)).toBe(false);
  });
});

describe("isTapMovementValid", () => {
  it("should return true if movement is within threshold", () => {
    expect(isTapMovementValid(100, 100, 105, 105)).toBe(true);
    expect(isTapMovementValid(100, 100, 100, 100)).toBe(true);
    expect(isTapMovementValid(100, 100, 107, 107)).toBe(true);
  });

  it("should return false if movement exceeds threshold", () => {
    expect(isTapMovementValid(100, 100, 120, 120)).toBe(false);
    expect(isTapMovementValid(100, 100, 100, 130)).toBe(false);
  });

  it("should use custom threshold when provided", () => {
    expect(isTapMovementValid(100, 100, 120, 100, 25)).toBe(true);
    expect(isTapMovementValid(100, 100, 130, 100, 25)).toBe(false);
  });

  it("should calculate diagonal distance correctly", () => {
    // Distance of (6, 8) from (0, 0) is 10
    expect(isTapMovementValid(0, 0, 6, 8, 10)).toBe(true);
    expect(isTapMovementValid(0, 0, 6, 8, 9)).toBe(false);
  });
});

