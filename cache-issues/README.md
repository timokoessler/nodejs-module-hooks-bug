# Cache issues

The following exceptions occur under certain conditions if a source string is returned for a CommonJS module in the asynchronous `load` hook.
The reason for providing a source string is to work around this Node.js issue: [nodejs/node#57327](https://github.com/nodejs/node/issues/57327). By applying the following fix to `import-in-the-middle`, I was able to run an app that uses Sentry toegether with the synchronous module customization hooks. However, this led to different issues.

```js
export async function load(url, context, nextLoad) {
  const result = await nextLoad(url, context);

  if (result.format === "commonjs" && !result.source) {
    result.source = readFileSync(fileURLToPath(url), "utf8");
  }

  return result;
}
```

## Exception 1

In case require(esm) is used.

Run `node --import ./sample-1/instrument.js ./sample-1/app.cjs`

```
node:internal/modules/esm/translators:152
    return cjsCache.get(job.url).exports;
                                ^

TypeError: Cannot read properties of undefined (reading 'exports')
    at require (node:internal/modules/esm/translators:152:33)
    at Object.<anonymous> (/Users/timokoessler/Git/nodejs-module-hooks-bug/cache-issues/sample-1/app.cjs:1:1)
    at loadCJSModule (node:internal/modules/esm/translators:166:3)
    at ModuleWrap.<anonymous> (node:internal/modules/esm/translators:208:7)
    at ModuleJob.run (node:internal/modules/esm/module_job:365:25)
    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:665:26)
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:99:5)

Node.js v24.3.0
```

## Exception 2

Check out the PR [nodejs/import-in-the-middle#202](https://github.com/nodejs/import-in-the-middle/pull/202) and run e.g `npx imhotap --files test/register/v18.19-experimental-patch-internals.mjs`.

```
node:internal/modules/esm/module_job:325
      this.module.async = this.module.instantiateSync();
                                      ^

Error: request for
'file:///Users/timokoessler/Git/import-in-the-middle/lib/register.js' is not
in cache
    at ModuleJob.runSync (node:internal/modules/esm/module_job:325:39)
    at require (node:internal/modules/esm/translators:151:9)
    at Object.<anonymous> (/Users/timokoessler/Git/import-in-the-middle/node_modules/c8/index.js:1:18)
    at loadCJSModule (node:internal/modules/esm/translators:166:3)
    at ModuleWrap.<anonymous> (node:internal/modules/esm/translators:208:7)
    at ModuleJob.run (node:internal/modules/esm/module_job:365:25)
    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:665:26)
    at async file:///Users/timokoessler/Git/import-in-the-middle/test/register/v18.19-experimental-patch-internals.mjs:12:20 {
  code: 'ERR_VM_MODULE_LINK_FAILURE'
}

Node.js v24.3.0
```
