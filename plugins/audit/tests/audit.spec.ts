import { Logger } from '@verdaccio/types';
// @ts-ignore
import nock from 'nock';
import supertest from 'supertest';

import ProxyAudit, { ConfigAudit } from '../src/index';
import { AUDIT_ENDPOINT, REGISTRY_DOMAIN } from '../src/audit';

import generateApp from './partial/webapp';

jest.setTimeout(4000000);

const config: ConfigAudit = {
  enabled: true,
} as ConfigAudit;

const warnMock = jest.fn();
const errorMock = jest.fn();
const infoMock = jest.fn();
const httpMock = jest.fn();
const traceMock = jest.fn();
const debugMock = jest.fn();

const logger: Logger = {
  error: errorMock,
  info: infoMock,
  debug: debugMock,
  child: e => console.warn(e),
  warn: warnMock,
  http: httpMock,
  trace: traceMock,
};

describe('Audit plugin', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  const endpoint = '/-/npm/v1/security/audits';
  test('should test audit', () => {
    const audit = new ProxyAudit(config, { logger, config: undefined });
    expect(audit).toBeDefined();
  });

  test('should test audit with configuration', () => {
    const config = { strict_ssl: false } as ConfigAudit;
    const audit = new ProxyAudit(config, { logger, config: config });
    expect(audit).toBeDefined();
    expect(audit.strict_ssl).toBeFalsy();
  });

  test('should post 200 from npmjs registry', async () => {
    // @ts-ignore
    const audit = new ProxyAudit(config, { logger });
    nock(REGISTRY_DOMAIN)
      .post(AUDIT_ENDPOINT)
      .reply(200, { some: 'response' });
    const app = generateApp();
    audit.register_middlewares(app, null);

    const response = await supertest(app).post(endpoint);
    expect(response.statusCode).toEqual(200);
  });

  test('should post 500 from npmjs registry', async () => {
    // @ts-ignore
    const audit = new ProxyAudit(config, { logger });
    nock(REGISTRY_DOMAIN)
      .post(AUDIT_ENDPOINT)
      .reply(500, { some: 'response' });
    const app = generateApp();
    audit.register_middlewares(app, null);

    const response = await supertest(app).post(endpoint);
    expect(response.statusCode).toEqual(500);
  });

  test('should post 404 from npmjs registry', async () => {
    // @ts-ignore
    const audit = new ProxyAudit(config, { logger });
    nock(REGISTRY_DOMAIN)
      .post(AUDIT_ENDPOINT)
      .reply(404);
    const app = generateApp();
    audit.register_middlewares(app, null);

    const response = await supertest(app).post(endpoint);
    expect(response.statusCode).toEqual(404);
  });

  test('should don not request to npmjs registry if audit is disabled', async () => {
    // @ts-ignore
    const audit = new ProxyAudit(Object.assign({}, config, { enabled: false }), { logger });
    nock(REGISTRY_DOMAIN)
      .post(AUDIT_ENDPOINT)
      .reply(500, { some: 'response' });
    const app = generateApp();
    audit.register_middlewares(app, null);

    const response = await supertest(app).post(endpoint);
    expect(response.statusCode).toEqual(500);
  });

  test('should check strict ssl', async () => {
    const audit = new ProxyAudit(
      Object.assign({}, config, {
        enabled: true,
        strict_ssl: true,
      }),
      // @ts-ignore
      { logger }
    );
    nock(REGISTRY_DOMAIN)
      .post(AUDIT_ENDPOINT)
      .reply(200, { some: 'response' });
    const app = generateApp();
    audit.register_middlewares(app, null);

    const response = await supertest(app).post(endpoint);
    expect(response.statusCode).toEqual(200);
  });
});
