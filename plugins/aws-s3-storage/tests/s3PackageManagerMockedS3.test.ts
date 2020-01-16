import S3PackageManager from '../src/s3PackageManager';
import { S3Config } from '../src/config';

import logger from './__mocks__/Logger';
import pkg from './__fixtures__/pkg';

const mockHead = jest.fn();

jest.mock('aws-sdk', () => ({
  S3: jest.fn().mockImplementation(() => ({
    headObject: mockHead,
  })),
}));

describe('S3PackageManager with mocked s3', function() {
  test('test', async done => {
    const config: S3Config = {
      bucket: 'test-bucket',
      keyPrefix: 'keyPrefix/',
    } as S3Config;

    mockHead.mockImplementation((params, callback) => {
      callback();
    });

    const testPackageManager = new S3PackageManager(config, 'test-package', logger);

    testPackageManager.createPackage('test-readme-0.0.0.tgz', pkg, () => {
      done();
    });
  });
});
