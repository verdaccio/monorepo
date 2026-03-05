import type { Callback } from '@verdaccio/legacy-types';
import locker from 'lockfile';


// unlocks file by removing existing lock file
export function unlockFile(name: string, next: Callback): void {
  const lockFileName = `${name}.lock`;
  locker.unlock(lockFileName, function () {
    return next(null);
  });
}
