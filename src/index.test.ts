import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import Tocada, { useTouchEvents, usePointerEvents, DEFAULT_THRESHOLDS } from "./index";

describe("useTouchEvents", () => {
  it("returns Tocada instance wired to TouchEvent pipeline only", () => {
    expect(useTouchEvents("body")).toBeInstanceOf(Tocada);
  });

  it("forwards touchAction option", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const t = useTouchEvents(el, { touchAction: false });
    expect(el.style.touchAction).toBe("");
    t.destroy();
    document.body.removeChild(el);
  });
});

describe("usePointerEvents", () => {
  it("returns Tocada instance", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const t = usePointerEvents(el);
    expect(t).toBeInstanceOf(Tocada);
    t.destroy();
    document.body.removeChild(el);
  });

  it("forwards touchAction option", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const t = usePointerEvents(el, { touchAction: "pan-x" });
    expect(el.style.touchAction).toBe("pan-x");
    t.destroy();
    expect(el.style.touchAction).toBe("");
    document.body.removeChild(el);
  });
});

describe("Input pipeline selection", () => {
  function spyListenerTypes(el: HTMLElement) {
    const types: string[] = [];
    const orig = el.addEventListener.bind(el);
    el.addEventListener = (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ) => {
      types.push(type);
      return orig(type, listener, options as never);
    };
    return {
      types,
      restore: () => {
        el.addEventListener = orig;
      },
    };
  }

  it("registers pointer listeners when pointerEvents is omitted (default)", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const { types, restore } = spyListenerTypes(el);
    const t = new Tocada(el);
    restore();
    expect(types).toEqual(["pointerdown", "pointermove", "pointerup", "pointercancel"]);
    t.destroy();
    document.body.removeChild(el);
  });

  it("useTouchEvents registers touch listeners only", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const { types, restore } = spyListenerTypes(el);
    const t = useTouchEvents(el);
    restore();
    expect(types).toEqual(["touchstart", "touchmove", "touchend"]);
    t.destroy();
    document.body.removeChild(el);
  });

  it("pointerEvents: false matches useTouchEvents listener set", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const { types, restore } = spyListenerTypes(el);
    const t = new Tocada(el, { pointerEvents: false });
    restore();
    expect(types).toEqual(["touchstart", "touchmove", "touchend"]);
    t.destroy();
    document.body.removeChild(el);
  });
});

describe("touchAction", () => {
  it("defaults to inline touch-action none", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    expect(el.style.touchAction).toBe("");
    const t = new Tocada(el);
    expect(el.style.touchAction).toBe("none");
    t.destroy();
    expect(el.style.touchAction).toBe("");
    document.body.removeChild(el);
  });

  it("restore prior inline touch-action on destroy", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    el.style.touchAction = "pan-y";
    const t = new Tocada(el);
    expect(el.style.touchAction).toBe("none");
    t.destroy();
    expect(el.style.touchAction).toBe("pan-y");
    document.body.removeChild(el);
  });

  it("touchAction: false does not change style", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const t = new Tocada(el, { touchAction: false });
    expect(el.style.touchAction).toBe("");
    t.destroy();
    expect(el.style.touchAction).toBe("");
    document.body.removeChild(el);
  });

  it("touchAction string sets that value", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const t = new Tocada(el, { touchAction: "manipulation" });
    expect(el.style.touchAction).toBe("manipulation");
    t.destroy();
    expect(el.style.touchAction).toBe("");
    document.body.removeChild(el);
  });
});

