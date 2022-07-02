import toast from "../components/Toast";
import { formatWord } from "../utils/format";
import { Context } from "./Context";
import { Resource } from "./Resource";

export function achievementAwarded(this: Resource) {
  const count = Math.floor(this.value());
  const showCount = this.display === "none" ? "" : count.toFixed() + " ";
  _achievementTotal = undefined;

  toast({
    heading: "Achievement Unlocked!",
    icon: this.icon,
    type: "success",
    message: showCount + formatWord(undefined, { ...this, count }),
  });
}

export function achievementScoreMultiplier({
  resourceManager: { resources },
}: Context): number {
  if (!_achievementTotal) {
    _achievementTotal = 0;
    Object.values(resources).forEach((res) => {
      if (res.autoAward) {
        _achievementTotal = (_achievementTotal ?? 0) + res.count;
      }
    });
  }

  return 1 + _achievementTotal / 50;
}

let _achievementTotal: number | undefined;
