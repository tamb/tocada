import { describe, it, expect } from "bun:test";
import {
  difference,
  getSwipeDirection,
  analyzeSwipe,
  getSwipeGestureType,
  buildSwipeEventDetails,
} from "./swipe";

describe("difference", () => {
  it("should return absolute difference", () => {
    expect(difference(10, 5)).toBe(5);
    expect(difference(5, 10)).toBe(5);
    expect(difference(-5, 5)).toBe(10);
    expect(difference(5, 5)).toBe(0);
  });
});

describe("getSwipeDirection", () => {
  it("should detect swipe right", () => {
    expect(getSwipeDirection(0, 50, 100, 50)).toBe("right");
    expect(getSwipeDirection(0, 50, 100, 60)).toBe("right"); // slight vertical
  });

  it("should detect swipe left", () => {
    expect(getSwipeDirection(100, 50, 0, 50)).toBe("left");
    expect(getSwipeDirection(100, 50, 0, 40)).toBe("left"); // slight vertical
  });

  it("should detect swipe down", () => {
    expect(getSwipeDirection(50, 0, 50, 100)).toBe("down");
    expect(getSwipeDirection(50, 0, 60, 100)).toBe("down"); // slight horizontal
  });

  it("should detect swipe up", () => {
    expect(getSwipeDirection(50, 100, 50, 0)).toBe("up");
    expect(getSwipeDirection(50, 100, 40, 0)).toBe("up"); // slight horizontal
  });

  it("should prefer vertical when equal movement", () => {
    // When deltaX === deltaY, we default to vertical (down or up)
    expect(getSwipeDirection(0, 0, 50, 50)).toBe("down");
    expect(getSwipeDirection(50, 50, 0, 0)).toBe("up");
  });
});

describe("analyzeSwipe", () => {
  it("should return isSwipe false when below threshold", () => {
    const result = analyzeSwipe({ x: 0, y: 0 }, { x: 10, y: 10 }, 100, 50);
    expect(result.isSwipe).toBe(false);
    expect(result.direction).toBeNull();
    expect(result.velocity).toBe(0);
  });

  it("should return isSwipe true when above threshold", () => {
    const result = analyzeSwipe({ x: 0, y: 0 }, { x: 100, y: 0 }, 100, 50);
    expect(result.isSwipe).toBe(true);
    expect(result.direction).toBe("right");
    expect(result.distance).toBe(100);
  });

  it("should calculate velocity correctly", () => {
    const result = analyzeSwipe({ x: 0, y: 0 }, { x: 100, y: 0 }, 200, 50);
    expect(result.velocity).toBe(0.5); // 100px / 200ms
    expect(result.velocityX).toBe(0.5);
    expect(result.velocityY).toBe(0);
  });

  it("should handle zero duration", () => {
    const result = analyzeSwipe({ x: 0, y: 0 }, { x: 100, y: 0 }, 0, 50);
    expect(result.velocity).toBe(0);
  });

  it("should calculate diagonal distance correctly", () => {
    const result = analyzeSwipe({ x: 0, y: 0 }, { x: 30, y: 40 }, 100, 10);
    expect(result.distance).toBe(50); // 3-4-5 triangle
  });

  it("should use default threshold when not provided", () => {
    // Default threshold is 50
    const belowResult = analyzeSwipe({ x: 0, y: 0 }, { x: 40, y: 0 }, 100);
    expect(belowResult.isSwipe).toBe(false);

    const aboveResult = analyzeSwipe({ x: 0, y: 0 }, { x: 60, y: 0 }, 100);
    expect(aboveResult.isSwipe).toBe(true);
  });
});

describe("getSwipeGestureType", () => {
  it("should return correct gesture type strings", () => {
    expect(getSwipeGestureType("up")).toBe("swipeup");
    expect(getSwipeGestureType("down")).toBe("swipedown");
    expect(getSwipeGestureType("left")).toBe("swipeleft");
    expect(getSwipeGestureType("right")).toBe("swiperight");
  });
});

describe("buildSwipeEventDetails", () => {
  it("should build complete event details object", () => {
    const details = buildSwipeEventDetails(
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      1000,
      1200,
      0.5,
      0.3,
      null,
      null,
      []
    );

    expect(details.distance).toBe(100);
    expect(details.distanceX).toBe(100);
    expect(details.distanceY).toBe(0);
    expect(details.velocity).toBe(0.5); // 100px / 200ms
    expect(details.velocityX).toBe(0.5);
    expect(details.velocityY).toBe(0);
    expect(details.avgPressure).toBe(0.4); // (0.5 + 0.3) / 2
    expect(details.startPressure).toBe(0.5);
    expect(details.endPressure).toBe(0.3);
    expect(details.startTime).toBe(1000);
    expect(details.endTime).toBe(1200);
    expect(details.startingCoords).toEqual({ x: 0, y: 0 });
    expect(details.endingCoords).toEqual({ x: 100, y: 0 });
  });
});

