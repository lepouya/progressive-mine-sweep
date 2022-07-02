import toast from "../components/Toast";
import { formatWord } from "../utils/format";
import { Resource } from "./Resource";

export function achievementAwarded(this: Resource) {
  toast({
    heading: "Achievement Earned!",
    icon: this.icon,
    type: "success",
    message:
      this.value().toFixed() +
      " " +
      formatWord(undefined, { ...this, count: this.value() }),
  });
}
