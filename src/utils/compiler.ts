export function compileInlineFunction<A extends any[], R>(
  body: string,
  thisBind?: any,
  args: string[] = [],
  globals: Record<string, any> = {},
  reserved: string[] = [],
  forceArgs = false,
  forceGlobals = false,
): (...args: A) => R {
  let fnBody = body.replace(/\b\w+\b/gim, function (token) {
    if (!token || token === "this" || reserved.includes(token)) {
      return token;
    } else if (args.includes(token)) {
      forceArgs = true;
      return "___param_" + token;
    } else if (globals[token]) {
      forceGlobals = true;
      return "___globals." + token;
    } else {
      return token;
    }
  });

  if (forceArgs) {
    fnBody = `(function (${args
      .map((arg) => "___param_" + arg)
      .join(",")}) { return ${fnBody}; })`;
  }

  if (forceGlobals) {
    fnBody = `(function (___globals) { return (${fnBody}); })`;
  }

  let fn = eval(fnBody);
  if (thisBind) {
    fn = fn.bind(thisBind);
  }

  if (forceGlobals) {
    fn = fn(globals);
    if (thisBind && forceArgs) {
      fn = fn.bind(thisBind);
    }
  }

  if (typeof fn !== "function") {
    if (!forceArgs) {
      return compileInlineFunction(
        body,
        thisBind,
        args,
        globals,
        reserved,
        true,
        forceGlobals,
      );
    } else {
      return () => fn;
    }
  } else {
    return fn;
  }
}
