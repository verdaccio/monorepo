import { Config as ConfigFile, ConfigBuilder } from '@verdaccio/config';
import { Config } from '@verdaccio/types';

export function getDefaultConfig(storage = './test-storage') {
  const builder = ConfigBuilder.build();
  builder.addStorage(storage);
  builder.addAuth({
    htpasswd: {
      file: './htpasswd',
      max_users: 1000,
    },
  });
  builder.addPackageAccess('@scope/*', {
    access: ['$all'],
    publish: ['$authenticated'],
    proxy: [],
    storage: 'private_scoped_storage',
  });
  builder.addPackageAccess('@*/*', {
    access: ['$all'],
    publish: ['$authenticated'],
    proxy: [],
  });
  builder.addPackageAccess('pk1', {
    access: ['$all'],
    publish: ['$authenticated'],
    storage: 'private_storage',
    proxy: [],
  });
  builder.addPackageAccess('**', {
    access: [],
    publish: [],
    proxy: [],
  });
  builder.addLogger({
    type: 'stdout',
    format: 'pretty',
    level: 35,
  });
  return builder.getConfig();
}

export function getConfig(config: Config) {
  const instance = new ConfigFile(config);
  return instance;
}
