// @flow

import type { ConfigMemory } from '../../src/local-memory';

const config: ConfigMemory = {
  user_agent: 'string',
  server_id: 1234,
  storage: './home',
  secret: '12345',
  self_path: './nowhere',
  uplinks: {
    npmjs: {
      url: 'https://registry.npmjs.org/'
    }
  },
  packages: {
    test: {
      storage: '',
      publish: '',
      proxy: '',
      access: ''
    }
  },
  web: {
    enable: true,
    title: 'string',
    logo: 'string'
  },
  logs: [],
  auth: {},
  notifications: {
    method: '',
    packagePattern: /a/,
    packagePatternFlags: '',
    headers: {},
    endpoint: '',
    content: ''
  },
  checkSecretKey: (token: string) => '1234',
  hasProxyTo: (pkg: string, upLink: string) => false
};

export default config;
