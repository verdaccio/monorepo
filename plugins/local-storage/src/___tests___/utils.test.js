import path from 'path';
import { loadPrivatePackages } from '../utils';
import logger from './__mocks__/Logger';

describe('Utitlies', () => {
  const loadDb = name => path.join(__dirname, '__fixtures__/databases', `${name}.json`);

  beforeEach(() => {
    jest.resetModules();
  });

  test('should load private packages', () => {
    const database = loadDb('ok');
    const db = loadPrivatePackages(database, logger);

    expect(db.list).toHaveLength(15);
  });

  test('should load and empty private packages if database file is valid and empty', () => {
    const database = loadDb('empty');
    const db = loadPrivatePackages(database, logger);

    expect(db.list).toHaveLength(0);
  });

  test('should fails on load private packages', () => {
    const database = loadDb('corrupted');

    expect(() => {
      loadPrivatePackages(database, logger);
    }).toThrow();
  });

  test('should handle null read values and return empty database', () => {
    jest.doMock('fs', () => {
      return {
        readFileSync: () => null
      };
    });

    const { loadPrivatePackages } = require('../utils');
    const database = loadDb('ok');
    const db = loadPrivatePackages(database, logger);

    expect(db.list).toHaveLength(0);
  });
});
