// @flow

import type { Config } from '@verdaccio/types';

export type UserMemory = {
  name: string,
  password: string
};

export type Users = {
  [key: string]: UserMemory
};

export interface VerdaccioMemoryConfig extends Config {
  max_users?: number;
  users: Users;
}
