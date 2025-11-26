import { describe, it, expect } from "bun:test";
import {
  getAngleBetweenTouches,
  calculateRotationDelta,
  classifyRotation,
  getCenterPoint,
  detectRotation,
} from "./rotate";

describe("getAngleBetweenTouches", () => {
  it("should return 0 for horizontal line (touch2 to the right)", () => {
    const angle = getAngleBetweenTouches({ x: 0, y: 50 }, { x: 100, y: 50 });
    expect(angle).toBe(0);
  });

  it("should return 180 for horizontal line (touch2 to the left)", () => {
    const angle = getAngleBetweenTouches({ x: 100, y: 50 }, { x: 0, y: 50 });
    expect(Math.abs(angle)).toBe(180);
  });

  it("should return 90 for vertical line (touch2 below)", () => {
    const angle = getAngleBetweenTouches({ x: 50, y: 0 }, { x: 50, y: 100 });
    expect(angle).toBe(90);
  });

  it("should return -90 for vertical line (touch2 above)", () => {
    const angle = getAngleBetweenTouches({ x: 50, y: 100 }, { x: 50, y: 0 });
    expect(angle).toBe(-90);
  });

  it("should handle diagonal lines", () => {
    const angle = getAngleBetweenTouches({ x: 0, y: 0 }, { x: 100, y: 100 });
    expect(angle).toBe(45);
  });
});

describe("calculateRotationDelta", () => {
  it("should return difference for simple cases", () => {
    expect(calculateRotationDelta(0, 45)).toBe(45);
    expect(calculateRotationDelta(45, 90)).toBe(45);
    expect(calculateRotationDelta(90, 45)).toBe(-45);
  });

  it("should handle wrapping around 180", () => {
    // From 170 to -170 is a 20 degree clockwise rotation
    expect(calculateRotationDelta(170, -170)).toBe(20);
    // From -170 to 170 is a 20 degree counter-clockwise rotation
    expect(calculateRotationDelta(-170, 170)).toBe(-20);
  });

  it("should handle full circle wrapping", () => {
    expect(calculateRotationDelta(0, 180)).toBe(180);
    expect(calculateRotationDelta(0, -180)).toBe(-180);
  });

  it("should return 0 for same angle", () => {
    expect(calculateRotationDelta(45, 45)).toBe(0);
    expect(calculateRotationDelta(-90, -90)).toBe(0);
  });
});

describe("classifyRotation", () => {
  it("should return null for rotation below threshold", () => {
    expect(classifyRotation(10, 15)).toBeNull();
    expect(classifyRotation(-10, 15)).toBeNull();
    expect(classifyRotation(0, 15)).toBeNull();
  });

  it("should return clockwise for positive delta above threshold", () => {
    expect(classifyRotation(20, 15)).toBe("clockwise");
    expect(classifyRotation(90, 15)).toBe("clockwise");
  });

  it("should return counterclockwise for negative delta above threshold", () => {
    expect(classifyRotation(-20, 15)).toBe("counterclockwise");
    expect(classifyRotation(-90, 15)).toBe("counterclockwise");
  });

  it("should use default threshold when not provided", () => {
    // Default is 15 degrees
    expect(classifyRotation(10)).toBeNull();
    expect(classifyRotation(20)).toBe("clockwise");
  });

  it("should handle exact threshold boundary", () => {
    expect(classifyRotation(15, 15)).toBeNull();
    expect(classifyRotation(16, 15)).toBe("clockwise");
  });
});

describe("getCenterPoint", () => {
  it("should return midpoint between two touches", () => {
    const center = getCenterPoint({ x: 0, y: 0 }, { x: 100, y: 100 });
    expect(center).toEqual({ x: 50, y: 50 });
  });

  it("should handle same point", () => {
    const center = getCenterPoint({ x: 50, y: 50 }, { x: 50, y: 50 });
    expect(center).toEqual({ x: 50, y: 50 });
  });

  it("should handle negative coordinates", () => {
    const center = getCenterPoint({ x: -100, y: -100 }, { x: 100, y: 100 });
    expect(center).toEqual({ x: 0, y: 0 });
  });
});

describe("detectRotation", () => {
  it("should detect clockwise rotation", () => {
    // Two fingers horizontal, then rotated 45 degrees clockwise
    const result = detectRotation(
      { x: 0, y: 50 },   // start touch1
      { x: 100, y: 50 }, // start touch2 (horizontal line, angle = 0)
      { x: 15, y: 15 },  // end touch1
      { x: 85, y: 85 },  // end touch2 (diagonal line, angle = 45)
      15
    );

    expect(result.direction).toBe("clockwise");
    expect(result.angle).toBeCloseTo(45, 0);
    expect(result.startAngle).toBe(0);
    expect(result.endAngle).toBeCloseTo(45, 0);
  });

  it("should detect counterclockwise rotation", () => {
    // Two fingers at 45 degrees, then rotated to horizontal (counterclockwise)
    const result = detectRotation(
      { x: 15, y: 15 },  // start touch1
      { x: 85, y: 85 },  // start touch2 (angle = 45)
      { x: 0, y: 50 },   // end touch1
      { x: 100, y: 50 }, // end touch2 (angle = 0)
      15
    );

    expect(result.direction).toBe("counterclockwise");
    expect(result.angle).toBeCloseTo(45, 0);
  });

  it("should return null direction for small rotation", () => {
    const result = detectRotation(
      { x: 0, y: 50 },
      { x: 100, y: 50 },
      { x: 0, y: 48 },  // Slight vertical change
      { x: 100, y: 52 },
      15
    );

    expect(result.direction).toBeNull();
  });

  it("should calculate center point correctly", () => {
    const result = detectRotation(
      { x: 0, y: 0 },
      { x: 100, y: 100 },
      { x: 20, y: 20 },
      { x: 80, y: 80 },
      15
    );

    expect(result.centerPoint).toEqual({ x: 50, y: 50 });
  });
});

