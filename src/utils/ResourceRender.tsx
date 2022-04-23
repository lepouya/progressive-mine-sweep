import React from "react";
import Icon from "./Icon";
import { formatNumber, formatDuration } from "./format";
import { Resource } from "../model/Resource";

const ResourceRender: React.FC<{
  resource?: Partial<Resource>;
  name?: string;
  value?: number;
  epoch?: number;
  kind?: string;
  display?: keyof typeof multipliers;
  length?: keyof typeof maxLengths;
  rounding?: keyof typeof roundMethods;

  showLocked?: boolean;
  showIcon?: boolean;
  showName?: boolean;
  showValue?: boolean;
  showMaxValue?: boolean;
  showRawValue?: boolean;
  showRate?: boolean;
  showExtras?: boolean;
  showRawExtras?: boolean;

  showColors?: boolean;
  showRateColors?: boolean;
  showNegatives?: boolean;
  showZeros?: boolean;
  showPlusSign?: boolean;
  showGrouping?: boolean;
  showZeroRates?: boolean;
  showRatePercentages?: boolean;
  showCapitalized?: boolean;
  showChrome?: boolean;

  precision?: number;
  valuePrecision?: number;
  rawValuePrecision?: number;
  ratePrecision?: number;
  extrasPrecision?: number;
  rawExtrasPrecision?: number;

  reversedDirection?: boolean;

  prefix?: string;
  suffix?: string;
  infix?: string;
  placeholder?: string;
  timeSeparator?: string;
  ago?: string;
  now?: string;
  never?: string;

  className?: string;
  style?: React.CSSProperties;
}> = ({
  value,
  epoch,
  name,
  resource = { name, count: value },
  kind = "",
  display = (resource.name ?? name ?? "").toLowerCase().indexOf("time") >= 0
    ? "time"
    : "number",
  length = "expanded",
  rounding = display === "number" ? "floor" : "round",

  showLocked = false,
  showIcon = true,
  showName = true,
  showValue = true,
  showMaxValue = false,
  showRawValue = false,
  showRate = false,
  showExtras = false,
  showRawExtras = showExtras && showRawValue,

  showColors = false,
  showRateColors = true,
  showNegatives = true,
  showZeros = true,
  showPlusSign = false,
  showGrouping = display === "number",
  showZeroRates = false,
  showRatePercentages = display === "number",
  showCapitalized = true,
  showChrome = false,

  precision = display === "time" ? 3 : display === "number" ? 2 : 0,
  valuePrecision = precision,
  rawValuePrecision = valuePrecision,
  ratePrecision = display === "time" ? 0 : precision,
  extrasPrecision = precision,
  rawExtrasPrecision = extrasPrecision,

  reversedDirection = false,

  prefix = "",
  suffix = "",
  infix = ":",
  placeholder = "-",
  timeSeparator = length === "expanded" ? ", " : ":",
  ago = "ago",
  now = "now",
  never = "never",

  className = "",
  style,
}) => {
  const output: JSX.Element[] = [];
  function addValueDiv(
    num = NaN,
    key = "",
    {
      prec = precision,
      rnd = rounding,
      cls = "",
      disp = display,
      len = length,
      neg = showNegatives,
      zero = showZeros,
      plus = showPlusSign,
      grp = showGrouping,
      color = showColors,
      paren = false,
      sep = timeSeparator,
      pre = "",
      post = "",
      ref = false,
      dry = false,
    },
  ): string {
    const value = roundNumber(
      (num - (ref && epoch ? epoch : 0)) * multipliers[disp],
      prec,
      rnd,
    );
    if (isNaN(value) || (!neg && value < 0) || (!zero && value === 0)) {
      return "";
    }

    const classes = [disp.toString()];
    if (cls.length > 0) {
      classes.push(cls);
    }
    if (color) {
      const v = reversedDirection ? -value : +value;
      classes.push(v > 0 ? "positive" : v < 0 ? "negative" : "zero");
    }

    let res = placeholder;
    if (disp === "number" || disp === "percentage") {
      res = formatNumber(value, maxLengths[len], prec, plus, grp);
      if (disp === "percentage") {
        res += "%";
      }
    } else if (disp === "time") {
      if (ref && never.length > 0 && (num <= 0 || (epoch ?? -Infinity) <= 0)) {
        res = never;
      } else if (ref && epoch != null) {
        res = formatDuration(value, len, prec > 0, sep, now, never, ago);
      } else {
        res = formatDuration(value, len, prec > 0);
      }
      if (plus && value >= 0 && len !== "expanded") {
        res = `+${res}`;
      }
    }

    res = pre + res + post;
    if (paren) {
      res = `(${res})`;
    }

    if (!dry) {
      output.push(
        <div key={key} className={classes.join(" ")}>
          {res}
        </div>,
      );
    }

    return res;
  }

  const getWord = (
    word?: string,
    { condition = true, empties = false, caps = showCapitalized } = {},
  ) =>
    condition && (empties || (word != null && word.length > 0))
      ? caps
        ? (word ?? "")
            .replace(
              /(\p{Ll})(\p{Lu}|_\S)/gu,
              (_, c1, c2) => `${c1} ${c2.slice(-1)}`,
            )
            .replace(/(?:^|\s)\S/g, (c) => c.toUpperCase())
        : word
      : null;

  const classNames = ["resource"];
  if (className) {
    classNames.push(className);
  }

  let locked = false;
  if (!showLocked && !(resource.unlocked ?? true)) {
    classNames.push("locked");
    output.push(
      <div className="placeholder" key="lock">
        {placeholder}
      </div>,
    );
    locked = true;
  }

  if (!locked && ((showIcon && resource.icon) || (showName && resource.name))) {
    output.push(
      <div className="name" key="name">
        {showIcon && resource.icon && resource.icon.length > 0 ? (
          <Icon icon={resource.icon} size="1em" />
        ) : null}
        {getWord(resource.name ?? name, { condition: showName })}
        {infix}
      </div>,
    );
  }

  if (!locked && showValue) {
    const denom = showMaxValue
      ? addValueDiv(resource.maxCount, "denominator", {
          prec: valuePrecision,
          pre: " / ",
          dry: true,
        })
      : "";

    addValueDiv(
      resource.value
        ? resource.value(kind)
        : (resource.extra ?? {})[kind] ?? resource.count ?? value,
      "value",
      {
        prec: valuePrecision,
        ref: epoch != undefined && !isNaN(epoch),
        post: denom,
        cls: "value",
      },
    );
  }

  if (!locked && showRawValue) {
    addValueDiv(
      kind && resource.extra ? resource.extra[kind] : resource.count ?? value,
      "raw-value",
      {
        disp: "number",
        prec: rawValuePrecision,
        paren: showValue,
        cls: "raw-value",
      },
    );
  }

  if (
    !locked &&
    showRate &&
    kind === "" &&
    resource.rate != null &&
    (resource._rate?.lastCheck ?? 0) > 0 &&
    (showZeroRates || resource.rate !== 0)
  ) {
    addValueDiv(
      resource.rate /
        (showRatePercentages && resource.rate > 0
          ? resource.value
            ? resource.value()
            : resource.count ?? value ?? 0
          : 1.0),
      "rate",
      {
        disp: showRatePercentages && resource.rate > 0 ? "percentage" : display,
        prec: ratePrecision,
        paren: showValue || showRawValue,
        color: showRateColors,
        len: showRatePercentages || length !== "expanded" ? "tiny" : "compact",
        cls: "rate",
        neg: true,
        zero: true,
        plus: true,
        grp: false,
        post: "/s",
      },
    );
  }

  if (
    !locked &&
    (showExtras || showRawExtras) &&
    kind === "" &&
    Object.keys(resource.extra ?? {}).length > 0
  ) {
    for (let k in resource.extra) {
      if (k.length > 0) {
        if (output.length > 0) {
          output.push(<div className="break" key={`break-${k}`} />);
        }
        output.push(
          <div className="extra-name" key={`extra-name-${k}`}>
            {getWord(k)}
            {infix}
          </div>,
        );
      }

      if (showExtras) {
        addValueDiv(
          resource.value ? resource.value(k) : resource.extra[k],
          `extra-value-${k}`,
          {
            prec: extrasPrecision,
            cls: "extra-value",
          },
        );
      }

      if (showRawExtras) {
        addValueDiv(resource.extra[k], `extra-raw-${k}`, {
          disp: "number",
          prec: rawExtrasPrecision,
          paren: showExtras,
          cls: "raw-extra-value",
        });
      }
    }
  }

  const res = (
    <div className={classNames.join(" ")} style={style}>
      {prefix && <div className="prefix">{prefix}</div>}
      {output}
      {suffix && <div className="suffix">{suffix}</div>}
    </div>
  );

  if (showChrome) {
    return <div>{res}</div>;
  } else {
    return res;
  }
};

const maxLengths = { tiny: 4, compact: 9, expanded: 21 };
const multipliers = { number: 1.0, percentage: 100.0, time: 1000.0 };
const roundMethods = { floor: Math.floor, round: Math.round, ceil: Math.ceil };
const roundNumber = (
  val: number,
  prec: number,
  round: keyof typeof roundMethods,
) => {
  const exp = 10 ** prec;
  return roundMethods[round](val * exp) / exp;
};

export default ResourceRender;
