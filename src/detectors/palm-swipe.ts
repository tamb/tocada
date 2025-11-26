import { ICoords, DEFAULT_THRESHOLDS } from "../types";

export type PalmSwipeDirection = "up" | "down" | "left" | "right";

/**
 * Checks if a set of touch points form a roughly linear pattern.
 * This is used to detect palm swipes where multiple points touch in a line.
 * @param touches - array of touch coordinates
 * @param tolerance - maximum perpendicular distance from the line allowed
 */
export function areTouchesInLine(
  touches: ICoords[],
  tolerance: number = DEFAULT_THRESHOLDS.palmLineTolerance
): boolean {
  if (touches.length < 2) {
    return true; // A single point or no points trivially forms a line
  }

  if (touches.length === 2) {
    return true; // Two points always form a line
  }

  // Find the line of best fit using least squares for both orientations
  // and check perpendicular distances

  // First, determine if the line is more horizontal or vertical
  const minX = Math.min(...touches.map((t) => t.x));
  const maxX = Math.max(...touches.map((t) => t.x));
  const minY = Math.min(...touches.map((t) => t.y));
  const maxY = Math.max(...touches.map((t) => t.y));

  const rangeX = maxX - minX;
  const rangeY = maxY - minY;

  // If the spread is very small in both dimensions, points are clustered (not a line)
  if (rangeX < 20 && rangeY < 20) {
    return false;
  }

  // Use the two most extreme points to define the line
  let lineStart: ICoords;
  let lineEnd: ICoords;

  if (rangeX >= rangeY) {
    // More horizontal - use leftmost and rightmost points
    lineStart = touches.reduce((min, t) => (t.x < min.x ? t : min), touches[0]);
    lineEnd = touches.reduce((max, t) => (t.x > max.x ? t : max), touches[0]);
  } else {
    // More vertical - use topmost and bottommost points
    lineStart = touches.reduce((min, t) => (t.y < min.y ? t : min), touches[0]);
    lineEnd = touches.reduce((max, t) => (t.y > max.y ? t : max), touches[0]);
  }

  // Check perpendicular distance of each point from the line
  for (const touch of touches) {
    const distance = perpendicularDistance(touch, lineStart, lineEnd);
    if (distance > tolerance) {
      return false;
    }
  }

  return true;
}

/**
 * Calculates perpendicular distance from a point to a line defined by two points.
 */
export function perpendicularDistance(
  point: ICoords,
  lineStart: ICoords,
  lineEnd: ICoords
): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const lineLength = Math.hypot(dx, dy);

  if (lineLength === 0) {
    // Line start and end are the same point
    return Math.hypot(point.x - lineStart.x, point.y - lineStart.y);
  }

  // Calculate perpendicular distance using cross product
  const distance =
    Math.abs(dy * point.x - dx * point.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x) /
    lineLength;

  return distance;
}

/**
 * Determines if a touch pattern qualifies as a palm swipe.
 * @param touchCount - number of simultaneous touches
 * @param touches - array of touch coordinates
 * @param minTouches - minimum number of touches required
 * @param lineTolerance - tolerance for line detection
 */
export function isPalmSwipePattern(
  touchCount: number,
  touches: ICoords[],
  minTouches: number = DEFAULT_THRESHOLDS.palmMinTouches,
  lineTolerance: number = DEFAULT_THRESHOLDS.palmLineTolerance
): boolean {
  if (touchCount < minTouches) {
    return false;
  }

  return areTouchesInLine(touches, lineTolerance);
}

/**
 * Calculates the average position of multiple touch points.
 */
export function getAveragePosition(positions: ICoords[]): ICoords {
  if (positions.length === 0) {
    return { x: 0, y: 0 };
  }

  const sum = positions.reduce(
    (acc, pos) => ({ x: acc.x + pos.x, y: acc.y + pos.y }),
    { x: 0, y: 0 }
  );

  return {
    x: sum.x / positions.length,
    y: sum.y / positions.length,
  };
}

/**
 * Determines the direction of a palm swipe based on start and end positions.
 * @param startPositions - array of starting touch coordinates
 * @param endPositions - array of ending touch coordinates
 */
export function getPalmSwipeDirection(
  startPositions: ICoords[],
  endPositions: ICoords[]
): PalmSwipeDirection | null {
  if (startPositions.length === 0 || endPositions.length === 0) {
    return null;
  }

  const startCenter = getAveragePosition(startPositions);
  const endCenter = getAveragePosition(endPositions);

  const deltaX = endCenter.x - startCenter.x;
  const deltaY = endCenter.y - startCenter.y;

  // Determine primary direction based on which axis has more movement
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX > 0 ? "right" : "left";
  } else {
    return deltaY > 0 ? "down" : "up";
  }
}

/**
 * Calculates distance and velocity for palm swipe.
 */
export function getPalmSwipeMetrics(
  startPositions: ICoords[],
  endPositions: ICoords[],
  duration: number
): { distance: number; velocity: number } {
  const startCenter = getAveragePosition(startPositions);
  const endCenter = getAveragePosition(endPositions);

  const distance = Math.hypot(
    endCenter.x - startCenter.x,
    endCenter.y - startCenter.y
  );

  const velocity = duration > 0 ? distance / duration : 0;

  return { distance, velocity };
}

