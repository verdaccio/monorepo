const r = m => require.resolve(m)

function preset(context, options = {}) {
  const { browser = false, debug = false } = options
  const { NODE_ENV, BABEL_ENV } = process.env

  const PRODUCTION = (BABEL_ENV || NODE_ENV) === "production"

  const targetConfig = {
    targets: {
      node: 6.0,
    },
  }

  return {
    presets: [
      [
        r("babel-preset-env"),
				targetConfig
        ),
      ],
      r("babel-preset-flow"),
    ]
  }
}

module.exports = preset;
