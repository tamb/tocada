import { ITouchPoint, DEFAULT_THRESHOLDS } from "../types";

export type CircularDirection = "clockwise" | "counterclockwise" | null;

/**
 * Calculates the angle (in degrees) from point p1 to point p2.
 * Returns angle in range [-180, 180] where 0 is pointing right (east),
 * positive angles go counter-clockwise, negative angles go clockwise.
 */
export function calculateAngleBetweenPoints(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

/**
 * Normalizes an angle difference to be within [-180, 180].
 */
export function normalizeAngleDelta(delta: number): number {
  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;
  return delta;
}

/**
 * Calculates the signed turn angle at a point given three consecutive points.
 * Positive = left turn (counter-clockwise in math coords = clockwise on screen)
 * Negative = right turn (clockwise in math coords = counter-clockwise on screen)
 */
function calculateTurnAngle(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
): number {
  // Vector from p1 to p2
  const v1x = p2.x - p1.x;
  const v1y = p2.y - p1.y;
  // Vector from p2 to p3
  const v2x = p3.x - p2.x;
  const v2y = p3.y - p2.y;

  // Cross product gives signed area (positive = left turn, negative = right turn)
  const cross = v1x * v2y - v1y * v2x;
  // Dot product
  const dot = v1x * v2x + v1y * v2y;

  // Angle in radians, converted to degrees
  return Math.atan2(cross, dot) * (180 / Math.PI);
}

/**
 * Calculates the cumulative arc traversed along a touch path by summing turn angles.
 * Returns an object with total arc (absolute sum) and net arc (signed sum).
 * Positive net arc = clockwise on screen, negative = counter-clockwise on screen.
 */
export function calculateCumulativeArc(touchPath: ITouchPoint[]): {
  totalArc: number;
  netArc: number;
} {
  if (touchPath.length < 3) {
    return { totalArc: 0, netArc: 0 };
  }

  let totalArc = 0;
  let netArc = 0;

  for (let i = 1; i < touchPath.length - 1; i++) {
    const turnAngle = calculateTurnAngle(
      touchPath[i - 1],
      touchPath[i],
      touchPath[i + 1]
    );

    totalArc += Math.abs(turnAngle);
    netArc += turnAngle;
  }

  return { totalArc, netArc };
}

/**
 * Detects if a touch path represents a circular swipe motion.
 * @param touchPath - array of touch points with x, y, time
 * @param minArc - minimum arc (in degrees) to qualify as a circular swipe
 * @returns 'clockwise', 'counterclockwise', or null if not circular enough
 */
export function detectCircularDirection(
  touchPath: ITouchPoint[],
  minArc: number = DEFAULT_THRESHOLDS.circularSwipeMinArc
): CircularDirection {
  const { totalArc, netArc } = calculateCumulativeArc(touchPath);

  // The net arc (absolute) must have traversed at least minArc degrees
  // Using net arc ensures we're measuring consistent motion in one direction
  if (Math.abs(netArc) < minArc) {
    return null;
  }

  // Check if the motion is consistently in one direction
  // A consistent circular motion should have net arc close to total arc (in magnitude)
  const consistency = totalArc > 0 ? Math.abs(netArc) / totalArc : 0;

  // Require at least 70% consistency for it to be considered circular
  if (consistency < 0.7) {
    return null;
  }

  // Positive netArc = left turns = clockwise on screen (due to Y being down)
  return netArc > 0 ? "clockwise" : "counterclockwise";
}

/**
 * Gets the arc information for event details.
 */
export function getCircularSwipeInfo(touchPath: ITouchPoint[]): {
  arc: number;
  direction: CircularDirection;
} {
  const { netArc } = calculateCumulativeArc(touchPath);
  const direction = netArc > 0 ? "clockwise" : "counterclockwise";

  return {
    arc: Math.abs(netArc),
    direction: Math.abs(netArc) > 0 ? direction : null,
  };
}
