import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { fileUtils } from '@verdaccio/core';
import { ping } from '@verdaccio/registry-cli';
import getPort from 'get-port';

let registryUrl: string;
let registryProcess: ReturnType<typeof spawn>;
let tempDir: string;
let authToken: string;

async function waitForRegistry(url: string, timeoutMs = 30_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const result = await ping(url);
      if (result.ok) {
        return;
      }
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Registry at ${url} did not start within ${timeoutMs}ms`);
}

async function createUser(url: string, user: string, password: string): Promise<string> {
  const res = await fetch(`${url}/-/user/org.couchdb.user:${user}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: user,
      password,
      _id: `org.couchdb.user:${user}`,
      type: 'user',
      roles: [],
    }),
  });
  const data = (await res.json()) as { token?: string };
  if (!data.token) {
    throw new Error(`Failed to create user: ${JSON.stringify(data)}`);
  }
  return data.token;
}

async function publishPackage(
  url: string,
  token: string,
  name: string,
  version: string
): Promise<void> {
  const pkgDir = path.join(tempDir, `pkg-${name.replace(/\//g, '-')}`);
  fs.mkdirSync(pkgDir, { recursive: true });
  fs.writeFileSync(
    path.join(pkgDir, 'package.json'),
    JSON.stringify({
      name,
      version,
      description: `Test package ${name}`,
      main: 'index.js',
      publishConfig: { access: 'public' },
    })
  );
  fs.writeFileSync(path.join(pkgDir, 'index.js'), `module.exports = '${name}';`);
  fs.writeFileSync(
    path.join(pkgDir, '.npmrc'),
    `registry=${url}/\n//${new URL(url).host}/:_authToken=${token}\n`
  );
  const npmrcPath = path.join(pkgDir, '.npmrc');
  execSync(`npm publish --tag latest --userconfig "${npmrcPath}"`, {
    cwd: pkgDir,
    stdio: 'pipe',
    env: { ...process.env, npm_config_registry: url },
  });
}

async function searchRegistry(url: string, text: string): Promise<any> {
  const res = await fetch(`${url}/-/v1/search?text=${encodeURIComponent(text)}&size=50`);
  return res.json();
}

describe('local-storage-legacy E2E: search', () => {
  beforeAll(async () => {
    const port = await getPort();
    registryUrl = `http://localhost:${port}`;
    tempDir = await fileUtils.createTempStorageFolder('verdaccio-e2e-search');
    const storagePath = path.join(tempDir, 'storage');
    fs.mkdirSync(storagePath, { recursive: true });

    const configPath = path.join(tempDir, 'config.yaml');
    fs.writeFileSync(
      configPath,
      [
        `storage: ${storagePath}`,
        `auth:`,
        `  htpasswd:`,
        `    file: ${path.join(tempDir, 'htpasswd')}`,
        `    max_users: 100`,
        `uplinks:`,
        `  npmjs:`,
        `    url: https://registry.npmjs.org/`,
        `packages:`,
        `  '@e2e/*':`,
        `    access: $all`,
        `    publish: $authenticated`,
        `    proxy: npmjs`,
        `  '**':`,
        `    access: $all`,
        `    publish: $authenticated`,
        `    proxy: npmjs`,
        `listen: ${port}`,
        `logs: { type: stdout, format: pretty, level: warn }`,
      ].join('\n')
    );

    // Resolve verdaccio binary from node_modules
    const verdaccioBin = require.resolve('verdaccio/bin/verdaccio');

    registryProcess = spawn('node', [verdaccioBin, '--config', configPath], {
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'production' },
    });

    await waitForRegistry(registryUrl);

    // Create test user
    authToken = await createUser(registryUrl, 'e2e-test-user', 'e2e-test-password');

    // Publish test packages
    await publishPackage(registryUrl, authToken, '@e2e/search-pkg-alpha', '1.0.0');
    await publishPackage(registryUrl, authToken, '@e2e/search-pkg-beta', '1.0.0');
    await publishPackage(registryUrl, authToken, 'e2e-unscoped-pkg', '1.0.0');
  }, 60_000);

  afterAll(() => {
    if (registryProcess) {
      registryProcess.kill('SIGTERM');
    }
    if (tempDir) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('search returns published packages', async () => {
    const results = await searchRegistry(registryUrl, 'e2e');

    expect(results.objects).toBeDefined();
    expect(results.objects.length).toBeGreaterThanOrEqual(3);

    const names = results.objects.map((o: any) => o.package.name);
    expect(names).toContain('@e2e/search-pkg-alpha');
    expect(names).toContain('@e2e/search-pkg-beta');
    expect(names).toContain('e2e-unscoped-pkg');
  });

  test('search filters by query text', async () => {
    const results = await searchRegistry(registryUrl, 'alpha');

    const names = results.objects.map((o: any) => o.package.name);
    expect(names).toContain('@e2e/search-pkg-alpha');
    expect(names).not.toContain('e2e-unscoped-pkg');
  });

  test('search returns empty for non-matching query', async () => {
    const results = await searchRegistry(registryUrl, 'zzz-nonexistent-pkg-xyz');

    expect(results.objects).toBeDefined();
    expect(results.objects.length).toBe(0);
  });

  test('search returns score metadata', async () => {
    const results = await searchRegistry(registryUrl, '@e2e/search-pkg-alpha');

    expect(results.objects.length).toBeGreaterThanOrEqual(1);
    const item = results.objects.find((o: any) => o.package.name === '@e2e/search-pkg-alpha');
    expect(item).toBeDefined();
    expect(item.score).toBeDefined();
    expect(item.score.final).toBeDefined();
    expect(item.score.detail).toBeDefined();
  });

  test('search respects size parameter', async () => {
    const res = await fetch(`${registryUrl}/-/v1/search?text=e2e&size=1`);
    const results = (await res.json()) as any;

    expect(results.objects.length).toBeLessThanOrEqual(1);
  });
});
