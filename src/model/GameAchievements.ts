import toast from "../components/Toast";
import { formatWord } from "../utils/format";
import { Resource } from "./Resource";

export function achievementAwarded(this: Resource) {
  const count = Math.floor(this.value());
  const showCount = this.display === "none" ? "" : count.toFixed() + " ";

  toast({
    heading: "Achievement Unlocked!",
    icon: this.icon,
    type: "success",
    message: showCount + formatWord(undefined, { ...this, count }),
  });
}
