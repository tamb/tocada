import { IThresholds, DEFAULT_THRESHOLDS } from "../types";

export type TapGestureType = "tap" | "press" | "hold" | null;

/**
 * Classifies a touch gesture based on its duration.
 * - tap: duration < tapMaxTime
 * - press: duration >= pressMinTime && duration < holdMinTime
 * - hold: duration >= holdMinTime
 * - null: if duration doesn't match any category (e.g., between tap and press)
 */
export function classifyTapGesture(
  duration: number,
  thresholds: Partial<IThresholds> = {}
): TapGestureType {
  const tapMaxTime = thresholds.tapMaxTime ?? DEFAULT_THRESHOLDS.tapMaxTime;
  const pressMinTime = thresholds.pressMinTime ?? DEFAULT_THRESHOLDS.pressMinTime;
  const holdMinTime = thresholds.holdMinTime ?? DEFAULT_THRESHOLDS.holdMinTime;

  if (duration < tapMaxTime) {
    return "tap";
  }

  if (duration >= pressMinTime && duration < holdMinTime) {
    return "press";
  }

  if (duration >= holdMinTime) {
    return "hold";
  }

  return null;
}

/**
 * Determines if two taps constitute a double tap based on timing.
 * @param currentTapTime - timestamp of the current tap
 * @param lastTapTime - timestamp of the previous tap (0 if no previous tap)
 * @param doubleTapGap - maximum time between taps to count as double tap
 */
export function isDoubleTap(
  currentTapTime: number,
  lastTapTime: number,
  doubleTapGap: number = DEFAULT_THRESHOLDS.doubleTapGap
): boolean {
  if (lastTapTime === 0) {
    return false;
  }

  const gap = currentTapTime - lastTapTime;
  return gap > 0 && gap <= doubleTapGap;
}

/**
 * Checks if a touch moved beyond a threshold (used to invalidate tap gestures).
 * @param startX - starting X coordinate
 * @param startY - starting Y coordinate
 * @param endX - ending X coordinate
 * @param endY - ending Y coordinate
 * @param threshold - maximum movement allowed for a tap (default 10px)
 */
export function isTapMovementValid(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  threshold: number = 10
): boolean {
  const distance = Math.hypot(endX - startX, endY - startY);
  return distance <= threshold;
}

