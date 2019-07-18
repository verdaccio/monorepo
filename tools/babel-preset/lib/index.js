"use strict";

const builder = require("./builder");

module.exports = (api, opts) => {
  const babelEnv = process.env.BABEL_ENV;
  const isPro = process.env.NODE_ENV || false;
  const presets = builder(api, opts, babelEnv, isPro);

  if (opts.debug) {
    /* eslint-disable no-console */
    console.log(JSON.stringify(presets, null, 4));
    /* eslint-enable no-console */
  }

  return presets;
};
