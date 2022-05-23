import React from "react";
import { Resource, ResourceCount, scaleResources } from "../model/Resource";

import useGameContext from "./GameContext";
import ResourceRender from "./ResourceRender";

const BuyButton: React.FC<{
  resource: string | Resource;
  kind?: string;
  enabled?: boolean;

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

  onPurchase?: (resource: Resource, kind?: string, bought?: number) => void;
}> = ({
  resource: resProp,
  kind,
  enabled = true,

  maxNum = 1,
  minNum = 1,
  increment = 1,

  gainMultiplier = 1,
  costMultiplier = 1,

  prefix = "Buy",
  suffix = "",
  infix = "for",
  and = "&",

  className,
  style,
  onPurchase,
}) => {
  const { resource, resourceManager } = useGameContext();
  const res = resource(resProp);

  function renderResourceCounts(
    rcs: ResourceCount[],
    multiplier: number,
    showPlusSign?: boolean,
    reversedDirection?: boolean,
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
        infix={""}
        prefix={i > 0 ? and : ""}
        showLocked={true}
        showColors={true}
        showChrome={true}
        showPlusSign={showPlusSign}
        className={"value-first"}
        key={typeof rc.resource === "string" ? rc.resource : rc.resource.name}
        reversedDirection={reversedDirection}
      />
    ));
  }

  function adjustCount(count = 0) {
    return Math.max(
      0,
      Math.floor((res.count + count) / increment) * increment - res.count,
    );
  }

  function doPurchase(count = 0) {
    if (!enabled || count < 1) {
      return;
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
      onPurchase(res, kind, purchase.count + gainCount);
    }
  }

  let active = true;
  let purchase = res.buy(adjustCount(maxNum), "dry-partial", kind);
  if (purchase.count % increment !== 0) {
    purchase = res.buy(adjustCount(purchase.count), "dry-partial", kind);
  }
  if (purchase.count < minNum) {
    purchase = res.buy(adjustCount(maxNum), "dry-full", kind);
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
      onClick={() => doPurchase(active && enabled ? purchase.count : 0)}
      disabled={!active || !enabled}
      className={classNames.join(" ")}
      style={style}
    >
      {prefix && <div className="prefix">{prefix}</div>}
      {renderResourceCounts(purchase.gain, gainMultiplier, true, false)}
      {totalCost > 0 && infix && <div className="infix">{infix}</div>}
      {totalCost > 0 &&
        renderResourceCounts(purchase.cost, costMultiplier, false, true)}
      {suffix && <div className="suffix">{suffix}</div>}
    </button>
  );
};

export default BuyButton;
