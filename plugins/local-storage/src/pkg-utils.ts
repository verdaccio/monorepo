import fs from 'fs';

import type { Logger, StorageList } from '@verdaccio/types';
import _ from 'lodash';


import type { LocalStorage } from './utils';

export function loadPrivatePackages(path: string, logger: Logger): LocalStorage {
  const list: StorageList = [];
  const emptyDatabase = { list, secret: '' };
  const data = fs.readFileSync(path, 'utf8');

  if (_.isNil(data)) {
    // readFileSync is platform specific, FreeBSD might return null
    return emptyDatabase;
  }

  let db;
  try {
    db = JSON.parse(data);
  } catch (err: any) {
    logger.error(
      {
        err: err.mesage,
        path,
      },  
      `Package database file corrupted (invalid JSON), please check the error @{err}.\nFile Path: @{path}`
    );
    throw Error('Package database file corrupted (invalid JSON)');
  }

  if (_.isEmpty(db)) {
    return emptyDatabase;
  }

  return db;
}
