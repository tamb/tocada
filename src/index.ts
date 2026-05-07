import {
  ITocadaOptions,
  TGestureType,
  ISwipeEventDetails,
  ITapEventDetails,
  IRotateEventDetails,
  IPalmSwipeEventDetails,
  ICircularSwipeEventDetails,
  IPinchSpreadEventDetails,
  IGestureEventDetails,
  ITouchPoint,
  ICoords,
  DEFAULT_THRESHOLDS,
} from "./types";
import { getDistanceBetweenCoords, getDistanceBetweenTouchPoints } from "./utils";
import { classifyTapGesture, isDoubleTap, isTapMovementValid } from "./detectors/tap";
import { detectCircularDirection, getCircularSwipeInfo } from "./detectors/circular-swipe";
// import {
//   isPalmSwipePattern,
//   getPalmSwipeDirection,
//   getPalmSwipeMetrics,
// } from "./detectors/palm-swipe";
import { detectRotation } from "./detectors/rotate";
import {
  analyzeSwipe,
  getSwipeGestureType,
  buildSwipeEventDetails,
} from "./detectors/swipe";
import {
  classifyPinchSpread,
  buildPinchSpreadEventDetails,
} from "./detectors/pinch-spread";

function readPointerPressure(e: PointerEvent): number {
  if (typeof e.pressure === "number" && e.pressure > 0) return e.pressure;
  if (e.pointerType === "mouse") return 0.5;
  return 0;
}

function coalescedPointerSlices(e: PointerEvent): PointerEvent[] {
  const getCoalesced = e.getCoalescedEvents;
  if (typeof getCoalesced === "function") {
    const list = getCoalesced.call(e) as PointerEvent[] | undefined;
    if (list && list.length > 0) return list;
  }
  return [e];
}

/** Same object must be used for add + remove (passive/capture must match or listeners leak). */
const POINTER_LISTENER_OPTIONS: AddEventListenerOptions = { passive: false };

export default class Tocada {
  element: HTMLElement | null;

  // detail object properties
  private endPressure: number = 0;
  private startingElement: HTMLElement | null = null;
  private startPressure: number = 0;
  private startTime: number = 0;
  private startX: number = 0;
  private startY: number = 0;
  private touchedElements: HTMLElement[] = [];
  private interpolatedTouchedElements: HTMLElement[] = [];
  private lastTouchPosition: ICoords | null = null;

  // local variables
  private activeTouches = 0;
  private gestureStartDistance: number = 0;
  private isMultiTouch = false;
  private latestGestureDistance: number = 0;
  private touchCount = 0;

  // Tap/press/hold detection
  private lastTapTime: number = 0;
  private lastTapX: number = 0;
  private lastTapY: number = 0;
  private holdTimer: ReturnType<typeof setTimeout> | null = null;
  private holdFired: boolean = false;

  // Circular swipe detection
  private touchPath: ITouchPoint[] = [];

  // Rotation and pinch/spread detection
  private gestureStartTouch1: ICoords | null = null;
  private gestureStartTouch2: ICoords | null = null;
  private latestTouch1: ICoords | null = null;
  private latestTouch2: ICoords | null = null;

  // Palm swipe detection
  private palmStartPositions: ICoords[] = [];
  private isPalmSwipe: boolean = false;

  // thresholds
  private thresholds!: Required<typeof DEFAULT_THRESHOLDS>;
  private eventPrefix: string = "";
  private useHighPrecision: boolean = false;
  private usePointerEvents: boolean = false;
  /** Active pointers when using the Pointer Events pipeline (key = pointerId). */
  private pointerById = new Map<number, { x: number; y: number; pressure: number }>();

  constructor(queryStringOrElement: string | HTMLElement, options: ITocadaOptions = {}) {
    this.element =
      typeof queryStringOrElement === "string"
        ? document.querySelector(queryStringOrElement)
        : queryStringOrElement;
    if (!this.element) {
      console.error("Element not found");
      return;
    }

    const {
      thresholds = {},
      eventPrefix = "",
      useHighPrecision = false,
      pointerEvents = true,
    } = options;
    this.thresholds = {
      ...DEFAULT_THRESHOLDS,
      ...thresholds,
    };
    this.eventPrefix = eventPrefix;
    this.useHighPrecision = useHighPrecision;
    this.usePointerEvents = pointerEvents;

    if (this.usePointerEvents) {
      this.element.addEventListener("pointerdown", this.handlePointerDown, POINTER_LISTENER_OPTIONS);
      this.element.addEventListener("pointermove", this.handlePointerMove, POINTER_LISTENER_OPTIONS);
      this.element.addEventListener("pointerup", this.handlePointerUp, POINTER_LISTENER_OPTIONS);
      this.element.addEventListener("pointercancel", this.handlePointerCancel, POINTER_LISTENER_OPTIONS);
    } else {
      this.element.addEventListener("touchstart", this.handleTouchStart, false);
      this.element.addEventListener("touchmove", this.handleTouchMove, false);
      this.element.addEventListener("touchend", this.handleTouchEnd, false);
    }
  }

