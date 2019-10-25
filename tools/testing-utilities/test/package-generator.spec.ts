import { generatePackageBody } from '../src/index';

describe('package generator', () => {
  test('should return a basic body', () => {
    const metadata = generatePackageBody('test', ['1.0.0']);

    expect(metadata).toBeDefined();
  });
});
