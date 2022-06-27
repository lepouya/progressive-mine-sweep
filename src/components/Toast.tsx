// Inspired by github:Cogoport/cogo-toast

import { MouseEventHandler, useEffect, useState } from "react";
import { createRoot, Root } from "react-dom/client";

import { getHTMLElement } from "../utils/document";
import { Expansion, KeysUnion } from "../utils/types";
import Icon, { IconProps } from "./Icon";

export type ToastOptions = {
  id?: number;

  heading?: string;
  icon?: string | IconProps;
  message?: string | JSX.Element;

  position?: KeysUnion<keyof typeof rows, keyof typeof groups>;
  duration?: number;
  type?: keyof typeof icons;

  onClick?: MouseEventHandler;
  onHide?: (toast: ToastOptions) => void;

  className?: string;
};

export default function toast(props?: ToastOptions | string) {
  return genToast(typeof props === "string" ? { message: props } : props ?? {});
}
toast.info = (message: string, options?: ToastOptions) =>
  genToast({ ...options, message, type: "info" });
toast.success = (message: string, options?: ToastOptions) =>
  genToast({ ...options, message, type: "success" });
toast.fail = (message: string, options?: ToastOptions) =>
  genToast({ ...options, message, type: "fail" });

const rows = { top: "top", bottom: "bottom" };
const groups = { left: "left", center: "center", right: "right" };
const icons = {
  info: "info-circle",
  success: "circle-check",
  fail: "alert-circle",
};
let all_toasts: Expansion<string, ToastOptions[]>;
let root: Root;
let idx = 0;

window.addEventListener(
  "load",
  () => (root = createRoot(getHTMLElement("toasts-root"))),
  false,
);

function genToast(options: ToastOptions) {
  options = options ?? {};
  options.id = options.id ?? idx++;

  const position = options.position ?? "top-right";
  all_toasts = all_toasts ?? {};
  all_toasts[position] = all_toasts[position] ?? [];
  if (position.includes("bottom")) {
    all_toasts[position].unshift(options);
  } else {
    all_toasts[position].push(options);
  }

  const onToastHide = options.onHide;
  options.onHide = (toast) => {
    const position = toast.position ?? "top-right";
    all_toasts[position] = all_toasts[position].filter(
      (item) => item.id !== toast.id,
    );
    if (onToastHide) {
      onToastHide(toast);
    }
  };

  root.render(
    Object.keys(rows).map((row) => (
      <div key={row} className={`row ${row}`}>
        {Object.keys(groups).map((group) => {
          const type = `${row}-${group}`;
          return (
            <div key={type} className={`group ${group}`}>
              {(all_toasts[type] ?? []).map((toast) => (
                <Toast key={`toast_${type}_${toast.id}`} {...toast} />
              ))}
            </div>
          );
        })}
      </div>
    )),
  );

  return {
    ...new Promise((resolve) =>
      setTimeout(resolve, (options.duration ?? 3) * 1000),
    ),
    hide: () => (options.onHide ? options.onHide(options) : {}),
  };
}

function Toast(props: ToastOptions) {
  const [shown, setShown] = useState("hidden");

  function hide() {
    setShown("hidden");
    setTimeout(() => {
      if (props.onHide) {
        props.onHide(props);
      }
    }, 300);
  }

  useEffect(() => {
    const animTimeout = setTimeout(() => setShown("shown"), 50);
    const hideTimeout = setTimeout(() => {
      if (props.duration !== 0) {
        hide();
      }
    }, (props.duration ?? 3) * 1000);

    return () => {
      clearTimeout(animTimeout);
      clearTimeout(hideTimeout);
    };
  }, []);

  const icon =
    typeof props.icon === "object"
      ? props.icon
      : props.icon
      ? { icon: props.icon }
      : props.type
      ? { icon: icons[props.type] }
      : undefined;
  const classNames = ["toast", shown, props.type, props.className]
    .filter((s) => !!s)
    .join(" ");

  return (
    <div className={classNames} onClick={props.onClick ?? hide}>
      {icon && <Icon {...icon} />}
      <div>
        {props.heading && <h4>{props.heading}</h4>}
        {props.message && <div className="message">{props.message}</div>}
      </div>
    </div>
  );
}
