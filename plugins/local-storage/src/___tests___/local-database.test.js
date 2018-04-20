// @flow
import fs from 'fs';
import type { ILocalData } from '@verdaccio/local-storage';
import LocalDatabase from '../local-database';
import Config from './__mocks__/Config';
import logger from './__mocks__/Logger';

const stuff = {
  logger,
  config: new Config()
};

let locaDatabase: ILocalData;

describe('Local Database', () => {
  beforeEach(() => {
    fs.writeFileSync = jest.fn();
    // fs.readFileSync = jest.fn();
    locaDatabase = new LocalDatabase(stuff.config, stuff.logger);
    // clean database
    locaDatabase._sync();
  });

  test('should create an instance', () => {
    const locaDatabase = new LocalDatabase(stuff.config, stuff.logger);

    expect(locaDatabase).toBeDefined();
  });

  test('should create set secret', () => {
    const secret = '12345';
    // $FlowFixMe
    locaDatabase.setSecret(secret);
    // $FlowFixMe
    expect(locaDatabase.getSecret()).toBe(secret);
  });

  describe('Database CRUD', () => {
    test('should add an item to database', done => {
      const pgkName = 'jquery';
      locaDatabase.get((err, data) => {
        expect(err).toBeNull();
        expect(data).toHaveLength(0);

        locaDatabase.add(pgkName, err => {
          expect(err).toBeNull();
          locaDatabase.get((err, data) => {
            expect(err).toBeNull();
            expect(data).toHaveLength(1);
            done();
          });
        });
      });
    });

    test('should remove an item to database', done => {
      const pgkName = 'jquery';
      locaDatabase.get((err, data) => {
        expect(err).toBeNull();
        expect(data).toHaveLength(0);
        locaDatabase.add(pgkName, err => {
          expect(err).toBeNull();
          locaDatabase.remove(pgkName, err => {
            expect(err).toBeNull();
            locaDatabase.get((err, data) => {
              expect(err).toBeNull();
              expect(data).toHaveLength(0);
              done();
            });
          });
        });
      });
    });
  });
});
