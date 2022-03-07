import React, { useEffect } from "react";

type TimeProperties = {
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

const TimeDuration: React.FC<TimeProperties> = (props) => {
  let start = props.start ?? 0;
  let end = props.end ?? 0;
  let prefix = props.prefix ?? "";
  let suffix = props.suffix ?? "";
  let separator = props.separator ?? ", ";
  let never = props.never ?? "never";
  let now = props.now ?? "now";
  let millis = props.millis ?? false;
  let negatives = props.negatives ?? false;

  if (never.length > 0 && (start <= 0 || end <= 0)) {
    return (
      <div className="time-duration">
        {prefix}
        {never}
      </div>
    );
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
    return (
      <div className="time-duration">
        {prefix}
        {now}
      </div>
    );
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

  return (
    <div className="time-duration">
      {prefix}
      {words.join(separator)}
      {suffix}
    </div>
  );
};

export default TimeDuration;
