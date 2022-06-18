import { Resource } from "../model/Resource";
import clamp from "./clamp";

export default function tickTimer<Context, Result>(
  res: Resource<Context, Result>,
  {
    kind = "",
    source = "",

    min = 0.0,
    max = +Infinity,
    direction = -1.0,

    combineWithCurrentTick = false,
    assignToResourceTick = true,
  } = {},
  onEvent?: (
    res: Resource<Context, Result>,
    value: number,
    kind?: string,
    source?: string,
  ) => Result,
) {
  const oldTick = res.tick;
  const newTick = (dt: number, src?: string) => {
    if (!source || src === source) {
      let cur = (kind ? res.extra[kind] : res.count) ?? 0;
      if ((cur > min || direction > 0) && (cur < max || direction < 0)) {
        cur = clamp(cur + direction * dt, min, max);
        if (kind) {
          res.extra[kind] = cur;
        } else {
          res.count = cur;
        }
        if (onEvent && (cur === min || cur === max)) {
          return onEvent(res, cur, kind, src);
        }
      }
    }

    return null;
  };
  const tick =
    oldTick && combineWithCurrentTick
      ? (dt: number, src?: string) => {
          oldTick(dt, src);
          return newTick(dt, src);
        }
      : newTick;

  if (assignToResourceTick) {
    res.tick = tick;
  }
  return tick;
}
