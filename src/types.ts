export type TGestureType =
  | "swipe"
  | "swipeup"
  | "swipedown"
  | "swipeleft"
  | "swiperight"
  // | "rotate" --- not implemented
  // | rotateclockwise --- not implemented
  // | rotateanticlockwise --- not implemented
  // | "tap" --- not implemented
  // | "doubletap" --- not implemented
  // | "hold" --- not implemented
  | "pinch"
  | "spread"
  | "gesture";

export interface ITocadaOptions {
  thresholds?: {
    swipeThreshold?: number;
  };
  eventPrefix?: string;
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
  startingCoords: { x: number; y: number };
  endingCoords: { x: number; y: number };
  // angle: number; --- not implemented
}
