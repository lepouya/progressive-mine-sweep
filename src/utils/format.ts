import clamp from "./clamp";

export function formatNumber(
  val: number,
  len = 21,
  prec = 3,
  sign = false,
  grp = false,
): string {
  const options: Intl.NumberFormatOptions = {
    style: "decimal",
    notation: "standard",
    signDisplay: sign ? "always" : "auto",
    useGrouping: grp,
    minimumIntegerDigits: 1,
    minimumFractionDigits: 0,
    maximumFractionDigits: clamp(prec, 0, len - 1),
    minimumSignificantDigits: 1,
    maximumSignificantDigits: len,
  };

  const res = val.toLocaleString(undefined, options);
  if (res.replace(/\D/g, "").length > len) {
    options.notation = "scientific";
    return val.toLocaleString(undefined, options);
  } else {
    return res;
  }
}

export function formatTime(
  time: number,
  len: "tiny" | "compact" | "expanded" = "expanded",
  millis = false,
  sep = len === "expanded" ? ", " : ":",
  now = "",
  never = "",
  ago = "",
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

  let years = Math.floor(days / 365);
  days -= years * 365;

  if (!millis) {
    msec = 0;
  }

  if (now.length > 0 && days + hours + mins + secs + msec === 0) {
    return now;
  }

  let words = [];
  if (len !== "expanded") {
    words = [
      years > 0 ? years.toFixed(0) : "",
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
      [years, "year"],
      [days, "day"],
      [hours, "hour"],
      [mins, "minute"],
      [secs, "second", years + days + hours + mins === 0, msec],
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

  return (
    words.filter((word) => word.length > 0).join(sep) +
    (ago.length > 0 ? " " + ago : "")
  );
}

export function formatWord(
  word?: string,
  item?: {
    name?: string;
    count?: number;
    singularName?: string;
    pluralName?: string;
  },
  options?: {
    condition?: boolean;
    allowEmpties?: boolean;
    capitalize?: boolean;
  },
): string | undefined {
  if (!word) {
    word =
      (Math.abs(item?.count ?? 0) === 1
        ? item?.singularName
        : item?.pluralName) ?? item?.name;
  }

  if (!(options?.condition ?? true)) {
    return undefined;
  } else if (!word && !(options?.allowEmpties ?? false)) {
    return undefined;
  } else if (!(options?.capitalize ?? true)) {
    return word;
  } else {
    return (word ?? "")
      .replace(/([a-z])([A-Z]|_\S)/g, (_, c1, c2) => `${c1} ${c2.slice(-1)}`)
      .replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());
  }
}
