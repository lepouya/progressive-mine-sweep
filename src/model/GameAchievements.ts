import toast from "../components/Toast";
import { formatWord } from "../utils/format";
import { Resource } from "./Resource";

export function achievementAwarded(this: Resource) {
  const count = Math.floor(this.value());
  toast({
    heading: "Achievement Earned!",
    icon: this.icon,
    type: "success",
    message: count.toFixed() + " " + formatWord(undefined, { ...this, count }),
  });
}
