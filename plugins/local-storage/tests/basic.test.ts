// FIXME: remove this mocks imports
import Config from './__mocks__/Config';
import logger from './__mocks__/Logger';
import LocalStorage from '../src/index';
import path from 'path';

describe('Basic Tests', () => {


  test('basic instance', () => {
    const config = new Config();
    const instance = new LocalStorage(config, logger);
    expect(instance).toBeDefined();
  })
});
