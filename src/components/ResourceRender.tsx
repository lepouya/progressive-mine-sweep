import { Resource } from "../model/Resource";
import { formatNumber, formatTime, formatWord } from "../utils/format";
import round, { roundMethods } from "../utils/round";
import Icon from "./Icon";

const maxLengths = { tiny: 4, compact: 9, expanded: 21 };
const multipliers = { number: 1.0, percentage: 1.0, time: 1000.0 };

export type ResourceRenderProps = {
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
  showRateHistory?: boolean;
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
};

export default function ResourceRender({
  value,
  epoch,
  name,
  resource = { name, count: value },
  kind = undefined,
  display = resource.display ?? "number",
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
  showRateHistory = false,
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
}: ResourceRenderProps) {
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
    const value = round(
      (num - (ref && epoch ? epoch : 0)) * multipliers[disp],
      prec,
      rnd,
    );
    if (isNaN(value) || (!neg && value < 0) || (!zero && value === 0)) {
      return "";
    }

    const classes = [disp.toString()];
    if (!!cls) {
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
        res = formatTime(value, len, prec > 0, sep, now, never, ago);
      } else {
        res = formatTime(value, len, prec > 0);
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

  const classNames = ["resource"];
  const adjustedValue =
    value ??
    (resource.value ? resource.value(kind) : undefined) ??
    (resource.extra ?? {})[kind ?? ""] ??
    resource.count;

  if ((showIcon && resource.icon) || (showName && resource.name)) {
    output.push(
      <div className="name" key="name">
        {showIcon && resource.icon && resource.icon.length > 0 ? (
          <Icon icon={resource.icon} size="1em" />
        ) : null}
        {formatWord(
          name,
          {
            count: round(
              adjustedValue * multipliers[display],
              valuePrecision,
              rounding,
            ),
            name: resource.name,
            singularName: resource.singularName,
            pluralName: resource.pluralName,
          },
          {
            condition: showName,
            allowEmpties: false,
            capitalize: showCapitalized,
          },
        )}
        {infix}
      </div>,
    );
  }

  if (showValue) {
    const denom = showMaxValue
      ? addValueDiv(resource.maxCount, "denominator", {
          prec: valuePrecision,
          pre: " / ",
          dry: true,
        })
      : "";

    addValueDiv(adjustedValue, "value", {
      prec: valuePrecision,
      ref: epoch != undefined && !isNaN(epoch),
      post: denom,
      cls: "value",
    });
  }

  if (showRawValue) {
    addValueDiv(
      value ?? (kind && resource.extra ? resource.extra[kind] : resource.count),
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
    showRate &&
    !kind &&
    resource.rate != null &&
    (resource.rate.lastCountUpdate ?? 0) > 0 &&
    (showZeroRates || resource.rate.count !== 0)
  ) {
    let rate = 0;
    if (showRateHistory && resource.rate.pastCounts.length > 0) {
      let denom = 0;
      let length = resource.rate.pastCounts.length;
      resource.rate.pastCounts.forEach((pastRate, rateIdx) => {
        const weight = length - rateIdx;
        rate += pastRate * weight;
        denom += weight;
      });
      rate /= denom;
    } else {
      rate = resource.rate.count;
    }

    let usePercentage = showRatePercentages;
    let rateDenom = showRatePercentages ? adjustedValue : 1;
    if (
      rateDenom === 0 ||
      (usePercentage && (rate / rateDenom < 0.01 || rateDenom < 1000))
    ) {
      usePercentage = false;
      rateDenom = 1.0;
    }

    addValueDiv(rate / rateDenom, "rate", {
      disp: usePercentage ? "percentage" : display,
      prec: ratePrecision,
      paren: showValue || showRawValue,
      color: showRateColors,
      len: usePercentage || length !== "expanded" ? "tiny" : "compact",
      cls: "rate",
      neg: true,
      zero: true,
      plus: true,
      grp: false,
      post: "/s",
    });
  }

  if (
    (showExtras || showRawExtras) &&
    !kind &&
    resource.extra &&
    Object.keys(resource.extra).length > 0
  ) {
    for (let k in resource.extra) {
      if (k.length > 0) {
        if (output.length > 0) {
          output.push(<div className="break" key={`break-${k}`} />);
        }
        output.push(
          <div className="extra-name" key={`extra-name-${k}`}>
            {formatWord(k, undefined, {
              capitalize: showCapitalized,
            })}
            {infix}
          </div>,
        );
      }

      if (showExtras) {
        addValueDiv(
          resource.value ? resource.value(k) : resource.extra[k],
          `extra-value-${k}`,
          {
            disp: k.toLowerCase().indexOf("time") >= 0 ? "time" : display,
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

      if (
        showRate &&
        resource.rate != null &&
        (resource.rate.lastCountUpdate ?? 0) > 0 &&
        (showZeroRates || resource.rate.count !== 0)
      ) {
        output.push(
          <div key={`extra-rate-${k}`} className="rate">
            {placeholder}
          </div>,
        );
      }
    }
  }

  if (!showLocked && !(resource.unlocked ?? true)) {
    classNames.push("locked");
    output.splice(
      0,
      output.length,
      <div className="placeholder" key="lock">
        {placeholder}
      </div>,
    );
  }

  const resStyle = showChrome ? undefined : style;
  if (!!className && !showChrome) {
    classNames.push(className);
  }
  const res = (
    <div
      className={classNames.join(" ")}
      style={resStyle}
      id={`resource-${name ?? resource.name}`}
    >
      {prefix && <div className="prefix">{prefix}</div>}
      {output}
      {suffix && <div className="suffix">{suffix}</div>}
    </div>
  );

  if (showChrome) {
    return (
      <div
        className={!className ? undefined : className}
        style={style}
        id={`resource-chrome-${name ?? resource.name}`}
      >
        {res}
      </div>
    );
  } else {
    return res;
  }
}
