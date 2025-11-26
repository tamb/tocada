import { ICoords, ISwipeEventDetails, DEFAULT_THRESHOLDS } from "../types";

export type SwipeDirection = "up" | "down" | "left" | "right";

export interface ISwipeAnalysis {
  isSwipe: boolean;
  direction: SwipeDirection | null;
  distance: number;
  distanceX: number;
  distanceY: number;
  velocity: number;
  velocityX: number;
  velocityY: number;
}

/**
 * Calculates the absolute difference between two numbers.
 */
export function difference(num1: number, num2: number): number {
  return Math.abs(num1 - num2);
}

/**
 * Determines the primary swipe direction based on start and end coordinates.
 * @param startX - starting X coordinate
 * @param startY - starting Y coordinate
 * @param endX - ending X coordinate
 * @param endY - ending Y coordinate
 */
export function getSwipeDirection(
  startX: number,
  startY: number,
  endX: number,
  endY: number
): SwipeDirection {
  const deltaX = difference(startX, endX);
  const deltaY = difference(startY, endY);

  if (deltaX > deltaY) {
    // Horizontal swipe
    return startX < endX ? "right" : "left";
  } else {
    // Vertical swipe
    return startY < endY ? "down" : "up";
  }
}

/**
 * Analyzes a potential swipe gesture.
 * @param startCoords - starting coordinates
 * @param endCoords - ending coordinates
 * @param duration - duration of the gesture in milliseconds
 * @param swipeThreshold - minimum distance to qualify as a swipe
 */
export function analyzeSwipe(
  startCoords: ICoords,
  endCoords: ICoords,
  duration: number,
  swipeThreshold: number = DEFAULT_THRESHOLDS.swipeThreshold
): ISwipeAnalysis {
  const deltaX = difference(startCoords.x, endCoords.x);
  const deltaY = difference(startCoords.y, endCoords.y);
  const distance = Math.hypot(deltaX, deltaY);

  const isSwipe = distance > swipeThreshold;

  if (!isSwipe) {
    return {
      isSwipe: false,
      direction: null,
      distance,
      distanceX: deltaX,
      distanceY: deltaY,
      velocity: 0,
      velocityX: 0,
      velocityY: 0,
    };
  }

  const velocity = duration > 0 ? distance / duration : 0;
  const velocityX = duration > 0 ? deltaX / duration : 0;
  const velocityY = duration > 0 ? deltaY / duration : 0;

  return {
    isSwipe: true,
    direction: getSwipeDirection(startCoords.x, startCoords.y, endCoords.x, endCoords.y),
    distance,
    distanceX: deltaX,
    distanceY: deltaY,
    velocity,
    velocityX,
    velocityY,
  };
}

/**
 * Converts a SwipeDirection to a gesture type string.
 */
export function getSwipeGestureType(direction: SwipeDirection): string {
  return `swipe${direction}`;
}

/**
 * Builds the swipe event details object.
 */
export function buildSwipeEventDetails(
  startCoords: ICoords,
  endCoords: ICoords,
  startTime: number,
  endTime: number,
  startPressure: number,
  endPressure: number,
  startingElement: HTMLElement | null,
  endingElement: HTMLElement | null,
  touchedElements: HTMLElement[]
): ISwipeEventDetails {
  const duration = endTime - startTime;
  const analysis = analyzeSwipe(startCoords, endCoords, duration, 0); // threshold already checked

  return {
    velocityX: analysis.velocityX,
    velocityY: analysis.velocityY,
    velocity: analysis.velocity,
    avgPressure: (startPressure + endPressure) / 2,
    startPressure,
    endPressure,
    startTime,
    endTime,
    distanceX: analysis.distanceX,
    distanceY: analysis.distanceY,
    distance: analysis.distance,
    startingElement,
    endingElement: endingElement as HTMLElement,
    touchedElements,
    startingCoords: startCoords,
    endingCoords: endCoords,
  };
}

