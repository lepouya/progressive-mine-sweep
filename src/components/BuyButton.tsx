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

  overrideCount?: number;
  overrideMaxCount?: number;
  overrideMinCount?: number;

  prefix?: string;
  suffix?: string;
  infix?: string;
  and?: string;

  className?: string;
  style?: React.CSSProperties;

  onPurchase?: (resource: Resource, kind?: string, bought?: number) => void;
};

export default function BuyButton({
  resource,
  kind,
  enabled = true,
  allowUnlocking = false,

  maxNum,
  minNum,
  increment,
  precision,

  gainMultiplier = 1,
  costMultiplier = 1,

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

  if (gainMultiplier < 0 && costMultiplier < 0) {
    // Selling
    [gainMultiplier, costMultiplier] = [-gainMultiplier, -costMultiplier];
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
    if (onPurchase) {
      onPurchase(res, kind, bought.count);
    }
  }

  function adjustCount(count = 0, increment = 1) {
    const currentCount = overrideCount ?? res.count;
    return (
      clamp(
        Math.floor((currentCount + count) / increment) * increment,
        Math.max(overrideMinCount ?? -Infinity, res.minCount ?? 0),
        Math.min(overrideMaxCount ?? Infinity, res.maxCount ?? Infinity),
      ) - currentCount
    );
  }

  let active = true;
  let purchase = res.buy(
    adjustCount(maxNum, increment),
    "dry-partial",
    kind,
    1,
    costMultiplier,
  );
  if (purchase.count % increment !== 0) {
    purchase = res.buy(
      adjustCount(purchase.count, increment),
      "dry-partial",
      kind,
      1,
      costMultiplier,
    );
  }
  if (Math.abs(purchase.count) < Math.abs(minNum) || purchase.count === 0) {
    purchase = res.buy(
      Math.max(
        Math.sign(increment),
        adjustCount(
          clamp(increment, Math.min(minNum, maxNum), Math.max(minNum, maxNum)),
        ),
      ),
      "dry-full",
      kind,
      1,
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
      {renderResourceCounts(purchase.gain, gainMultiplier)}
      {totalCost !== 0 && infix && <div className="infix">{infix}</div>}
      {totalCost !== 0 && renderResourceCounts(purchase.cost, -1)}
      {suffix && <div className="suffix">{suffix}</div>}
    </button>
  );
}
