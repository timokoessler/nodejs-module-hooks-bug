import * as mod from "module";

/*mod.registerHooks({
  load(url, context, nextLoad) {
    return nextLoad(url, context);
  },
});*/

mod.register(new URL("hooks.js", import.meta.url).toString());
