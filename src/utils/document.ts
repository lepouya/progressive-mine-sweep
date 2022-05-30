import assign from "./assign";

export default function getHTMLElement(
  param: Partial<HTMLElement> | string,
): HTMLElement {
  const opts = typeof param === "string" ? { id: param } : param;

  let elem = document.getElementById(opts.id ?? "");
  if (!elem) {
    elem = document.createElement(opts.tagName ?? "div");
    document.body.appendChild(elem);
  }

  let k: keyof HTMLElement;
  for (k in opts) {
    assign(elem, k, opts[k]);
  }

  return elem;
}
