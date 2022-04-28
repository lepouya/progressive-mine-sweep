import * as data from "../data/messages.json";

const messages = <Record<string, string | string[]>>data;
export default function message(key: string, index?: number): string {
  const msgs = messages[key];
  if (!msgs || msgs.length === 0) {
    return key;
  } else if (typeof msgs === "string") {
    return msgs;
  }

  index ??= Math.floor(Math.random() * msgs.length);
  return msgs[index] ?? msgs[0] ?? key;
}
