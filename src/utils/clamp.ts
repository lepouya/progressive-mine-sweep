export default function clamp(
  n: number,
  min: number = 0,
  max: number = 1,
): number {
  if (isNaN(n)) {
    return min;
  } else if (n < min) {
    return min;
  } else if (n > max) {
    return max;
  } else {
    return n;
  }
}
