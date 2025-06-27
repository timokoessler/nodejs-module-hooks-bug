# Node.js Module Hooks Bug

This repository is a minimal reproduction of a bug in the Node.js module customization hooks.

The bug occurs when using the old async `module.register` and the new sync `module.registerHooks` hooks together and CJS is used in the project.
The error does not occur when you execute the same command in the `esm-only` directory.

## Steps to reproduce

1. Clone this repository
2. Use Node.js v23.5.0 or later
3. Run `node --import ./instrument.js ./app.js`

## Real world cases where this bug occurs

- Using a test runner that uses `module.register` with an app that uses `module.registerHooks` (e.g. tapjs)
- Using two instrumentation libraries, one using `module.register` (e.g. Sentry) and the other using `module.registerHooks`

## More information

- The error does not occur when only ESM is used in the project
- The error does not occur when only one of the register methods is used

## Stack trace

```
node --import ./instrument.js ./app.js
node:internal/modules/customization_hooks:276
    throw new ERR_INVALID_RETURN_PROPERTY_VALUE(
          ^

TypeError [ERR_INVALID_RETURN_PROPERTY_VALUE]: Expected a string, an ArrayBuffer, or a TypedArray to be returned for the "source" from the "load" hook but got null.
    at validateLoad (node:internal/modules/customization_hooks:276:11)
    at nextStep (node:internal/modules/customization_hooks:190:14)
    at load (file:///Users/timokoessler/Git/nodejs-module-hooks-bug/instrument.js:5:12)
    at nextStep (node:internal/modules/customization_hooks:185:26)
    at loadWithHooks (node:internal/modules/customization_hooks:348:18)
    at #loadSync (node:internal/modules/esm/loader:790:14)
    at ModuleLoader.load (node:internal/modules/esm/loader:749:28)
    at ModuleLoader.loadAndTranslate (node:internal/modules/esm/loader:536:43)
    at #createModuleJob (node:internal/modules/esm/loader:560:36)
    at #getJobFromResolveResult (node:internal/modules/esm/loader:312:34) {
  code: 'ERR_INVALID_RETURN_PROPERTY_VALUE'
}
```
