import { ICoords, DEFAULT_THRESHOLDS } from "../types";

export type RotateDirection = "clockwise" | "counterclockwise" | null;

/**
 * Calculates the angle (in degrees) of the line connecting two touch points.
 * Returns angle in range [-180, 180].
 */
export function getAngleBetweenTouches(
  touch1: ICoords,
  touch2: ICoords
): number {
  const dx = touch2.x - touch1.x;
  const dy = touch2.y - touch1.y;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

/**
 * Calculates the rotation delta between two angles.
 * Handles wrapping around 180/-180 boundary.
 * Positive delta = counter-clockwise in math coords = clockwise on screen.
 */
export function calculateRotationDelta(
  startAngle: number,
  endAngle: number
): number {
  let delta = endAngle - startAngle;

  // Normalize to [-180, 180]
  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;

  return delta;
}

/**
 * Classifies a rotation based on the delta angle.
 * @param delta - rotation delta in degrees (positive = clockwise on screen)
 * @param minAngle - minimum angle threshold to count as rotation
 */
export function classifyRotation(
  delta: number,
  minAngle: number = DEFAULT_THRESHOLDS.rotateMinAngle
): RotateDirection {
  const absDelta = Math.abs(delta);

  if (absDelta <= minAngle) {
    return null;
  }

  // In screen coordinates (Y-down), positive delta = clockwise
  return delta > 0 ? "clockwise" : "counterclockwise";
}

/**
 * Calculates the center point between two touches.
 */
export function getCenterPoint(touch1: ICoords, touch2: ICoords): ICoords {
  return {
    x: (touch1.x + touch2.x) / 2,
    y: (touch1.y + touch2.y) / 2,
  };
}

/**
 * Full rotation detection from start and end touch pairs.
 */
export function detectRotation(
  startTouch1: ICoords,
  startTouch2: ICoords,
  endTouch1: ICoords,
  endTouch2: ICoords,
  minAngle: number = DEFAULT_THRESHOLDS.rotateMinAngle
): {
  direction: RotateDirection;
  angle: number;
  startAngle: number;
  endAngle: number;
  centerPoint: ICoords;
} {
  const startAngle = getAngleBetweenTouches(startTouch1, startTouch2);
  const endAngle = getAngleBetweenTouches(endTouch1, endTouch2);
  const delta = calculateRotationDelta(startAngle, endAngle);
  const direction = classifyRotation(delta, minAngle);

  // Use the end position for center point
  const centerPoint = getCenterPoint(endTouch1, endTouch2);

  return {
    direction,
    angle: Math.abs(delta),
    startAngle,
    endAngle,
    centerPoint,
  };
}

