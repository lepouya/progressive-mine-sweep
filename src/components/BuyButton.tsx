import { MouseEvent } from "react";

import { getBuyAmount } from "../model/GameFormulas";
import { Resource, ResourceCount } from "../model/Resource";
import apply from "../utils/apply";
import clamp from "../utils/clamp";
import useGameContext from "./GameContext";
import ResourceRender from "./ResourceRender";

export type BuyButtonProps = {
  resource: string | Resource;
  kind?: string;
  enabled?: boolean;
  allowUnlocking?: boolean;

  maxNum?: number;
  minNum?: number;
  increment?: number;
  precision?: number;

  gainMultiplier?: number;
  costMultiplier?: number;
  mode?: "buy" | "sell";

  overrideCount?: number;
  overrideMaxCount?: number;
  overrideMinCount?: number;

  prefix?: string;
  suffix?: string;
  infix?: string;
  and?: string;

  className?: string;
  style?: React.CSSProperties;

  onPurchase?: (
    resource: Resource,
    kind: string | undefined,
    bought: number,
  ) => void;
};

export default function BuyButton({
  resource,
  kind,
  enabled = true,
  allowUnlocking = false,

  maxNum,
  minNum,
  increment,
  precision = 0,

  gainMultiplier = 1,
  costMultiplier = 1,
  mode = "buy",

  overrideCount,
  overrideMaxCount,
  overrideMinCount,

  prefix = "Buy",
  suffix = "",
  infix = "for",
  and = "&",

  className,
  style,
  onPurchase,
}: BuyButtonProps) {
  const {
    resourceManager,
    settings: { buyAmount },
  } = useGameContext();
  const res = resourceManager.get(resource);
  const buyAmounts = getBuyAmount(buyAmount);
  minNum ??= buyAmounts.min;
  maxNum ??= buyAmounts.max;
  increment ??= buyAmounts.inc;

  if (!(res.unlocked ?? true)) {
    if (allowUnlocking) {
      minNum = maxNum = increment = 1;
    } else {
      minNum = maxNum = increment = 0;
      enabled = false;
    }
  }

  if (mode === "sell") {
    [minNum, maxNum, increment] = [-minNum, -maxNum, -increment];
  }

  function renderResourceCounts(rcs: ResourceCount[], multiplier: number) {
    return rcs.map((rc, i) => (
      <ResourceRender
        resource={
          typeof rc.resource === "string" ? { name: rc.resource } : rc.resource
        }
        value={rc.count * multiplier}
        kind={rc.kind}
        display={
          typeof rc.resource !== "string" ? rc.resource.display : "number"
        }
        precision={precision}
        infix=""
        placeholder=""
        prefix={i > 0 ? and : ""}
        showLocked={allowUnlocking}
        showValue={
          typeof rc.resource === "string" ? true : rc.resource.unlocked ?? true
        }
        showColors={true}
        showChrome={true}
        showPlusSign={true}
        className="value-first"
        key={typeof rc.resource === "string" ? rc.resource : rc.resource.name}
      />
    ));
  }

  function doPurchase(count: number, event: MouseEvent) {
    event.preventDefault();
    if (!enabled || count === 0) {
      return;
    }
    if (!(res.unlocked ?? true) && allowUnlocking) {
      res.unlocked = true;
    }

    const bought = res.buy(
      count,
      "partial",
      kind,
      gainMultiplier,
      costMultiplier,
    );
    if (onPurchase && bought.gain.length > 0) {
      onPurchase(res, kind, bought.gain[0].count);
    }
  }

  function adjustCount(count = 0) {
    const currentCount = overrideCount ?? res.value(kind);
    return (
      clamp(
        Math.floor((currentCount + count) / (increment ?? 1)) *
          (increment ?? 1),
        Math.max(overrideMinCount ?? -Infinity, res.minCount ?? 0),
        Math.min(overrideMaxCount ?? Infinity, res.maxCount ?? Infinity),
      ) - currentCount
    );
  }

  let active = true;
  let purchase = res.buy(
    adjustCount(maxNum),
    "dry-partial",
    kind,
    gainMultiplier,
    costMultiplier,
  );
  if (purchase.count % increment !== 0) {
    purchase = res.buy(
      adjustCount(purchase.count),
      "dry-partial",
      kind,
      gainMultiplier,
      costMultiplier,
    );
  }
  if (
    (minNum >= 0 && purchase.count < minNum) ||
    (minNum < 0 && purchase.count > minNum) ||
    purchase.count === 0
  ) {
    const adjusted = adjustCount(
      clamp(increment, Math.min(minNum, maxNum), Math.max(minNum, maxNum)),
    );
    purchase = res.buy(
      Math.abs(adjusted) < 1 ? Math.sign(increment) : adjusted,
      "dry-full",
      kind,
      gainMultiplier,
      costMultiplier,
    );
    active = false;
  }

  if (!enabled) {
    purchase.cost = [];
  }
  const totalCost = purchase.cost.reduce((tot, rc) => (tot += rc.count), 0);

  const classNames = [
    "buy-button",
    `buy-button-${active ? "" : "un"}affordable`,
    className,
  ].filter((s) => !!s);

  return (
    <button
      onClick={apply(doPurchase, active && enabled ? purchase.count : 0)}
      disabled={!active || !enabled}
      className={classNames.join(" ")}
      style={style}
      id={`button-buy-${res.name}`}
    >
      {prefix && <div className="prefix">{prefix}</div>}
      {renderResourceCounts(purchase.gain, 1)}
      {totalCost !== 0 && infix && <div className="infix">{infix}</div>}
      {totalCost !== 0 && renderResourceCounts(purchase.cost, -1)}
      {suffix && <div className="suffix">{suffix}</div>}
    </button>
  );
}
