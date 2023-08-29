import { Config } from '@verdaccio/config';

const configInstance = new Config({
  storage: './test-storage',
  htpasswd: {
    file: './htpasswd',
    max_users: 1000,
  },
  uplinks: {
    npmjs: {
      url: 'https://registry.npmjs.org',
      cache: true,
    },
  },
  packages: {
    '@*/*': {
      access: ['$all'],
      publish: ['$authenticated'],
      proxy: [],
    },
    'local-private-custom-storage': {
      access: ['$all'],
      publish: ['$authenticated'],
      storage: 'private_folder',
    },
    '*': {
      access: ['$all'],
      publish: ['$authenticated'],
      proxy: ['npmjs'],
    },
    '**': {
      access: [],
      publish: [],
      proxy: [],
    },
  },
  logs: {
    type: 'stdout',
    format: 'pretty',
    level: 35,
  },
  self_path: './tests/__fixtures__/config.yaml',
});

export default configInstance;
