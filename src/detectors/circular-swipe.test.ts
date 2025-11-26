import { describe, it, expect } from "bun:test";
import {
  calculateAngleBetweenPoints,
  normalizeAngleDelta,
  calculateCumulativeArc,
  detectCircularDirection,
  getCircularSwipeInfo,
} from "./circular-swipe";
import { ITouchPoint } from "../types";

describe("calculateAngleBetweenPoints", () => {
  it("should return 0 for point directly to the right", () => {
    expect(calculateAngleBetweenPoints({ x: 0, y: 0 }, { x: 10, y: 0 })).toBe(0);
  });

  it("should return 90 for point directly below (screen coords)", () => {
    expect(calculateAngleBetweenPoints({ x: 0, y: 0 }, { x: 0, y: 10 })).toBe(90);
  });

  it("should return -90 for point directly above (screen coords)", () => {
    expect(calculateAngleBetweenPoints({ x: 0, y: 0 }, { x: 0, y: -10 })).toBe(-90);
  });

  it("should return 180 or -180 for point directly to the left", () => {
    const angle = calculateAngleBetweenPoints({ x: 0, y: 0 }, { x: -10, y: 0 });
    expect(Math.abs(angle)).toBe(180);
  });

  it("should handle diagonal directions", () => {
    const angle = calculateAngleBetweenPoints({ x: 0, y: 0 }, { x: 10, y: 10 });
    expect(angle).toBe(45);
  });
});

describe("normalizeAngleDelta", () => {
  it("should keep angles within [-180, 180]", () => {
    expect(normalizeAngleDelta(0)).toBe(0);
    expect(normalizeAngleDelta(90)).toBe(90);
    expect(normalizeAngleDelta(-90)).toBe(-90);
  });

  it("should wrap angles greater than 180", () => {
    expect(normalizeAngleDelta(270)).toBe(-90);
    expect(normalizeAngleDelta(360)).toBe(0);
    expect(normalizeAngleDelta(450)).toBe(90);
  });

  it("should wrap angles less than -180", () => {
    expect(normalizeAngleDelta(-270)).toBe(90);
    expect(normalizeAngleDelta(-360)).toBe(0);
    expect(normalizeAngleDelta(-450)).toBe(-90);
  });
});

describe("calculateCumulativeArc", () => {
  it("should return 0 for less than 3 points", () => {
    expect(calculateCumulativeArc([])).toEqual({ totalArc: 0, netArc: 0 });
    expect(calculateCumulativeArc([{ x: 0, y: 0, time: 0 }])).toEqual({
      totalArc: 0,
      netArc: 0,
    });
    expect(
      calculateCumulativeArc([
        { x: 0, y: 0, time: 0 },
        { x: 10, y: 0, time: 100 },
      ])
    ).toEqual({ totalArc: 0, netArc: 0 });
  });

  it("should calculate arc for clockwise motion (on screen)", () => {
    // Create a clockwise quarter circle on screen (right -> down -> left)
    const clockwisePath: ITouchPoint[] = [
      { x: 100, y: 50, time: 0 }, // right of center
      { x: 90, y: 90, time: 50 }, // moving down-left
      { x: 50, y: 100, time: 100 }, // bottom of center
      { x: 10, y: 90, time: 150 }, // moving left-up
    ];
    const result = calculateCumulativeArc(clockwisePath);
    expect(result.totalArc).toBeGreaterThan(45);
    expect(result.netArc).toBeGreaterThan(0); // positive = clockwise on screen
  });

  it("should calculate arc for counter-clockwise motion (on screen)", () => {
    // Create a counter-clockwise quarter circle on screen (right -> up -> left)
    const counterClockwisePath: ITouchPoint[] = [
      { x: 100, y: 50, time: 0 }, // right of center
      { x: 90, y: 10, time: 50 }, // moving up-left
      { x: 50, y: 0, time: 100 }, // top of center
      { x: 10, y: 10, time: 150 }, // moving left-down
    ];
    const result = calculateCumulativeArc(counterClockwisePath);
    expect(result.totalArc).toBeGreaterThan(45);
    expect(result.netArc).toBeLessThan(0); // negative = counter-clockwise on screen
  });
});

describe("detectCircularDirection", () => {
  it("should return null for straight line motion", () => {
    const straightPath: ITouchPoint[] = [
      { x: 0, y: 50, time: 0 },
      { x: 25, y: 50, time: 50 },
      { x: 50, y: 50, time: 100 },
      { x: 75, y: 50, time: 150 },
      { x: 100, y: 50, time: 200 },
    ];
    expect(detectCircularDirection(straightPath)).toBeNull();
  });

  it("should return null for too few points", () => {
    expect(detectCircularDirection([])).toBeNull();
    expect(detectCircularDirection([{ x: 0, y: 0, time: 0 }])).toBeNull();
  });

  it("should detect clockwise motion", () => {
    // Large clockwise arc around center (50, 50)
    const clockwisePath: ITouchPoint[] = [];
    const centerX = 50;
    const centerY = 50;
    const radius = 40;

    // Generate points going clockwise (in screen coords: right -> down -> left -> up)
    for (let i = 0; i <= 12; i++) {
      const angle = (i / 12) * Math.PI; // 0 to PI (half circle)
      clockwisePath.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        time: i * 50,
      });
    }

    expect(detectCircularDirection(clockwisePath, 90)).toBe("clockwise");
  });

  it("should detect counter-clockwise motion", () => {
    // Large counter-clockwise arc around center (50, 50)
    const counterClockwisePath: ITouchPoint[] = [];
    const centerX = 50;
    const centerY = 50;
    const radius = 40;

    // Generate points going counter-clockwise (in screen coords: right -> up -> left -> down)
    for (let i = 0; i <= 12; i++) {
      const angle = -(i / 12) * Math.PI; // 0 to -PI (half circle upward)
      counterClockwisePath.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        time: i * 50,
      });
    }

    expect(detectCircularDirection(counterClockwisePath, 90)).toBe("counterclockwise");
  });

  it("should return null if arc is below minimum threshold", () => {
    // Small arc that doesn't meet 90 degree minimum
    const smallArcPath: ITouchPoint[] = [];
    const centerX = 50;
    const centerY = 50;
    const radius = 40;

    for (let i = 0; i <= 4; i++) {
      const angle = (i / 20) * Math.PI; // Only ~36 degrees
      smallArcPath.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        time: i * 50,
      });
    }

    expect(detectCircularDirection(smallArcPath, 90)).toBeNull();
  });

  it("should respect custom minArc threshold", () => {
    const smallArcPath: ITouchPoint[] = [];
    const centerX = 50;
    const centerY = 50;
    const radius = 40;

    for (let i = 0; i <= 6; i++) {
      const angle = (i / 12) * Math.PI; // ~90 degrees
      smallArcPath.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        time: i * 50,
      });
    }

    expect(detectCircularDirection(smallArcPath, 45)).toBe("clockwise");
    expect(detectCircularDirection(smallArcPath, 180)).toBeNull();
  });
});

describe("getCircularSwipeInfo", () => {
  it("should return arc and direction info", () => {
    const clockwisePath: ITouchPoint[] = [];
    const centerX = 50;
    const centerY = 50;
    const radius = 40;

    for (let i = 0; i <= 12; i++) {
      const angle = (i / 12) * Math.PI;
      clockwisePath.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        time: i * 50,
      });
    }

    const info = getCircularSwipeInfo(clockwisePath);
    expect(info.direction).toBe("clockwise");
    expect(info.arc).toBeGreaterThan(90);
  });
});

