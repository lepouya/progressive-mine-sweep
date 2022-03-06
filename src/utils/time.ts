type TimeOptions = {
  start?: number;
  end?: number;

  prefix?: string;
  suffix?: string;
  separator?: string;
  never?: string;
  now?: string;

  millis?: boolean;
  negatives?: boolean;
};

export default function printTime(options: TimeOptions): string {
  let start = options.start ?? 0;
  let end = options.end ?? 0;
  let prefix = options.prefix ?? "";
  let suffix = options.suffix ?? "";
  let separator = options.separator ?? ", ";
  let never = options.never ?? "never";
  let now = options.now ?? "now";
  let millis = options.millis ?? false;
  let negatives = options.negatives ?? false;

  if (never.length > 0 && (start <= 0 || end <= 0)) {
    return prefix + never;
  }

  let duration = end - start;
  if (!negatives && duration < 0) {
    duration = 0;
  }

  let secs = Math.floor(duration / 1000);
  let msec = Math.floor(duration - secs * 1000);

  let mins = Math.floor(secs / 60);
  secs -= mins * 60;

  let hours = Math.floor(mins / 60);
  mins -= hours * 60;

  let days = Math.floor(hours / 24);
  hours -= days * 24;

  if (!millis) {
    msec = 0;
  }

  if (now.length > 0 && days + hours + mins + secs + msec === 0) {
    return prefix + now;
  }

  let words: string[] = [];
  function addWord(
    num: number,
    word: string,
    allowZeros = false,
    fraction = 0,
  ): void {
    if (num > 0 || fraction > 0 || (allowZeros && num === 0)) {
      words.push(
        num.toString() +
          (fraction > 0 ? "." + fraction.toString() : "") +
          " " +
          word +
          (num === 1 ? "" : "s"),
      );
    }
  }

  addWord(days, "day");
  addWord(hours, "hour");
  addWord(mins, "minute");
  addWord(secs, "second", days + hours + mins === 0, msec);

  return prefix + words.join(separator) + suffix;
}
