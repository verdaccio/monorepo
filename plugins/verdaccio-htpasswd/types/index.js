import type { ConfigFile } from '@verdaccio/types';

export interface VerdaccioConfigApp extends ConfigFile {
  users_file: string;
}
