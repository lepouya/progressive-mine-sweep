import React from "react";

const TimeDuration: React.FC<{
  start?: number;
  end?: number;
  length?: "tiny" | "compact" | "expanded";

  prefix?: string;
  suffix?: string;
  separator?: string;
  never?: string;
  now?: string;

  millis?: boolean;
  negatives?: boolean;
}> = ({
  start = 0,
  end = 0,
  length = "expanded",
  prefix = "",
  suffix = "",
  separator = length === "expanded" ? ", " : ":",
  never = "never",
  now = "now",
  millis = false,
  negatives = false,
}) => {
  let duration = end - start;
  if (never.length > 0 && (start <= 0 || end <= 0)) {
    duration = -1;
  } else if (!negatives && duration < 0) {
    duration = 0;
  }

  const wording = formatDuration(
    duration,
    length,
    millis,
    separator,
    now,
    never,
  );

  return (
    <div className="time-duration">
      {prefix}
      {wording}
      {wording !== now && wording !== never ? suffix : ""}
    </div>
  );
};

export function formatDuration(
  time: number,
  len: "tiny" | "compact" | "expanded" = "expanded",
  millis = false,
  sep = len === "expanded" ? ", " : ":",
  now = "",
  never = "",
): string {
  if (never.length > 0 && time < 0) {
    return never;
  } else if (now.length > 0 && time === 0) {
    return now;
  }

  let secs = Math.floor(time / 1000);
  let msec = Math.floor(time - secs * 1000);

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
    return now;
  }

  let words = [];
  if (len !== "expanded") {
    words = [
      days > 0 ? days.toFixed(0) : "",
      hours > 0 || len === "compact" ? hours.toFixed(0) : "",
      mins > 0 || len === "compact" ? mins.toFixed(0) : "",
      (secs + msec / 1000).toFixed(
        !millis || (len === "tiny" && msec === 0) ? 0 : 3,
      ),
    ].map((num) =>
      len === "compact" && (num.length === 1 || num.indexOf(".") === 1)
        ? "0" + num
        : num,
    );
  } else {
    words = [
      [days, "day"],
      [hours, "hour"],
      [mins, "minute"],
      [secs, "second", days + hours + mins === 0, msec],
    ].map(([num, word, allowZeros = false, fraction = 0]) =>
      num > 0 || fraction > 0 || (allowZeros && num === 0)
        ? num.toString() +
          (fraction > 0 ? "." + fraction.toString() : "") +
          " " +
          word +
          (num === 1 ? "" : "s")
        : "",
    );
  }

  return words.filter((word) => word.length > 0).join(sep);
}

export default TimeDuration;