describe("Tocada", () => {
  it("accepts query string as first argument", () => {
    const instance = new Tocada("body");
    expect(instance.element).toBeInstanceOf(HTMLElement);
  });

  it("accepts HTMLElement as first argument", () => {
    const instance = new Tocada(document.querySelector("body") as HTMLElement);
    expect(instance.element).toBeInstanceOf(HTMLElement);
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

  it("destroy does not throw when element was not found", () => {
    const consoleSpy = console.error;
    console.error = () => {};
    const tocada = new Tocada("#non-existent-element");
    expect(() => tocada.destroy()).not.toThrow();
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
    expect(DEFAULT_THRESHOLDS.pinchSpreadMinDistance).toBe(20);
  });
});

// Helper function to create a mock Touch object
function createMockTouch(clientX: number, clientY: number, identifier: number = 0): Touch {
  return {
    clientX,
    clientY,
    identifier,
    force: 0,
    pageX: clientX,
    pageY: clientY,
    radiusX: 0,
    radiusY: 0,
    rotationAngle: 0,
    screenX: clientX,
    screenY: clientY,
    target: document.body,
  } as Touch;
}

// Helper function to create a mock TouchEvent
function createMockTouchEvent(
  type: "touchstart" | "touchmove" | "touchend",
  touches: Touch[],
  changedTouches: Touch[]
): TouchEvent {
  const event = new Event(type, { bubbles: true, cancelable: true }) as any;
  
  // Add TouchEvent-specific properties
  event.touches = touches as any;
  event.changedTouches = changedTouches as any;
  event.targetTouches = touches as any;
  event.preventDefault = () => {};
  event.stopPropagation = () => {};
  
  return event as TouchEvent;
}

function createMockPointerEvent(
  type: "pointerdown" | "pointermove" | "pointerup" | "pointercancel",
  pointerId: number,
  clientX: number,
  clientY: number,
  opts?: { buttons?: number; pointerType?: string }
): PointerEvent {
  const ev = new Event(type, { bubbles: true, cancelable: true }) as unknown as PointerEvent;
  Object.assign(ev as object, {
    pointerId,
    clientX,
    clientY,
    pageX: clientX,
    pageY: clientY,
    button: 0,
    buttons: opts?.buttons ?? 1,
    pointerType: opts?.pointerType ?? "touch",
    pressure: 0.5,
    preventDefault: () => {},
  });
  return ev;
}

describe("Pointer pipeline (default Tocada)", () => {
  it("fires generic gesture before rotate for two-pointer rotation", () => {
    const element = document.createElement("div");
    document.body.appendChild(element);
    const tocada = new Tocada(element);

    const events: string[] = [];
    element.addEventListener("gesture", () => events.push("gesture"));
    element.addEventListener("rotate", () => events.push("rotate"));
    element.addEventListener("rotateclockwise", () => events.push("rotateclockwise"));

    element.dispatchEvent(createMockPointerEvent("pointerdown", 1, 100, 100));
    element.dispatchEvent(createMockPointerEvent("pointerdown", 2, 200, 100));

    element.dispatchEvent(createMockPointerEvent("pointermove", 1, 100, 150));
    element.dispatchEvent(createMockPointerEvent("pointermove", 2, 200, 50));

    element.dispatchEvent(createMockPointerEvent("pointerup", 1, 100, 150, { buttons: 1 }));
    element.dispatchEvent(createMockPointerEvent("pointerup", 2, 200, 50, { buttons: 0 }));

    expect(events[0]).toBe("gesture");
    expect(events).toContain("rotate");

    tocada.destroy();
    document.body.removeChild(element);
  });

  it("fires pinch when rotation is minimal (pointer)", () => {
    const element = document.createElement("div");
    document.body.appendChild(element);
    const tocada = new Tocada(element);

    const events: string[] = [];
    element.addEventListener("rotate", () => events.push("rotate"));
    element.addEventListener("pinch", () => events.push("pinch"));

    element.dispatchEvent(createMockPointerEvent("pointerdown", 1, 100, 100));
    element.dispatchEvent(createMockPointerEvent("pointerdown", 2, 200, 100));

    element.dispatchEvent(createMockPointerEvent("pointermove", 1, 120, 100));
    element.dispatchEvent(createMockPointerEvent("pointermove", 2, 180, 100));

    element.dispatchEvent(createMockPointerEvent("pointerup", 1, 120, 100, { buttons: 1 }));
    element.dispatchEvent(createMockPointerEvent("pointerup", 2, 180, 100, { buttons: 0 }));

    expect(events).toContain("pinch");
    expect(events).not.toContain("rotate");

    tocada.destroy();
    document.body.removeChild(element);
  });
});

describe("Gesture Event Priority (TouchEvent pipeline)", () => {
  let element: HTMLElement;
  let tocada: Tocada;

  beforeEach(() => {
    element = document.createElement("div");
    document.body.appendChild(element);
    tocada = new Tocada(element, { pointerEvents: false });
  });

  afterEach(() => {
    tocada.destroy();
    document.body.removeChild(element);
  });

  it("should fire generic 'gesture' event before specific gesture events", () => {
    const events: string[] = [];

    element.addEventListener("gesture", () => events.push("gesture"));
    element.addEventListener("rotate", () => events.push("rotate"));
    element.addEventListener("rotateclockwise", () => events.push("rotateclockwise"));

    // Simulate a two-finger rotation gesture
    const touch1Start = createMockTouch(100, 100, 0);
    const touch2Start = createMockTouch(200, 100, 1);
    const touchStartEvent = createMockTouchEvent("touchstart", [touch1Start, touch2Start], [touch1Start, touch2Start]);
    element.dispatchEvent(touchStartEvent);

    // Move touches to create rotation (rotate around center)
    const touch1Move = createMockTouch(100, 150, 0);
    const touch2Move = createMockTouch(200, 50, 1);
    const touchMoveEvent = createMockTouchEvent("touchmove", [touch1Move, touch2Move], [touch1Move, touch2Move]);
    element.dispatchEvent(touchMoveEvent);

    // End touches
    const touch1End = createMockTouch(100, 150, 0);
    const touch2End = createMockTouch(200, 50, 1);
    const touchEndEvent = createMockTouchEvent("touchend", [], [touch1End, touch2End]);
    element.dispatchEvent(touchEndEvent);

    // Generic gesture should fire first
    expect(events[0]).toBe("gesture");
  });

  it("should not fire pinch/spread events when rotation is significant", () => {
    const events: string[] = [];

    element.addEventListener("rotate", () => events.push("rotate"));
    element.addEventListener("pinch", () => events.push("pinch"));
    element.addEventListener("spread", () => events.push("spread"));

    // Simulate a two-finger rotation gesture (significant rotation)
    const touch1Start = createMockTouch(100, 100, 0);
    const touch2Start = createMockTouch(200, 100, 1);
    const touchStartEvent = createMockTouchEvent("touchstart", [touch1Start, touch2Start], [touch1Start, touch2Start]);
    element.dispatchEvent(touchStartEvent);

    // Move touches to create significant rotation (30+ degrees)
    // Rotate around center point (150, 100)
    const touch1Move = createMockTouch(120, 130, 0);
    const touch2Move = createMockTouch(180, 70, 1);
    const touchMoveEvent = createMockTouchEvent("touchmove", [touch1Move, touch2Move], [touch1Move, touch2Move]);
    element.dispatchEvent(touchMoveEvent);

    // End touches
    const touch1End = createMockTouch(120, 130, 0);
    const touch2End = createMockTouch(180, 70, 1);
    const touchEndEvent = createMockTouchEvent("touchend", [], [touch1End, touch2End]);
    element.dispatchEvent(touchEndEvent);

    // Should have rotate event but NOT pinch or spread
    expect(events).toContain("rotate");
    expect(events).not.toContain("pinch");
    expect(events).not.toContain("spread");
  });

  it("should fire pinch event when rotation is minimal and distance decreases", () => {
    const events: string[] = [];

    element.addEventListener("rotate", () => events.push("rotate"));
    element.addEventListener("pinch", () => events.push("pinch"));
    element.addEventListener("spread", () => events.push("spread"));

    // Simulate a pinch gesture (minimal rotation, significant distance change)
    const touch1Start = createMockTouch(100, 100, 0);
    const touch2Start = createMockTouch(200, 100, 1);
    const touchStartEvent = createMockTouchEvent("touchstart", [touch1Start, touch2Start], [touch1Start, touch2Start]);
    element.dispatchEvent(touchStartEvent);

    // Move touches closer together (pinch) with minimal rotation
    const touch1Move = createMockTouch(120, 100, 0);
    const touch2Move = createMockTouch(180, 100, 1);
    const touchMoveEvent = createMockTouchEvent("touchmove", [touch1Move, touch2Move], [touch1Move, touch2Move]);
    element.dispatchEvent(touchMoveEvent);

    // End touches
    const touch1End = createMockTouch(120, 100, 0);
    const touch2End = createMockTouch(180, 100, 1);
    const touchEndEvent = createMockTouchEvent("touchend", [], [touch1End, touch2End]);
    element.dispatchEvent(touchEndEvent);

    // Should have pinch event but NOT rotate (rotation is below threshold)
    expect(events).toContain("pinch");
    expect(events).not.toContain("rotate");
  });

  it("should fire spread event when rotation is minimal and distance increases", () => {
    const events: string[] = [];

    element.addEventListener("rotate", () => events.push("rotate"));
    element.addEventListener("pinch", () => events.push("pinch"));
    element.addEventListener("spread", () => events.push("spread"));

    // Simulate a spread gesture (minimal rotation, significant distance change)
    const touch1Start = createMockTouch(100, 100, 0);
    const touch2Start = createMockTouch(200, 100, 1);
    const touchStartEvent = createMockTouchEvent("touchstart", [touch1Start, touch2Start], [touch1Start, touch2Start]);
    element.dispatchEvent(touchStartEvent);

    // Move touches further apart (spread) with minimal rotation
    const touch1Move = createMockTouch(80, 100, 0);
    const touch2Move = createMockTouch(220, 100, 1);
    const touchMoveEvent = createMockTouchEvent("touchmove", [touch1Move, touch2Move], [touch1Move, touch2Move]);
    element.dispatchEvent(touchMoveEvent);

    // End touches
    const touch1End = createMockTouch(80, 100, 0);
    const touch2End = createMockTouch(220, 100, 1);
    const touchEndEvent = createMockTouchEvent("touchend", [], [touch1End, touch2End]);
    element.dispatchEvent(touchEndEvent);

    // Should have spread event but NOT rotate (rotation is below threshold)
    expect(events).toContain("spread");
    expect(events).not.toContain("rotate");
  });

  it("should respect configurable rotateMinAngle threshold", () => {
    const events: string[] = [];

    // Create Tocada with higher rotation threshold
    const customTocada = new Tocada(element, {
      pointerEvents: false,
      thresholds: {
        rotateMinAngle: 45, // Higher threshold
      },
    });

    element.addEventListener("rotate", () => events.push("rotate"));
    element.addEventListener("pinch", () => events.push("pinch"));

    // Simulate a gesture with small rotation (well below 45 degree threshold)
    // Start with touches horizontally aligned
    const touch1Start = createMockTouch(100, 100, 0);
    const touch2Start = createMockTouch(200, 100, 1);
    const touchStartEvent = createMockTouchEvent("touchstart", [touch1Start, touch2Start], [touch1Start, touch2Start]);
    element.dispatchEvent(touchStartEvent);

    // Move touches with very small rotation (approximately 10-15 degrees)
    // Rotate slightly around the center point (150, 100)
    const touch1Move = createMockTouch(105, 110, 0);
    const touch2Move = createMockTouch(195, 90, 1);
    const touchMoveEvent = createMockTouchEvent("touchmove", [touch1Move, touch2Move], [touch1Move, touch2Move]);
    element.dispatchEvent(touchMoveEvent);

    // End touches
    const touch1End = createMockTouch(105, 110, 0);
    const touch2End = createMockTouch(195, 90, 1);
    const touchEndEvent = createMockTouchEvent("touchend", [], [touch1End, touch2End]);
    element.dispatchEvent(touchEndEvent);

    // With higher threshold, moderate rotation should NOT trigger rotate
    // (but might trigger pinch if distance changed enough)
    expect(events).not.toContain("rotate");

    customTocada.destroy();
  });

  it("should respect configurable pinchSpreadMinDistance threshold", () => {
    const events: string[] = [];

    // Create Tocada with higher pinch/spread threshold
    const customTocada = new Tocada(element, {
      pointerEvents: false,
      thresholds: {
        pinchSpreadMinDistance: 50, // Higher threshold
      },
    });

    element.addEventListener("pinch", () => events.push("pinch"));
    element.addEventListener("spread", () => events.push("spread"));

    // Simulate a gesture with small distance change (below threshold)
    const touch1Start = createMockTouch(100, 100, 0);
    const touch2Start = createMockTouch(200, 100, 1);
    const touchStartEvent = createMockTouchEvent("touchstart", [touch1Start, touch2Start], [touch1Start, touch2Start]);
    element.dispatchEvent(touchStartEvent);

    // Move touches slightly closer (small distance change - 10px)
    const touch1Move = createMockTouch(105, 100, 0);
    const touch2Move = createMockTouch(195, 100, 1);
    const touchMoveEvent = createMockTouchEvent("touchmove", [touch1Move, touch2Move], [touch1Move, touch2Move]);
    element.dispatchEvent(touchMoveEvent);

    // End touches
    const touch1End = createMockTouch(105, 100, 0);
    const touch2End = createMockTouch(195, 100, 1);
    const touchEndEvent = createMockTouchEvent("touchend", [], [touch1End, touch2End]);
    element.dispatchEvent(touchEndEvent);

    // With higher threshold, small distance change should NOT trigger pinch
    expect(events).not.toContain("pinch");
    expect(events).not.toContain("spread");

    customTocada.destroy();
  });
});
