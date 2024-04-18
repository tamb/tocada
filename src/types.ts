export type TGestureType =
  | "swipe"
  | "swipeup"
  | "swipedown"
  | "swipeleft"
  | "swiperight"
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
  velocityX: number;
  velocityY: number;
  velocity: number;
  avgPressure: number;
  startPressure: number;
  endPressure: number;
  startTime: number;
  endTime: number;
  distanceX: number;
  distanceY: number;
  distance: number;
  startingElement: HTMLElement | null;
  endingElement: HTMLElement;
  touchedElements: HTMLElement[];
}
