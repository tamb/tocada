export function difference(num1: number, num2: number): number {
  if (num1 < num2) {
    return num2 - num1;
  } else {
    return num1 - num2;
  }
}

export function getDistanceBetweenTouchPoints(touch0: Touch, touch1: Touch): number {
  const distanceX = touch0.clientX - touch1.clientX;
  const distanceY = touch0.clientY - touch1.clientY;
  return Math.hypot(distanceX, distanceY);
}
