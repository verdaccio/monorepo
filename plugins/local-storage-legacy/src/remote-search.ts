import buildDebug from 'debug';

import type { searchUtils } from '@verdaccio/core';
import type { Logger } from '@verdaccio/legacy-types';

const debug = buildDebug('verdaccio:plugin:local-storage-legacy:remote-search');

const DEFAULT_SEARCH_SIZE = 20;
const DEFAULT_TIMEOUT_MS = 10_000;

interface UpLinkConf {
  url: string;
  timeout?: string | number;
  headers?: Record<string, string>;
}

interface NpmSearchResponse {
  objects?: Array<{
    package: {
      name: string;
      scope?: string;
      version?: string;
      description?: string;
      keywords?: string[];
      date?: string;
      author?: { name?: string; email?: string };
    };
    score?: {
      final?: number;
      detail?: {
        quality?: number;
        popularity?: number;
        maintenance?: number;
      };
    };
  }>;
}

function buildSearchUrl(baseUrl: string, query: searchUtils.SearchQuery): string {
  const url = new URL('/-/v1/search', baseUrl.replace(/\/$/, ''));
  url.searchParams.set('text', query.text);
  url.searchParams.set('size', String(query.size ?? DEFAULT_SEARCH_SIZE));
  if (query.from) {
    url.searchParams.set('from', String(query.from));
  }
  return url.toString();
}

function parseTimeout(timeout?: string | number): number {
  if (typeof timeout === 'number') {
    return timeout;
  }
  if (typeof timeout === 'string') {
    const parsed = parseInt(timeout, 10);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return DEFAULT_TIMEOUT_MS;
}

function mapToSearchItem(obj: NpmSearchResponse['objects'][number]): searchUtils.SearchItem {
  const pkg = obj.package;
  const score = obj.score;
  return {
    package: {
      name: pkg.name,
      scoped: pkg.scope,
      time: pkg.date ? new Date(pkg.date).getTime() : undefined,
    },
    verdaccioPrivate: false,
    verdaccioPkgCached: false,
    score: {
      final: score?.final ?? 0,
      detail: {
        quality: score?.detail?.quality ?? 0,
        popularity: score?.detail?.popularity ?? 0,
        maintenance: score?.detail?.maintenance ?? 0,
      },
    },
  };
}

async function searchSingleUplink(
  name: string,
  uplink: UpLinkConf,
  query: searchUtils.SearchQuery,
  logger: Logger
): Promise<searchUtils.SearchItem[]> {
  const searchUrl = buildSearchUrl(uplink.url, query);
  const timeoutMs = parseTimeout(uplink.timeout);
  debug('querying uplink %o at %o (timeout: %oms)', name, searchUrl, timeoutMs);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(uplink.headers || {}),
    };

    const response = await fetch(searchUrl, {
      signal: controller.signal,
      headers,
    });

    if (!response.ok) {
      logger.warn(
        { uplink: name, status: response.status },
        'uplink @{uplink} search returned status @{status}, skipping'
      );
      return [];
    }

    const data = (await response.json()) as NpmSearchResponse;

    if (!Array.isArray(data?.objects)) {
      debug('uplink %o returned unexpected format', name);
      return [];
    }

    const results = data.objects.map(mapToSearchItem);
    debug('uplink %o returned %o results', name, results.length);
    return results;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      logger.warn({ uplink: name }, 'uplink @{uplink} search timed out');
    } else {
      logger.warn({ uplink: name, err: err.message }, 'uplink @{uplink} search failed: @{err}');
    }
    return [];
  } finally {
    clearTimeout(timer);
  }
}

export async function searchUplinks(
  uplinks: Record<string, UpLinkConf>,
  uplinkNames: string[],
  query: searchUtils.SearchQuery,
  logger: Logger
): Promise<searchUtils.SearchItem[]> {
  const promises = uplinkNames
    .filter((name) => uplinks[name])
    .map((name) => searchSingleUplink(name, uplinks[name], query, logger));

  const results = await Promise.allSettled(promises);
  const items: searchUtils.SearchItem[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      items.push(...result.value);
    }
  }

  return items;
}
