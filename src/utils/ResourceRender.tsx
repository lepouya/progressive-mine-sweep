import React from "react";
import { Resource } from "../model/Resource";
import clamp from "./clamp";
import { formatDuration } from "./TimeDuration";

const ResourceRender: React.FC<{
  resource: Resource;
  kind?: string;
  display?: keyof typeof multipliers;
  length?: keyof typeof maxLengths;
  rounding?: keyof typeof roundMethods;

  showLocked?: boolean;
  showColors?: boolean;
  showRateColors?: boolean;
  showNegatives?: boolean;
  showZeros?: boolean;
  showPlusSign?: boolean;
  showGrouping?: boolean;

  showName?: boolean;
  showValue?: boolean;
  showRawValue?: boolean;
  showRate?: boolean;
  showZeroRates?: boolean;
  showRatePercentages?: boolean;
  showExtras?: boolean;
  showRawExtras?: boolean;

  precision?: number;
  valuePrecision?: number;
  rawValuePrecision?: number;
  ratePrecision?: number;
  extrasPrecision?: number;
  rawExtrasPrecision?: number;

  prefix?: string;
  suffix?: string;
  infix?: string;
  placeholder?: string;

  className?: string;

  reversedDirection?: boolean;
}> = ({
  resource,
  kind = "",
  display = resource.name.toLowerCase().indexOf("time") >= 0
    ? "time"
    : "number",
  length = "expanded",
  rounding = display === "number" ? "floor" : "round",

  showLocked = false,
  showColors = false,
  showRateColors = true,
  showNegatives = true,
  showZeros = true,
  showPlusSign = false,
  showGrouping = display === "number",

  showName = false,
  showValue = true,
  showRawValue = false,
  showRate = false,
  showZeroRates = false,
  showRatePercentages = display === "number",
  showExtras = false,
  showRawExtras = showExtras && showRawValue,

  precision = display === "time" ? 3 : display === "number" ? 2 : 0,
  valuePrecision = precision,
  rawValuePrecision = valuePrecision,
  ratePrecision = display === "time" ? 0 : precision,
  extrasPrecision = precision,
  rawExtrasPrecision = extrasPrecision,

  prefix = "",
  suffix = "",
  infix = ":",
  placeholder = "-",

  className = "",

  reversedDirection = false,
}) => {
  const output: JSX.Element[] = [];
  function addValueDiv(
    num: number,
    key: string,
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
      plh = placeholder,
      rev = reversedDirection,
      paren = false,
      pre = "",
      post = "",
    },
  ): void {
    const value = roundNumber(num * multipliers[disp], prec, rnd);
    if (!isNaN(value) && (neg || value >= 0) && (zero || value !== 0)) {
      const classes = [disp.toString()];
      if (cls.length > 0) {
        classes.push(cls);
      }
      if (color) {
        const v = rev ? -value : +value;
        classes.push(v > 0 ? "positive" : v < 0 ? "negative" : "zero");
      }

      let res = plh;
      if (disp === "number" || disp === "percentage") {
        res = formatNumber(value, maxLengths[len], prec, plus, grp);
        if (disp === "percentage") {
          res += "%";
        }
      } else if (disp === "time") {
        res = formatDuration(value, len, prec > 0);
        if (plus && value >= 0) {
          res = "+" + res;
        }
      }

      res = pre + res + post;
      if (paren) {
        res = "(" + res + ")";
      }

      output.push(
        <div key={key} className={classes.join(" ")}>
          {res}
        </div>,
      );
    }
  }

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

  if (!locked && showName && resource.name.length > 0) {
    output.push(
      <div className="name" key="name">
        {resource.name}
        {infix}
      </div>,
    );
  }

  if (!locked && showValue) {
    addValueDiv(resource.value(kind), "value", {
      prec: valuePrecision,
      cls: "value",
    });
  }

  if (!locked && showRawValue) {
    addValueDiv(kind ? resource.extra[kind] : resource.count, "raw-value", {
      disp: "number",
      prec: rawValuePrecision,
      paren: showValue,
      cls: "raw-value",
    });
  }

  if (
    !locked &&
    showRate &&
    kind === "" &&
    (resource._rate.lastCheck ?? 0) > 0 &&
    (showZeroRates || resource.rate !== 0)
  ) {
    addValueDiv(
      resource.rate /
        (showRatePercentages && resource.rate > 0 ? resource.value() : 1.0),
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
    Object.keys(resource.extra).length > 0
  ) {
    for (let k in resource.extra) {
      if (k.length > 0) {
        if (output.length > 0) {
          output.push(<div className="break" key={"break-" + k} />);
        }
        output.push(
          <div className="extra-name" key={"extra-name-" + k}>
            {k}
            {infix}
          </div>,
        );
      }

      if (showExtras) {
        addValueDiv(resource.value(k), "extra-value-" + k, {
          prec: extrasPrecision,
          cls: "extra-value",
        });
      }

      if (showRawExtras) {
        addValueDiv(resource.extra[k], "extra-raw-" + k, {
          disp: "number",
          prec: rawExtrasPrecision,
          paren: showExtras,
          cls: "raw-extra-value",
        });
      }
    }
  }

  return (
    <div className={classNames.join(" ")}>
      {prefix && <div className="prefix">{prefix}</div>}
      {output}
      {suffix && <div className="suffix">{suffix}</div>}
    </div>
  );
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
  if (res.length > len) {
    options.notation = "scientific";
    return val.toLocaleString(undefined, options);
  } else {
    return res;
  }
}

export default ResourceRender;
