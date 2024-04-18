export function difference(num1: number, num2: number): number {
  if (num1 < num2) {
    return num2 - num1;
  } else {
    return num1 - num2;
  }
}
