import setConfigValue from '../src/setConfigValue';

describe('Setting config values', () => {
  const bucket = 'TEST_AWS_S3_BUCKET_NAME';
  const keyPrefix = 'TEST_AWS_S3_BUCKET_PREFIX';

  afterEach(async () => {
    delete process.env[bucket];
    delete process.env[keyPrefix];
  });

  test('should fall back to value if environment variable is not set', () => {
    const expected = bucket;
    const actual = setConfigValue(bucket);

    expect(actual === expected).toBeTruthy();
  });

  test('should use the environment variable value', async () => {
    const expected = 'someBucket';
    process.env[bucket] = expected;
    const actual = setConfigValue(bucket);

    expect(actual === expected).toBeTruthy();
  });
});
