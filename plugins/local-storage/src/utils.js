// @flow

import fs from 'fs';
import _ from 'lodash';
import path from 'path';

export function getFileStats(packagePath: string): any {
  return new Promise((resolve, reject) => {
    fs.stat(packagePath, (err, stats) => {
      if (_.isNil(err) === false) {
        return reject(err);
      }
      resolve(stats);
    });
  });
}

export function readDirectory(packagePath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.readdir(packagePath, (err, scopedPackages) => {
      if (_.isNil(err) === false) {
        return reject(err);
      }

      resolve(scopedPackages);
    });
  });
}

function hasScope(file: string) {
  return file.match(/^@/);
}

export async function findPackages(storagePath: string, validationHandler: Function) {
  const listPackages = [];
  return new Promise(async (resolve, reject) => {
    try {
      const scopePath = path.resolve(storagePath);
      const storageDirs = await readDirectory(scopePath);
      for (const directory: string of storageDirs) {
        // we check whether has 2nd level
        if (hasScope(directory)) {
          // we read directory multiple
          const scopeDirectory = path.resolve(storagePath, directory);
          const scopedPackages = await readDirectory(scopeDirectory);
          for (const scopedDirName: string of scopedPackages) {
            if (validationHandler(scopedDirName)) {
              // we build the complete scope path
              const scopePath = path.resolve(storagePath, directory, scopedDirName);
              // list content of such directory
              listPackages.push({
                name: `${directory}/${scopedDirName}`,
                path: scopePath
              });
            }
          }
        } else {
          // otherwise we read as single level
          if (validationHandler(directory)) {
            const scopePath = path.resolve(storagePath, directory);
            listPackages.push({
              name: directory,
              path: scopePath
            });
          }
        }
      }
    } catch (error) {
      reject(error);
    }

    resolve(listPackages);
  });
}
