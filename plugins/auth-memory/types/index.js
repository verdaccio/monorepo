import type { Config } from '@verdaccio/types';

export interface VerdaccioConfigAuthMemory extends Config {
  [users: string]: {
    [name: string]: {
      name: string,
      password: string
    }
  };
}

export interface VerdaccioConfigApp extends Config {
  max_users: number;
}
