import { MouseEvent } from "react";

import { getBuyAmount } from "../model/GameFormulas";
import { Resource, ResourceCount, scaleResources } from "../model/Resource";
import apply from "../utils/apply";
import clamp from "../utils/clamp";
import useGameContext from "./GameContext";
import ResourceRender from "./ResourceRender";

export type BuyButtonProps = {
  resource: string | Resource<any, any>;
  kind?: string;
  enabled?: boolean;

  count?: number;
  maxCount?: number;
  allowUnlocking?: boolean;

  maxNum?: number;
  minNum?: number;
  increment?: number;

  gainMultiplier?: number;
  costMultiplier?: number;

  prefix?: string;
  suffix?: string;
  infix?: string;
  and?: string;

  className?: string;
  style?: React.CSSProperties;

  onPurchase?: (
    resource: Resource<any, any>,
    kind?: string,
    bought?: number,
  ) => void;
};

export default function BuyButton({
  resource: resProp,
  kind,
  enabled = true,

  count: overrideCount,
  maxCount,
  allowUnlocking = false,

  maxNum,
  minNum,
  increment,

  gainMultiplier = 1,
  costMultiplier = 1,

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
  const res = resourceManager.get(resProp);
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

  function renderResourceCounts(
    rcs: ResourceCount<any, any>[],
    multiplier: number,
  ) {
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
    if (!enabled || count < 1) {
      return;
    }

    if (!(res.unlocked ?? true) && allowUnlocking) {
      res.unlocked = true;
    }

    const bought = res.buy(count, "partial", kind);
    let gainCount = bought.count;
    if (gainMultiplier != 1) {
      const adjustment = resourceManager.purchase(
        scaleResources(bought.gain, gainMultiplier - 1),
        "free",
      );
      gainCount += adjustment.count;
    }
    if (costMultiplier != 1) {
      resourceManager.purchase(
        scaleResources(bought.cost, 1 - costMultiplier),
        "free",
      );
    }

    if (onPurchase) {
      onPurchase(res, kind, gainCount);
    }
  }

  function adjustCount(count = 0, increment = 1) {
    const currentCount = overrideCount ?? res.count;
    return clamp(
      Math.floor((currentCount + count) / increment) * increment - currentCount,
      0,
      Math.min(maxCount ?? Infinity, res.maxCount ?? Infinity) - currentCount,
    );
  }

  let active = true;
  let purchase = res.buy(adjustCount(maxNum, increment), "dry-partial", kind);
  if (purchase.count % increment !== 0) {
    purchase = res.buy(
      adjustCount(purchase.count, increment),
      "dry-partial",
      kind,
    );
  }
  if (purchase.count < minNum || purchase.count <= 0) {
    purchase = res.buy(
      Math.max(1, adjustCount(clamp(increment, minNum, maxNum))),
      "dry-full",
      kind,
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
      {totalCost > 0 && infix && <div className="infix">{infix}</div>}
      {totalCost > 0 && renderResourceCounts(purchase.cost, -costMultiplier)}
      {suffix && <div className="suffix">{suffix}</div>}
    </button>
  );
}
