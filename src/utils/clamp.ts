export default function clamp(n = 0, min = 0, max = 1): number {
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
