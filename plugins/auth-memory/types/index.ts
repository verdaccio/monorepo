import { Config } from '@verdaccio/legacy-types';

export interface UserMemory {
  name: string;
  password: string;
}

export interface Users {
  [key: string]: UserMemory;
}

export interface VerdaccioMemoryConfig extends Config {
  max_users?: number;
  users: Users;
}
