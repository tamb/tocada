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
}

export interface ITocadaOptions {
  thresholds?: IThresholds;
  eventPrefix?: string;
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
}

export interface ICircularSwipeEventDetails {
  direction: "clockwise" | "counterclockwise";
  arc: number; // total arc traversed in degrees
  touchPath: ITouchPoint[];
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
};
