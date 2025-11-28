import { describe, it, expect } from "bun:test";
import {
  areTouchesInLine,
  perpendicularDistance,
  isPalmSwipePattern,
  getAveragePosition,
  getPalmSwipeDirection,
  getPalmSwipeMetrics,
} from "./palm-swipe";
import { ICoords } from "../types";

describe.skip("perpendicularDistance", () => {
  it("should return 0 for point on the line", () => {
    const lineStart = { x: 0, y: 0 };
    const lineEnd = { x: 100, y: 0 };
    const pointOnLine = { x: 50, y: 0 };

    expect(perpendicularDistance(pointOnLine, lineStart, lineEnd)).toBe(0);
  });

  it("should return correct distance for point off the line", () => {
    const lineStart = { x: 0, y: 0 };
    const lineEnd = { x: 100, y: 0 };
    const pointOffLine = { x: 50, y: 30 };

    expect(perpendicularDistance(pointOffLine, lineStart, lineEnd)).toBe(30);
  });

  it("should handle vertical lines", () => {
    const lineStart = { x: 50, y: 0 };
    const lineEnd = { x: 50, y: 100 };
    const point = { x: 80, y: 50 };

    expect(perpendicularDistance(point, lineStart, lineEnd)).toBe(30);
  });

  it("should handle same start and end point", () => {
    const samePoint = { x: 50, y: 50 };
    const testPoint = { x: 53, y: 54 };

    const distance = perpendicularDistance(testPoint, samePoint, samePoint);
    expect(distance).toBe(5); // Distance to the point itself
  });
});

describe.skip("areTouchesInLine", () => {
  it("should return true for single point", () => {
    expect(areTouchesInLine([{ x: 50, y: 50 }])).toBe(true);
  });

  it("should return true for two points", () => {
    expect(areTouchesInLine([{ x: 0, y: 0 }, { x: 100, y: 100 }])).toBe(true);
  });

  it("should return true for points forming a horizontal line", () => {
    const horizontalLine: ICoords[] = [
      { x: 0, y: 50 },
      { x: 50, y: 50 },
      { x: 100, y: 50 },
      { x: 150, y: 50 },
    ];
    expect(areTouchesInLine(horizontalLine)).toBe(true);
  });

  it("should return true for points forming a vertical line", () => {
    const verticalLine: ICoords[] = [
      { x: 50, y: 0 },
      { x: 50, y: 50 },
      { x: 50, y: 100 },
      { x: 50, y: 150 },
    ];
    expect(areTouchesInLine(verticalLine)).toBe(true);
  });

  it("should return true for points with small deviation within tolerance", () => {
    const nearlyLine: ICoords[] = [
      { x: 0, y: 50 },
      { x: 50, y: 55 }, // 5px off
      { x: 100, y: 48 }, // 2px off
      { x: 150, y: 52 }, // 2px off
    ];
    expect(areTouchesInLine(nearlyLine, 50)).toBe(true);
  });

  it("should return false for points with deviation exceeding tolerance", () => {
    const notALine: ICoords[] = [
      { x: 0, y: 50 },
      { x: 50, y: 150 }, // 100px off
      { x: 100, y: 50 },
    ];
    expect(areTouchesInLine(notALine, 50)).toBe(false);
  });

  it("should return false for clustered points (not a line)", () => {
    const clustered: ICoords[] = [
      { x: 50, y: 50 },
      { x: 52, y: 52 },
      { x: 48, y: 51 },
    ];
    expect(areTouchesInLine(clustered)).toBe(false);
  });
});

describe.skip("isPalmSwipePattern", () => {
  it("should return false if touch count is below minimum", () => {
    const touches = [{ x: 0, y: 50 }, { x: 50, y: 50 }];
    expect(isPalmSwipePattern(2, touches, 3)).toBe(false);
  });

  it("should return true for valid palm swipe pattern", () => {
    const touches = [
      { x: 0, y: 50 },
      { x: 50, y: 50 },
      { x: 100, y: 50 },
      { x: 150, y: 50 },
    ];
    expect(isPalmSwipePattern(4, touches, 3)).toBe(true);
  });

  it("should return false for non-linear touches", () => {
    const notLinear = [
      { x: 0, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];
    expect(isPalmSwipePattern(3, notLinear, 3, 20)).toBe(false);
  });
});

describe.skip("getAveragePosition", () => {
  it("should return {0,0} for empty array", () => {
    expect(getAveragePosition([])).toEqual({ x: 0, y: 0 });
  });

  it("should return the same point for single point", () => {
    expect(getAveragePosition([{ x: 50, y: 100 }])).toEqual({ x: 50, y: 100 });
  });

  it("should calculate average of multiple points", () => {
    const points = [
      { x: 0, y: 0 },
      { x: 100, y: 100 },
    ];
    expect(getAveragePosition(points)).toEqual({ x: 50, y: 50 });
  });

  it("should handle multiple points", () => {
    const points = [
      { x: 0, y: 0 },
      { x: 50, y: 50 },
      { x: 100, y: 100 },
    ];
    expect(getAveragePosition(points)).toEqual({ x: 50, y: 50 });
  });
});

describe.skip("getPalmSwipeDirection", () => {
  it("should return null for empty positions", () => {
    expect(getPalmSwipeDirection([], [])).toBeNull();
    expect(getPalmSwipeDirection([{ x: 0, y: 0 }], [])).toBeNull();
  });

  it("should detect swipe right", () => {
    const start = [{ x: 0, y: 50 }, { x: 0, y: 100 }, { x: 0, y: 150 }];
    const end = [{ x: 200, y: 50 }, { x: 200, y: 100 }, { x: 200, y: 150 }];
    expect(getPalmSwipeDirection(start, end)).toBe("right");
  });

  it("should detect swipe left", () => {
    const start = [{ x: 200, y: 50 }, { x: 200, y: 100 }, { x: 200, y: 150 }];
    const end = [{ x: 0, y: 50 }, { x: 0, y: 100 }, { x: 0, y: 150 }];
    expect(getPalmSwipeDirection(start, end)).toBe("left");
  });

  it("should detect swipe down", () => {
    const start = [{ x: 50, y: 0 }, { x: 100, y: 0 }, { x: 150, y: 0 }];
    const end = [{ x: 50, y: 200 }, { x: 100, y: 200 }, { x: 150, y: 200 }];
    expect(getPalmSwipeDirection(start, end)).toBe("down");
  });

  it("should detect swipe up", () => {
    const start = [{ x: 50, y: 200 }, { x: 100, y: 200 }, { x: 150, y: 200 }];
    const end = [{ x: 50, y: 0 }, { x: 100, y: 0 }, { x: 150, y: 0 }];
    expect(getPalmSwipeDirection(start, end)).toBe("up");
  });
});

describe.skip("getPalmSwipeMetrics", () => {
  it("should calculate distance correctly", () => {
    const start = [{ x: 0, y: 0 }];
    const end = [{ x: 30, y: 40 }]; // 3-4-5 triangle
    const { distance } = getPalmSwipeMetrics(start, end, 100);
    expect(distance).toBe(50);
  });

  it("should calculate velocity correctly", () => {
    const start = [{ x: 0, y: 0 }];
    const end = [{ x: 100, y: 0 }];
    const { velocity } = getPalmSwipeMetrics(start, end, 100);
    expect(velocity).toBe(1); // 100px / 100ms = 1px/ms
  });

  it("should handle zero duration", () => {
    const start = [{ x: 0, y: 0 }];
    const end = [{ x: 100, y: 0 }];
    const { velocity } = getPalmSwipeMetrics(start, end, 0);
    expect(velocity).toBe(0);
  });
});

