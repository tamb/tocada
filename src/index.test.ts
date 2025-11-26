import { describe, it, expect } from "bun:test";
import Tocada, { useTouchEvents, DEFAULT_THRESHOLDS } from "./index";

describe("useTouchEvents", () => {
  it("should return Tocada instance", () => {
    expect(useTouchEvents("body")).toBeInstanceOf(Tocada);
  });
});

describe("Tocada", () => {
  it("accepts query string as first argument", () => {
    const touchEvents = new Tocada("body");
    expect(touchEvents.element).toBeInstanceOf(HTMLElement);
  });

  it("accepts HTMLElement as first argument", () => {
    const touchEvents = new Tocada(document.querySelector("body") as HTMLElement);
    expect(touchEvents.element).toBeInstanceOf(HTMLElement);
  });

  it("accepts custom thresholds", () => {
    const customThresholds = {
      swipeThreshold: 100,
      tapMaxTime: 150,
      doubleTapGap: 400,
      pressMinTime: 250,
      holdMinTime: 600,
      circularSwipeMinArc: 120,
      palmMinTouches: 4,
      palmLineTolerance: 60,
      rotateMinAngle: 20,
    };

    const tocada = new Tocada("body", { thresholds: customThresholds });
    expect(tocada.element).toBeInstanceOf(HTMLElement);
    // Thresholds are private, but the instance should be created successfully
  });

  it("accepts event prefix", () => {
    const tocada = new Tocada("body", { eventPrefix: "myapp-" });
    expect(tocada.element).toBeInstanceOf(HTMLElement);
  });

  it("provides destroy method", () => {
    const tocada = new Tocada("body");
    expect(typeof tocada.destroy).toBe("function");
    // Should not throw
    tocada.destroy();
  });

  it("handles non-existent element gracefully", () => {
    const consoleSpy = console.error;
    let errorCalled = false;
    console.error = () => {
      errorCalled = true;
    };

    const tocada = new Tocada("#non-existent-element");
    expect(tocada.element).toBeNull();
    expect(errorCalled).toBe(true);

    console.error = consoleSpy;
  });
});

describe("DEFAULT_THRESHOLDS", () => {
  it("exports default threshold values", () => {
    expect(DEFAULT_THRESHOLDS).toBeDefined();
    expect(DEFAULT_THRESHOLDS.swipeThreshold).toBe(50);
    expect(DEFAULT_THRESHOLDS.tapMaxTime).toBe(200);
    expect(DEFAULT_THRESHOLDS.doubleTapGap).toBe(300);
    expect(DEFAULT_THRESHOLDS.pressMinTime).toBe(200);
    expect(DEFAULT_THRESHOLDS.holdMinTime).toBe(500);
    expect(DEFAULT_THRESHOLDS.circularSwipeMinArc).toBe(90);
    expect(DEFAULT_THRESHOLDS.palmMinTouches).toBe(3);
    expect(DEFAULT_THRESHOLDS.palmLineTolerance).toBe(50);
    expect(DEFAULT_THRESHOLDS.rotateMinAngle).toBe(15);
  });
});
