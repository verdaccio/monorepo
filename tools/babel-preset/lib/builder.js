const MIN_NODE_VERSION = '8.15';
const DOCKER_NODE_VERSION = '10';
const BROWSER_TARGETS = {
  browsers: ['last 5 versions', 'FireFox >= 44', 'Safari >= 7', 'Explorer 11', 'last 4 Edge versions'],
};

const defaultPresets = (node = MIN_NODE_VERSION) => [
  [
    '@babel/env',
    {
      targets: { node },
    },
  ],
];

const reactPreset = ['@babel/react'];

const defaultPlugins = ['@babel/proposal-class-properties', '@babel/proposal-object-rest-spread'];

const typescriptRequirements = {
  presets: ['@babel/typescript'],
  plugins: ['@babel/proposal-nullish-coalescing-operator', '@babel/proposal-optional-chaining'],
};

const getTranspiler = () => {
  return typescriptRequirements;
};

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
module.exports = (api, opts, env, isPro) => {
  // see docs about api at https://babeljs.io/docs/en/config-files#apicache
  api.assertVersion('^7.0.0');
  const minNodeVersion = opts.node || MIN_NODE_VERSION;
  if (opts.debug) {
    /* eslint no-console: 0 */
    console.log('minNodeVersion:', minNodeVersion);
  }
  const transpiler = getTranspiler();

  if (env === 'ui') {
    return {
      presets: [['@babel/env', { targets: BROWSER_TARGETS }]].concat(reactPreset).concat(transpiler.presets),
      plugins: defaultPlugins.concat([
        'react-hot-loader/babel',
        '@babel/transform-runtime',
        '@babel/syntax-dynamic-import',
        'emotion',
      ]),
    };
  } else if (env === 'test') {
    return {
      presets: defaultPresets(minNodeVersion).concat(reactPreset).concat(transpiler.presets),
      plugins: defaultPlugins.concat(transpiler.plugins).concat(['babel-plugin-dynamic-import-node', 'emotion']),
    };
  } else if (env === 'docker') {
    return {
      presets: [['@babel/env', { targets: { node: DOCKER_NODE_VERSION } }]].concat(transpiler.presets),
      plugins: defaultPlugins.concat(transpiler.plugins),
    };
  } else {
    // registry or something else
    return {
      presets: defaultPresets(minNodeVersion).concat(transpiler.presets),
      plugins: defaultPlugins.concat(transpiler.plugins),
    };
  }
};
