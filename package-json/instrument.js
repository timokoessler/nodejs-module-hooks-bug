const mod = require("module");

mod.registerHooks({
  load(url, context, nextLoad) {
    const result = nextLoad(url, context);
    if (context.format === "json") {
      // We don't want to modify the JSON file
      return result;
    }

    // In real life we would extract the path to the package from the url and read the root package.json
    console.log(
      `Patching package with version ${require("./package.json").version}`
    );

    return result;
  },
});
