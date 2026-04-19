import { searchUplinks } from '../src/remote-search';
import logger from './__mocks__/Logger';

// Polyfill fetch for test environment (jest runs with older Node APIs)
const mockFetch = jest.fn();
(global as any).fetch = mockFetch;

const mockUplinks = {
  npmjs: {
    url: 'https://registry.npmjs.org',
    timeout: 5000,
  },
  private: {
    url: 'https://private.registry.com',
  },
};

const baseQuery = {
  text: 'lodash',
  quality: 0,
  popularity: 0,
  maintenance: 0,
};

const npmSearchResponse = {
  objects: [
    {
      package: {
        name: 'lodash',
        scope: 'unscoped',
        version: '4.17.21',
        description: 'Lodash modular utilities.',
        keywords: ['modules', 'stdlib'],
        date: '2021-02-20T15:42:16.891Z',
        author: { name: 'John-David Dalton' },
      },
      score: {
        final: 0.85,
        detail: {
          quality: 0.9,
          popularity: 0.95,
          maintenance: 0.7,
        },
      },
    },
    {
      package: {
        name: 'lodash.get',
        scope: 'unscoped',
        version: '4.4.2',
        description: 'The lodash method `_.get` exported as a module.',
      },
      score: {
        final: 0.6,
        detail: {
          quality: 0.7,
          popularity: 0.5,
          maintenance: 0.6,
        },
      },
    },
  ],
};

describe('remote-search', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return results from a single uplink', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => npmSearchResponse,
    });

    const results = await searchUplinks(mockUplinks, ['npmjs'], baseQuery, logger);

    expect(results).toHaveLength(2);
    expect(results[0].package.name).toBe('lodash');
    expect(results[0].verdaccioPrivate).toBe(false);
    expect(results[0].verdaccioPkgCached).toBe(false);
    expect(results[0].score.final).toBe(0.85);
    expect(results[1].package.name).toBe('lodash.get');
  });

  test('should query multiple uplinks in parallel', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        objects: [npmSearchResponse.objects[0]],
      }),
    });

    const results = await searchUplinks(mockUplinks, ['npmjs', 'private'], baseQuery, logger);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(results).toHaveLength(2);
  });

  test('should skip uplinks that return non-ok status', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 503,
    });

    const results = await searchUplinks(mockUplinks, ['npmjs'], baseQuery, logger);

    expect(results).toHaveLength(0);
    expect(logger.warn).toHaveBeenCalled();
  });

  test('should handle fetch errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('ECONNREFUSED'));

    const results = await searchUplinks(mockUplinks, ['npmjs'], baseQuery, logger);

    expect(results).toHaveLength(0);
    expect(logger.warn).toHaveBeenCalled();
  });

  test('should handle timeout via AbortError', async () => {
    const abortError = new Error('aborted');
    abortError.name = 'AbortError';
    mockFetch.mockRejectedValue(abortError);

    const results = await searchUplinks(mockUplinks, ['npmjs'], baseQuery, logger);

    expect(results).toHaveLength(0);
    expect(logger.warn).toHaveBeenCalled();
  });

  test('should skip unknown uplink names', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => npmSearchResponse,
    });

    const results = await searchUplinks(mockUplinks, ['nonexistent'], baseQuery, logger);

    expect(mockFetch).not.toHaveBeenCalled();
    expect(results).toHaveLength(0);
  });

  test('should handle unexpected response format', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ unexpected: true }),
    });

    const results = await searchUplinks(mockUplinks, ['npmjs'], baseQuery, logger);

    expect(results).toHaveLength(0);
  });

  test('should map score defaults when score is missing', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        objects: [
          {
            package: { name: 'test-pkg' },
          },
        ],
      }),
    });

    const results = await searchUplinks(mockUplinks, ['npmjs'], baseQuery, logger);

    expect(results).toHaveLength(1);
    expect(results[0].score).toEqual({
      final: 0,
      detail: { quality: 0, popularity: 0, maintenance: 0 },
    });
  });
});
