import clamp from "./clamp";

export default function tickTimer(
  res: {
    count?: number;
    extra?: Record<string, number>;
  },
  {
    kind = "",
    tickSource = "",

    minValue = 0.0,
    maxValue = +Infinity,
    direction = 1.0,

    streakKind = "current",
    maxStreakKind = "max",
    minStreakKind = "min",
    resetStreakSource = "",
  } = {},
) {
  return (dt: number, src?: string) => {
    if (!tickSource || src === tickSource) {
      let cur = (kind && res.extra ? res.extra[kind] : res.count) ?? 0;
      if (
        (cur > minValue || direction > 0) &&
        (cur < maxValue || direction < 0)
      ) {
        cur = clamp(cur + direction * dt, minValue, maxValue);
        if (kind && res.extra) {
          res.extra[kind] = cur;
        } else {
          res.count = cur;
        }

        if (streakKind && res.extra && res.extra[streakKind] != null) {
          res.extra[streakKind] = clamp(
            res.extra[streakKind] + direction * dt,
            minValue,
            maxValue,
          );

          if (
            maxStreakKind &&
            res.extra[maxStreakKind] != null &&
            res.extra[maxStreakKind] < res.extra[streakKind]
          ) {
            res.extra[maxStreakKind] = res.extra[streakKind];
          }

          if (
            minStreakKind &&
            res.extra[minStreakKind] != null &&
            res.extra[minStreakKind] > res.extra[streakKind]
          ) {
            res.extra[minStreakKind] = res.extra[streakKind];
          }
        }
      }
    } else if (!resetStreakSource || src === resetStreakSource) {
      if (streakKind && res.extra) {
        res.extra[streakKind] =
          direction > 0 ? minValue : direction < 0 ? maxValue : 0;
      }
    }

    return null;
  };
}
