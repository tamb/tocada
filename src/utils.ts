import type { ICoords } from "./types";

export function difference(num1: number, num2: number): number {
  if (num1 < num2) {
    return num2 - num1;
  } else {
    return num1 - num2;
  }
}

export function getDistanceBetweenCoords(a: ICoords, b: ICoords): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function getDistanceBetweenTouchPoints(touch0: Touch, touch1: Touch): number {
  return getDistanceBetweenCoords(
    { x: touch0.clientX, y: touch0.clientY },
    { x: touch1.clientX, y: touch1.clientY }
  );
}
