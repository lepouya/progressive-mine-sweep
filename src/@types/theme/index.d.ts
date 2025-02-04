import { AriaAttributes, CSSProperties, DOMAttributes } from "react";

declare module "react" {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    theme?: string;
  }
  interface CSSProperties {
    [key: `--${string}`]: string | number | boolean | undefined;
  }
}
