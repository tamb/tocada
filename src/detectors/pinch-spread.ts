import { ICoords, DEFAULT_THRESHOLDS } from "../types";

export type PinchSpreadGesture = "pinch" | "spread" | null;

export interface IPinchSpreadAnalysis {
  gesture: PinchSpreadGesture;
  startDistance: number;
  endDistance: number;
  distanceChange: number;
  scale: number; // endDistance / startDistance
}

export interface IPinchSpreadEventDetails {
  gesture: PinchSpreadGesture;
  startDistance: number;
  endDistance: number;
  distanceChange: number;
  scale: number;
  centerPoint: ICoords;
}

/**
 * Calculates the distance between two touch points.
 */
export function getDistanceBetweenPoints(p1: ICoords, p2: ICoords): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.hypot(dx, dy);
}

/**
 * Calculates the center point between two touches.
 */
export function getCenterBetweenPoints(p1: ICoords, p2: ICoords): ICoords {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

/**
 * Analyzes a pinch or spread gesture based on distance changes.
 * @param startDistance - initial distance between two touches
 * @param endDistance - final distance between two touches
 * @param minDistanceChange - minimum change in distance to register as gesture (optional)
 */
export function analyzePinchSpread(
  startDistance: number,
  endDistance: number,
  minDistanceChange: number = 0
): IPinchSpreadAnalysis {
  const distanceChange = endDistance - startDistance;
  const scale = startDistance > 0 ? endDistance / startDistance : 1;

  let gesture: PinchSpreadGesture = null;

  if (Math.abs(distanceChange) > minDistanceChange) {
    gesture = distanceChange < 0 ? "pinch" : "spread";
  }

  return {
    gesture,
    startDistance,
    endDistance,
    distanceChange,
    scale,
  };
}

/**
 * Classifies a pinch/spread gesture.
 * @param startDistance - initial distance between touches
 * @param endDistance - final distance between touches
 */
export function classifyPinchSpread(
  startDistance: number,
  endDistance: number
): PinchSpreadGesture {
  if (endDistance < startDistance) {
    return "pinch";
  } else if (endDistance > startDistance) {
    return "spread";
  }
  return null;
}

/**
 * Builds the pinch/spread event details object.
 */
export function buildPinchSpreadEventDetails(
  startTouch1: ICoords,
  startTouch2: ICoords,
  endTouch1: ICoords,
  endTouch2: ICoords
): IPinchSpreadEventDetails {
  const startDistance = getDistanceBetweenPoints(startTouch1, startTouch2);
  const endDistance = getDistanceBetweenPoints(endTouch1, endTouch2);
  const analysis = analyzePinchSpread(startDistance, endDistance);
  const centerPoint = getCenterBetweenPoints(endTouch1, endTouch2);

  return {
    gesture: analysis.gesture,
    startDistance,
    endDistance,
    distanceChange: analysis.distanceChange,
    scale: analysis.scale,
    centerPoint,
  };
}

