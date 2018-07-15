const config = {
  user_agent: 'string',
  server_id: 1234,
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
  checkSecretKey: token => '1234',
  hasProxyTo: (pkg, upLink) => false
};

export default config;
