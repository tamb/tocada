import { describe, it, expect } from "bun:test";
import {
  getDistanceBetweenPoints,
  getCenterBetweenPoints,
  analyzePinchSpread,
  classifyPinchSpread,
  buildPinchSpreadEventDetails,
} from "./pinch-spread";

describe("getDistanceBetweenPoints", () => {
  it("should return 0 for same point", () => {
    expect(getDistanceBetweenPoints({ x: 50, y: 50 }, { x: 50, y: 50 })).toBe(0);
  });

  it("should calculate horizontal distance", () => {
    expect(getDistanceBetweenPoints({ x: 0, y: 50 }, { x: 100, y: 50 })).toBe(100);
  });

  it("should calculate vertical distance", () => {
    expect(getDistanceBetweenPoints({ x: 50, y: 0 }, { x: 50, y: 100 })).toBe(100);
  });

  it("should calculate diagonal distance", () => {
    // 3-4-5 triangle
    expect(getDistanceBetweenPoints({ x: 0, y: 0 }, { x: 30, y: 40 })).toBe(50);
  });
});

describe("getCenterBetweenPoints", () => {
  it("should return same point when both are identical", () => {
    expect(getCenterBetweenPoints({ x: 50, y: 50 }, { x: 50, y: 50 })).toEqual({
      x: 50,
      y: 50,
    });
  });

  it("should calculate horizontal center", () => {
    expect(getCenterBetweenPoints({ x: 0, y: 50 }, { x: 100, y: 50 })).toEqual({
      x: 50,
      y: 50,
    });
  });

  it("should calculate diagonal center", () => {
    expect(getCenterBetweenPoints({ x: 0, y: 0 }, { x: 100, y: 100 })).toEqual({
      x: 50,
      y: 50,
    });
  });
});

describe("analyzePinchSpread", () => {
  it("should detect pinch when distance decreases", () => {
    const result = analyzePinchSpread(100, 50);
    expect(result.gesture).toBe("pinch");
    expect(result.startDistance).toBe(100);
    expect(result.endDistance).toBe(50);
    expect(result.distanceChange).toBe(-50);
    expect(result.scale).toBe(0.5);
  });

  it("should detect spread when distance increases", () => {
    const result = analyzePinchSpread(50, 100);
    expect(result.gesture).toBe("spread");
    expect(result.startDistance).toBe(50);
    expect(result.endDistance).toBe(100);
    expect(result.distanceChange).toBe(50);
    expect(result.scale).toBe(2);
  });

  it("should return null when no change", () => {
    const result = analyzePinchSpread(100, 100);
    expect(result.gesture).toBeNull();
    expect(result.distanceChange).toBe(0);
    expect(result.scale).toBe(1);
  });

  it("should respect minDistanceChange threshold", () => {
    // Small change below threshold
    const smallChange = analyzePinchSpread(100, 95, 10);
    expect(smallChange.gesture).toBeNull();

    // Change above threshold
    const bigChange = analyzePinchSpread(100, 80, 10);
    expect(bigChange.gesture).toBe("pinch");
  });

  it("should handle zero start distance", () => {
    const result = analyzePinchSpread(0, 100);
    expect(result.scale).toBe(1); // Avoid division by zero
  });
});

describe("classifyPinchSpread", () => {
  it("should return pinch for decreasing distance", () => {
    expect(classifyPinchSpread(100, 50)).toBe("pinch");
    expect(classifyPinchSpread(200, 199)).toBe("pinch");
  });

  it("should return spread for increasing distance", () => {
    expect(classifyPinchSpread(50, 100)).toBe("spread");
    expect(classifyPinchSpread(199, 200)).toBe("spread");
  });

  it("should return null for no change", () => {
    expect(classifyPinchSpread(100, 100)).toBeNull();
  });
});

describe("buildPinchSpreadEventDetails", () => {
  it("should build complete event details for pinch", () => {
    const details = buildPinchSpreadEventDetails(
      { x: 0, y: 50 },   // start touch 1
      { x: 100, y: 50 }, // start touch 2 (distance = 100)
      { x: 25, y: 50 },  // end touch 1
      { x: 75, y: 50 }   // end touch 2 (distance = 50)
    );

    expect(details.gesture).toBe("pinch");
    expect(details.startDistance).toBe(100);
    expect(details.endDistance).toBe(50);
    expect(details.distanceChange).toBe(-50);
    expect(details.scale).toBe(0.5);
    expect(details.centerPoint).toEqual({ x: 50, y: 50 });
  });

  it("should build complete event details for spread", () => {
    const details = buildPinchSpreadEventDetails(
      { x: 25, y: 50 },  // start touch 1
      { x: 75, y: 50 },  // start touch 2 (distance = 50)
      { x: 0, y: 50 },   // end touch 1
      { x: 100, y: 50 }  // end touch 2 (distance = 100)
    );

    expect(details.gesture).toBe("spread");
    expect(details.startDistance).toBe(50);
    expect(details.endDistance).toBe(100);
    expect(details.distanceChange).toBe(50);
    expect(details.scale).toBe(2);
    expect(details.centerPoint).toEqual({ x: 50, y: 50 });
  });
});

