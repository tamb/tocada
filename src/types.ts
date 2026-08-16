export type TGestureType =
  // Single touch - swipe
  | "swipe"
  | "swipeup"
  | "swipedown"
  | "swipeleft"
  | "swiperight"
  // Single touch - tap/press/hold
  | "tap"
  | "doubletap"
  | "press"
  | "hold"
  // Single touch - circular swipe
  | "swipeclockwise"
  | "swipecounterclockwise"
  // Multi touch - pinch/spread
  | "pinch"
  | "spread"
  | "gesture"
  // Multi touch - palm swipe
  | "swipepalm"
  | "swipepalmup"
  | "swipepalmdown"
  | "swipepalmleft"
  | "swipepalmright"
  // Multi touch - rotate
  | "rotate"
  | "rotateclockwise"
  | "rotatecounterclockwise";

export interface IThresholds {
  // Existing
  swipeThreshold?: number; // default 50px

  // Tap/Press/Hold timing
  tapMaxTime?: number; // default 200ms
  doubleTapGap?: number; // default 300ms
  pressMinTime?: number; // default 200ms
  holdMinTime?: number; // default 500ms

  // Circular swipe
  circularSwipeMinArc?: number; // default 90 degrees

  // Palm swipe
  palmMinTouches?: number; // default 3
  palmLineTolerance?: number; // default 50px - how much deviation from a line is allowed

  // Rotate
  rotateMinAngle?: number; // default 15 degrees

  // Pinch/Spread
  pinchSpreadMinDistance?: number; // default 20px - minimum distance change to register as pinch/spread
}

export interface ITocadaOptions {
  thresholds?: IThresholds;
  eventPrefix?: string;
  useHighPrecision?: boolean;
  /**
   * When true (default), listens with Pointer Events (pointerdown / pointermove / pointerup / pointercancel)
   * for mouse, pen, and touch via the unified pointer model. Set to `false` for legacy TouchEvent-only input.
   * Do not attach both pipelines to the same element (double events).
   * Pointer and touch listeners use `{ passive: false }` so preventDefault can block native scrolling,
   * text highlight, and the long-press callout while tracking (including hold).
   */
  pointerEvents?: boolean;
  /**
   * Inline `touch-action` on the target element so the browser suppresses default pan/pinch on that surface during gestures.
   * - `undefined` (default): set `none`, restored on {@link Tocada.destroy}
   * - `false`: do not change `touch-action`
   * - other strings (e.g. `manipulation`, `pan-y`): set that value, restored on destroy
   */
  touchAction?: false | string;
}

export interface ICoords {
  x: number;
  y: number;
}

export interface ITouchPoint {
  x: number;
  y: number;
  time: number;
}

export interface ISwipeEventDetails {
  avgPressure: number;
  distance: number;
  distanceX: number;
  distanceY: number;
  endingElement: HTMLElement;
  endPressure: number;
  endTime: number;
  startingElement: HTMLElement | null;
  startPressure: number;
  startTime: number;
  touchedElements: HTMLElement[];
  velocity: number;
  velocityX: number;
  velocityY: number;
  startingCoords: ICoords;
  endingCoords: ICoords;
  touchedPathElements?: HTMLElement[];
  interpolatedTouchedElements?: HTMLElement[];
  derivedTouchedElements?: HTMLElement[];
}

export interface ITapEventDetails {
  duration: number;
  pressure: number;
  element: HTMLElement | null;
  coords: ICoords;
  startTime: number;
  endTime: number;
}

export interface IRotateEventDetails {
  angle: number; // total rotation in degrees
  direction: "clockwise" | "counterclockwise";
  startAngle: number;
  endAngle: number;
  centerPoint: ICoords;
}

export interface IPalmSwipeEventDetails {
  direction: "up" | "down" | "left" | "right";
  touchCount: number;
  distance: number;
  velocity: number;
  startPositions: ICoords[];
  endPositions: ICoords[];
  touchedPathElements?: HTMLElement[];
  interpolatedTouchedElements?: HTMLElement[];
  derivedTouchedElements?: HTMLElement[];
}

export interface ICircularSwipeEventDetails {
  direction: "clockwise" | "counterclockwise";
  arc: number; // total arc traversed in degrees
  touchPath: ITouchPoint[];
  touchedElements: HTMLElement[];
  touchedPathElements?: HTMLElement[];
  interpolatedTouchedElements?: HTMLElement[];
  derivedTouchedElements?: HTMLElement[];
}

export interface IPinchSpreadEventDetails {
  gesture: "pinch" | "spread" | null;
  startDistance: number;
  endDistance: number;
  distanceChange: number;
  scale: number; // endDistance / startDistance (< 1 for pinch, > 1 for spread)
  centerPoint: ICoords;
}

export interface IGestureEventDetails {
  touchCount: number;
}

// Default threshold values
export const DEFAULT_THRESHOLDS: Required<IThresholds> = {
  swipeThreshold: 50,
  tapMaxTime: 200,
  doubleTapGap: 300,
  pressMinTime: 200,
  holdMinTime: 500,
  circularSwipeMinArc: 90,
  palmMinTouches: 3,
  palmLineTolerance: 50,
  rotateMinAngle: 15,
  pinchSpreadMinDistance: 20,
};