  destroy = () => {
    if (this.usePointerEvents && this.element) {
      for (const id of [...this.pointerById.keys()]) {
        this.releasePointerCaptureSafe(id);
      }
      this.pointerById.clear();
      this.element.removeEventListener("pointerdown", this.handlePointerDown, POINTER_LISTENER_OPTIONS);
      this.element.removeEventListener("pointermove", this.handlePointerMove, POINTER_LISTENER_OPTIONS);
      this.element.removeEventListener("pointerup", this.handlePointerUp, POINTER_LISTENER_OPTIONS);
      this.element.removeEventListener("pointercancel", this.handlePointerCancel, POINTER_LISTENER_OPTIONS);
    } else {
      this.element?.removeEventListener("touchstart", this.handleTouchStart);
      this.element?.removeEventListener("touchmove", this.handleTouchMove);
      this.element?.removeEventListener("touchend", this.handleTouchEnd);
    }
    this.clearTimers();
  };

  private clearTimers = () => {
    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }
  };

  private beginSingleContactSession(clientX: number, clientY: number, pressure: number) {
    this.startX = clientX;
    this.startY = clientY;
    this.startTime = Date.now();
    this.startPressure = pressure;
    this.startingElement = document.elementsFromPoint(this.startX, this.startY)[0] as HTMLElement;
    this.holdFired = false;

    this.touchedElements.push(this.startingElement);
    this.touchPath = [{ x: this.startX, y: this.startY, time: this.startTime }];

    if (this.useHighPrecision) {
      this.lastTouchPosition = { x: this.startX, y: this.startY };
    }

    this.holdTimer = setTimeout(() => {
      this.holdFired = true;
      this.dispatchTapEvent("hold", {
        duration: this.thresholds.holdMinTime,
        pressure,
        element: this.startingElement,
        coords: { x: this.startX, y: this.startY },
        startTime: this.startTime,
        endTime: Date.now(),
      });
    }, this.thresholds.holdMinTime);
  }

  /** Single-contact move sampling (linear path, interpolation, circular-swipe path). */
  private sampleSingleContactAlongPath(clientX: number, clientY: number) {
    const x = clientX;
    const y = clientY;
    const element = document.elementFromPoint(x, y) as HTMLElement;
    if (element && this.element && this.element.contains(element) && element !== this.element) {
      this.touchedElements.push(element);
    }

    if (this.useHighPrecision && !this.isMultiTouch && this.lastTouchPosition) {
      const distance = Math.sqrt(
        Math.pow(x - this.lastTouchPosition.x, 2) + Math.pow(y - this.lastTouchPosition.y, 2)
      );
      const sampleInterval = Math.max(5, Math.min(10, distance / 10));
      const steps = Math.floor(distance / sampleInterval);

      for (let i = 1; i <= steps; i++) {
        const t = i / (steps + 1);
        const sampleX = this.lastTouchPosition.x + (x - this.lastTouchPosition.x) * t;
        const sampleY = this.lastTouchPosition.y + (y - this.lastTouchPosition.y) * t;
        const sampleElement = document.elementFromPoint(sampleX, sampleY) as HTMLElement;

        if (
          sampleElement &&
          this.element &&
          this.element.contains(sampleElement) &&
          sampleElement !== this.element
        ) {
          this.interpolatedTouchedElements.push(sampleElement);
        }
      }
    }

    if (this.useHighPrecision && !this.isMultiTouch) {
      this.lastTouchPosition = { x, y };
    }

    if (!this.isMultiTouch) {
      this.touchPath.push({
        x,
        y,
        time: Date.now(),
      });
    }
  }

  private handleTouchStart = (event: TouchEvent) => {
    // Use event.touches.length as the source of truth for current touch count
    this.activeTouches = event.touches.length;
    this.touchCount = event.touches.length;

    if (this.activeTouches > 1) {
      this.isMultiTouch = true;
      this.clearTimers(); // Cancel tap/hold detection for multi-touch

      // Check for palm swipe pattern
      const touches: ICoords[] = [];
      for (let i = 0; i < event.touches.length; i++) {
        touches.push({
          x: event.touches[i].clientX,
          y: event.touches[i].clientY,
        });
      }

      // TODO: Implement better palm swipe detection
      // this.isPalmSwipe = isPalmSwipePattern(
      //   event.touches.length,
      //   touches,
      //   this.thresholds.palmMinTouches,
      //   this.thresholds.palmLineTolerance
      // );

      if (this.isPalmSwipe) {
        this.palmStartPositions = touches;
      } else if (event.touches.length === 2) {
        // Two-finger gesture - track for rotation and pinch/spread
        this.gestureStartDistance = getDistanceBetweenTouchPoints(
          event.touches[0],
          event.touches[1]
        );
        this.gestureStartTouch1 = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
        this.gestureStartTouch2 = {
          x: event.touches[1].clientX,
          y: event.touches[1].clientY,
        };
        // Initialize latest positions to start positions (in case gesture ends without movement)
        this.latestTouch1 = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
        this.latestTouch2 = {
          x: event.touches[1].clientX,
          y: event.touches[1].clientY,
        };
      }

      this.handleGestureStart(event);
    } else {
      this.isMultiTouch = false;
      this.handleSwipeStart(event);
    }
  };

  private handleTouchMove = (event: TouchEvent) => {
    event.preventDefault();
    if (event.touches.length === 0) return;
    const x = event.touches[0].clientX;
    const y = event.touches[0].clientY;

    this.sampleSingleContactAlongPath(x, y);

    if (this.isMultiTouch) {
      this.handleGestureMove(event);
    }
  };

  private handleTouchEnd = (event: TouchEvent) => {
    // Use event.touches.length as the source of truth before processing
    const currentTouchCount = event.touches.length;
    
    if (this.activeTouches >= 2) {
      this.handleGestureEnd(event);
      this.touchCount = 0;
    } else if (this.activeTouches === 1) {
      this.handleSwipeEnd(event);
      this.touchCount = 0;
    }

    // Update activeTouches to match actual touch state after processing
    this.activeTouches = currentTouchCount;
  };

  private handleSwipeStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    this.beginSingleContactSession(touch.clientX, touch.clientY, touch.force || 0);
  };

  private finalizeSingleContactEnd(clientX: number, clientY: number, pressure: number) {
    if (!this.isMultiTouch && this.touchCount === 1) {
      const endTime = Date.now();
      const duration = endTime - this.startTime;
      const startCoords: ICoords = { x: this.startX, y: this.startY };
      const endCoords: ICoords = { x: clientX, y: clientY };

      // Check for tap/press/hold (low movement)
      const isTapValid = isTapMovementValid(this.startX, this.startY, clientX, clientY);

      if (isTapValid && !this.holdFired) {
        // Classify the tap gesture
        const tapType = classifyTapGesture(duration, this.thresholds);

        if (tapType === "tap") {
          // Check for double tap
          const isDouble = isDoubleTap(
            endTime,
            this.lastTapTime,
            this.thresholds.doubleTapGap
          );

          // Also check position proximity for double tap
          const tapPositionValid =
            this.lastTapTime === 0 ||
            isTapMovementValid(this.lastTapX, this.lastTapY, clientX, clientY, 30);

          const tapDetails: ITapEventDetails = {
            duration,
            pressure,
            element: this.startingElement,
            coords: endCoords,
            startTime: this.startTime,
            endTime,
          };

          this.dispatchTapEvent("tap", tapDetails);

          if (isDouble && tapPositionValid) {
            this.dispatchTapEvent("doubletap", tapDetails);
            this.lastTapTime = 0; // Reset to prevent triple-tap triggering double
          } else {
            this.lastTapTime = endTime;
            this.lastTapX = clientX;
            this.lastTapY = clientY;
          }
        } else if (tapType === "press") {
          this.dispatchTapEvent("press", {
            duration,
            pressure,
            element: this.startingElement,
            coords: endCoords,
            startTime: this.startTime,
            endTime,
          });
        }
        // hold is already fired by timer

        this.reset();
        return;
      }

      // Check for circular swipe
      if (this.touchPath.length >= 5) {
        const circularDirection = detectCircularDirection(
          this.touchPath,
          this.thresholds.circularSwipeMinArc
        );

        if (circularDirection) {
          const circularInfo = getCircularSwipeInfo(this.touchPath);
          const circularDetails: ICircularSwipeEventDetails = {
            direction: circularDirection,
            arc: circularInfo.arc,
            touchPath: this.touchPath,
            touchedElements: Array.from(new Set(this.touchedElements)),
          };

          // Add high precision fields if enabled
          if (this.useHighPrecision) {
            const touchedPathElements = this.getTouchedPathElements(this.touchPath);
            circularDetails.touchedPathElements = touchedPathElements;
            circularDetails.interpolatedTouchedElements = this.interpolatedTouchedElements;
            circularDetails.derivedTouchedElements = this.getDerivedTouchedElements(touchedPathElements);
          }

          if (circularDirection === "clockwise") {
            this.dispatchCircularSwipeEvent("swipeclockwise", circularDetails);
          } else {
            this.dispatchCircularSwipeEvent("swipecounterclockwise", circularDetails);
          }

          this.reset();
          return;
        }
      }

      // Check for linear swipe gesture using the swipe detector
      const swipeAnalysis = analyzeSwipe(
        startCoords,
        endCoords,
        duration,
        this.thresholds.swipeThreshold
      );

      if (swipeAnalysis.isSwipe && swipeAnalysis.direction) {
        this.endPressure = pressure;
        const endingElement = document.elementFromPoint(clientX, clientY) as HTMLElement;

        const detail = buildSwipeEventDetails(
          startCoords,
          endCoords,
          this.startTime,
          endTime,
          this.startPressure,
          this.endPressure,
          this.startingElement,
          endingElement,
          this.touchedElements
        );

        // Add high precision fields if enabled
        if (this.useHighPrecision) {
          const touchedPathElements = this.getTouchedPathElements(this.touchPath);
          detail.touchedPathElements = touchedPathElements;
          detail.interpolatedTouchedElements = this.interpolatedTouchedElements;
          detail.derivedTouchedElements = this.getDerivedTouchedElements(touchedPathElements);
        }

        // Fire generic swipe first
        this.dispatchSwipeEvent("swipe", detail);

        // Then fire directional variant
        const gestureType = getSwipeGestureType(swipeAnalysis.direction) as TGestureType;
        this.dispatchSwipeEvent(gestureType, detail);

        this.reset();
      }
    }
  }

  private handleSwipeEnd = (event: TouchEvent) => {
    this.clearTimers();
    const touch = event.changedTouches[0];
    this.finalizeSingleContactEnd(touch.clientX, touch.clientY, touch.force || 0);
  };

  private handleGestureStart = (_event?: TouchEvent) => {
    this.isMultiTouch = true;
  };

  private handleGestureMove = (event: TouchEvent) => {
    if (event.touches.length >= 2) {
      this.latestGestureDistance = getDistanceBetweenTouchPoints(
        event.touches[0],
        event.touches[1]
      );
      // Track latest positions for gesture end detection
      this.latestTouch1 = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
      this.latestTouch2 = {
        x: event.touches[1].clientX,
        y: event.touches[1].clientY,
      };
    }
  };

  private finalizeMultiContactGesture(endPositions: ICoords[]) {
    this.dispatchGestureEvent("gesture", {
      touchCount: this.touchCount,
    });

    let endTouch1: ICoords | null = null;
    let endTouch2: ICoords | null = null;

    if (this.latestTouch1 && this.latestTouch2) {
      endTouch1 = this.latestTouch1;
      endTouch2 = this.latestTouch2;
    } else if (endPositions.length >= 2) {
      endTouch1 = endPositions[0];
      endTouch2 = endPositions[1];
    }

    if (
      this.gestureStartTouch1 &&
      this.gestureStartTouch2 &&
      endTouch1 &&
      endTouch2
    ) {
      const rotationResult = detectRotation(
        this.gestureStartTouch1,
        this.gestureStartTouch2,
        endTouch1,
        endTouch2,
        this.thresholds.rotateMinAngle
      );

      if (rotationResult.direction) {
        const rotateDetails: IRotateEventDetails = {
          angle: rotationResult.angle,
          direction: rotationResult.direction,
          startAngle: rotationResult.startAngle,
          endAngle: rotationResult.endAngle,
          centerPoint: rotationResult.centerPoint,
        };

        this.dispatchRotateEvent("rotate", rotateDetails);

        if (rotationResult.direction === "clockwise") {
          this.dispatchRotateEvent("rotateclockwise", rotateDetails);
        } else {
          this.dispatchRotateEvent("rotatecounterclockwise", rotateDetails);
        }

        this.reset();
        return;
      }

      const pinchSpreadDetails = buildPinchSpreadEventDetails(
        this.gestureStartTouch1,
        this.gestureStartTouch2,
        endTouch1,
        endTouch2
      );

      const distanceChange = Math.abs(
        this.latestGestureDistance - this.gestureStartDistance
      );

      if (distanceChange >= this.thresholds.pinchSpreadMinDistance) {
        const pinchSpreadGesture = classifyPinchSpread(
          this.gestureStartDistance,
          this.latestGestureDistance
        );

        if (pinchSpreadGesture === "pinch") {
          this.dispatchPinchSpreadEvent("pinch", pinchSpreadDetails);
        } else if (pinchSpreadGesture === "spread") {
          this.dispatchPinchSpreadEvent("spread", pinchSpreadDetails);
        }
      }
    }

    this.reset();
  }

  private handleGestureEnd = (event: TouchEvent) => {
    const endPositions: ICoords[] = [];

    for (let i = 0; i < event.touches.length; i++) {
      endPositions.push({
        x: event.touches[i].clientX,
        y: event.touches[i].clientY,
      });
    }

    for (let i = 0; i < event.changedTouches.length; i++) {
      endPositions.push({
        x: event.changedTouches[i].clientX,
        y: event.changedTouches[i].clientY,
      });
    }

    // TODO: palm swipe — endPositions retained for future palm detector wiring

    this.finalizeMultiContactGesture(endPositions);
  };

  private getOrderedActivePointerCoordsPair(): [ICoords, ICoords] | null {
    if (this.pointerById.size < 2) return null;
    const ids = [...this.pointerById.keys()].sort((a, b) => a - b);
    const p0 = this.pointerById.get(ids[0])!;
    const p1 = this.pointerById.get(ids[1])!;
    return [
      { x: p0.x, y: p0.y },
      { x: p1.x, y: p1.y },
    ];
  }

  private syncPointerTwoFingerGeometryFromMap() {
    const pair = this.getOrderedActivePointerCoordsPair();
    if (!pair) return;
    this.latestGestureDistance = getDistanceBetweenCoords(pair[0], pair[1]);
    this.latestTouch1 = pair[0];
    this.latestTouch2 = pair[1];
  }

  private tryPointerCapture(e: PointerEvent) {
    try {
      this.element?.setPointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  }

  private releasePointerCaptureSafe(id: number) {
    try {
      this.element?.releasePointerCapture(id);
    } catch {
      /* noop */
    }
  }

  private handlePointerDown = (e: PointerEvent) => {
    if (!this.element) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const target = e.target;
    if (!(target instanceof Node) || !this.element.contains(target)) return;

    const pressure = readPointerPressure(e);
    this.pointerById.set(e.pointerId, { x: e.clientX, y: e.clientY, pressure });
    this.tryPointerCapture(e);

    this.activeTouches = this.pointerById.size;
    this.touchCount = this.pointerById.size;

    if (this.activeTouches > 1) {
      this.isMultiTouch = true;
      this.clearTimers();

      if (this.pointerById.size === 2) {
        const pair = this.getOrderedActivePointerCoordsPair();
        if (pair) {
          this.gestureStartDistance = getDistanceBetweenCoords(pair[0], pair[1]);
          this.gestureStartTouch1 = { ...pair[0] };
          this.gestureStartTouch2 = { ...pair[1] };
          this.latestTouch1 = { ...pair[0] };
          this.latestTouch2 = { ...pair[1] };
          this.latestGestureDistance = this.gestureStartDistance;
        }
      }
      this.handleGestureStart();
    } else {
      this.isMultiTouch = false;
      this.beginSingleContactSession(e.clientX, e.clientY, pressure);
    }
  };

  private handlePointerMove = (e: PointerEvent) => {
    if (!this.pointerById.has(e.pointerId)) return;
    if (e.pointerType === "mouse" && e.buttons === 0) return;

    e.preventDefault();

    if (this.pointerById.size >= 2) {
      const slices = coalescedPointerSlices(e);
      for (const pe of slices) {
        if (!this.pointerById.has(pe.pointerId)) continue;
        this.pointerById.set(pe.pointerId, {
          x: pe.clientX,
          y: pe.clientY,
          pressure: readPointerPressure(pe),
        });
      }
      this.syncPointerTwoFingerGeometryFromMap();
      return;
    }

    const slices = coalescedPointerSlices(e);
    for (const pe of slices) {
      if (pe.pointerId !== e.pointerId) continue;
      this.pointerById.set(pe.pointerId, {
        x: pe.clientX,
        y: pe.clientY,
        pressure: readPointerPressure(pe),
      });
      this.sampleSingleContactAlongPath(pe.clientX, pe.clientY);
    }
  };

  private handlePointerUpOrCancel = (e: PointerEvent) => {
    if (!this.pointerById.has(e.pointerId)) return;

    this.pointerById.set(e.pointerId, {
      x: e.clientX,
      y: e.clientY,
      pressure: readPointerPressure(e),
    });

    const contactsBeforeEnd = this.pointerById.size;

    if (contactsBeforeEnd >= 2) {
      this.syncPointerTwoFingerGeometryFromMap();
      this.finalizeMultiContactGesture([]);
      this.pointerById.delete(e.pointerId);
      this.touchCount = 0;
    } else if (contactsBeforeEnd === 1) {
      this.clearTimers();
      this.finalizeSingleContactEnd(e.clientX, e.clientY, readPointerPressure(e));
      this.pointerById.delete(e.pointerId);
      this.touchCount = 0;
    }

    this.activeTouches = this.pointerById.size;
    this.releasePointerCaptureSafe(e.pointerId);
  };

  private handlePointerUp = (e: PointerEvent) => {
    this.handlePointerUpOrCancel(e);
  };

  private handlePointerCancel = (e: PointerEvent) => {
    this.handlePointerUpOrCancel(e);
  };

  /**
   * Gets all unique elements touched along a touch path by sampling points.
   * Samples points from touchPath and finds elements at those coordinates.
   */
  private getTouchedPathElements(touchPath: ITouchPoint[]): HTMLElement[] {
    const elements = new Set<HTMLElement>();
    const touchArea = this.element;

    if (!touchArea || touchPath.length === 0) return [];

    // Sample points from the path - use every Nth point, or based on distance threshold ~5-10px
    const sampleInterval = Math.max(1, Math.floor(touchPath.length / 50)); // Sample up to 50 points

    for (let i = 0; i < touchPath.length; i += sampleInterval) {
      const point = touchPath[i];
      const element = document.elementFromPoint(point.x, point.y) as HTMLElement;

      if (element) {
        // Check if element is a descendant of the touch area (not the touch area itself)
        if (touchArea.contains(element) && element !== touchArea) {
          elements.add(element);
        }
      }
    }

    return Array.from(elements);
  }

  /**
   * Combines touchedElements, interpolatedTouchedElements, and touchedPathElements,
   * orders them chronologically by their position in the touch path, and deduplicates.
   */
  private getDerivedTouchedElements(
    touchedPathElements: HTMLElement[]
  ): HTMLElement[] {
    // Combine all three arrays
    const allElements = [
      ...this.touchedElements,
      ...this.interpolatedTouchedElements,
      ...touchedPathElements,
    ];

    if (allElements.length === 0) return [];

    // Create a map of elements to their first occurrence index in touchPath
    const elementToTouchPathIndex = new Map<HTMLElement, number>();
    
    // Build a set of all unique elements we care about
    const allElementsSet = new Set(allElements);

    // Find the position in touchPath for each element by sampling touchPath
    this.touchPath.forEach((point, pathIdx) => {
      const element = document.elementFromPoint(point.x, point.y) as HTMLElement;
      if (
        element &&
        this.element &&
        this.element.contains(element) &&
        element !== this.element &&
        allElementsSet.has(element) &&
        !elementToTouchPathIndex.has(element)
      ) {
        elementToTouchPathIndex.set(element, pathIdx);
      }
    });

    // Sort elements by their touchPath index, then add any that weren't found in touchPath
    const ordered = allElements
      .filter((el, idx, arr) => arr.indexOf(el) === idx) // Deduplicate
      .sort((a, b) => {
        const aIdx = elementToTouchPathIndex.get(a) ?? Infinity;
        const bIdx = elementToTouchPathIndex.get(b) ?? Infinity;
        if (aIdx !== Infinity || bIdx !== Infinity) {
          return aIdx - bIdx;
        }
        // If neither has a touchPath index, maintain original order
        return 0;
      });

    return ordered;
  }

  private dispatchSwipeEvent = (gestureType: TGestureType, details: ISwipeEventDetails) => {
    const eventName = this.eventPrefix + gestureType;
    const swipeEvent = new CustomEvent(eventName, { detail: details });
    this.element!.dispatchEvent(swipeEvent);
  };

  private dispatchTapEvent = (gestureType: TGestureType, details: ITapEventDetails) => {
    const eventName = this.eventPrefix + gestureType;
    const tapEvent = new CustomEvent(eventName, { detail: details });
    this.element!.dispatchEvent(tapEvent);
  };

  private dispatchCircularSwipeEvent = (
    gestureType: TGestureType,
    details: ICircularSwipeEventDetails
  ) => {
    const eventName = this.eventPrefix + gestureType;
    const circularEvent = new CustomEvent(eventName, { detail: details });
    this.element!.dispatchEvent(circularEvent);
  };

  private dispatchRotateEvent = (gestureType: TGestureType, details: IRotateEventDetails) => {
    const eventName = this.eventPrefix + gestureType;
    const rotateEvent = new CustomEvent(eventName, { detail: details });
    this.element!.dispatchEvent(rotateEvent);
  };

  private dispatchPalmSwipeEvent = (
    gestureType: TGestureType,
    details: IPalmSwipeEventDetails
  ) => {
    const eventName = this.eventPrefix + gestureType;
    const palmEvent = new CustomEvent(eventName, { detail: details });
    this.element!.dispatchEvent(palmEvent);
  };

  private dispatchPinchSpreadEvent = (
    gestureType: TGestureType,
    details: IPinchSpreadEventDetails
  ) => {
    const eventName = this.eventPrefix + gestureType;
    const pinchSpreadEvent = new CustomEvent(eventName, { detail: details });
    this.element!.dispatchEvent(pinchSpreadEvent);
  };

  private dispatchGestureEvent = (gestureType: TGestureType, details: IGestureEventDetails) => {
    const eventName = this.eventPrefix + gestureType;
    const gestureEvent = new CustomEvent(eventName, { detail: details });
    this.element!.dispatchEvent(gestureEvent);
  };

  private reset() {
    // detail object
    this.endPressure = 0;
    this.startingElement = null;
    this.startPressure = 0;
    this.startTime = 0;
    this.startX = 0;
    this.startY = 0;
    this.touchedElements = [];
    this.interpolatedTouchedElements = [];
    this.lastTouchPosition = null;

    // local variables
    // Note: activeTouches is managed by touch event handlers based on event.touches.length
    // Do not reset it here to avoid breaking multitouch state
    this.gestureStartDistance = 0;
    this.isMultiTouch = false;
    this.latestGestureDistance = 0;
    this.touchCount = 0;

    // Tap detection (don't reset lastTapTime - needed for doubletap)
    this.holdFired = false;

    // Circular swipe
    this.touchPath = [];

    // Rotation and pinch/spread
    this.gestureStartTouch1 = null;
    this.gestureStartTouch2 = null;
    this.latestTouch1 = null;
    this.latestTouch2 = null;

    // Palm swipe
    this.palmStartPositions = [];
    this.isPalmSwipe = false;

    this.clearTimers();
  }
}

/** Touch-only pipeline (`touchstart` / `touchmove` / `touchend`). Overrides default pointer mode. */
export function useTouchEvents(
  queryStringOrElement: string | HTMLElement,
  options: ITocadaOptions = {}
) {
  return new Tocada(queryStringOrElement, { ...options, pointerEvents: false });
}

/** Explicit Pointer Events pipeline (default for {@link Tocada} and {@link usePointerEvents}). */
export function usePointerEvents(
  queryStringOrElement: string | HTMLElement,
  options: Omit<ITocadaOptions, "pointerEvents"> = {}
) {
  return new Tocada(queryStringOrElement, { ...options, pointerEvents: true });
}

// Re-export types for consumers
export * from "./types";
