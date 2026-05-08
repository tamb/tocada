import { describe, it, expect } from "bun:test";
import { difference, getDistanceBetweenTouchPoints, getDistanceBetweenCoords } from "./utils";

describe("difference", () => {
  it("should return difference", () => {
    expect(difference(1, 2)).toBe(1);
  });
});

describe("getDistanceBetweenCoords", () => {
  it("is 0 for identical points", () => {
    expect(getDistanceBetweenCoords({ x: 3, y: 4 }, { x: 3, y: 4 })).toBe(0);
  });

  it("uses Euclidean distance", () => {
    expect(getDistanceBetweenCoords({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });
});

describe("getDistanceBetweenTouchPoints", () => {
  it("should return hypot distance if nothing moves", () => {
    expect(
      getDistanceBetweenTouchPoints(
        { clientX: 0, clientY: 0 } as any,
        { clientX: 0, clientY: 0 } as any
      )
    ).toBe(0);
  });

  it("should return hypot distance", () => {
    expect(
      getDistanceBetweenTouchPoints(
        { clientX: 1, clientY: 1 } as any,
        { clientX: 2, clientY: 2 } as any
      )
    ).toBe(1.4142135623730951);
  });
});
