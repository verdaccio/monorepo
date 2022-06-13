import { PackageAccess, PackageList } from './manifest';

export type TypeToken = 'Bearer' | 'Basic';

export interface Logger {
  child: (conf: any) => any;
  debug: (conf: any, template?: string) => void;
  error: (conf: any, template?: string) => void;
  http: (conf: any, template?: string) => void;
  trace: (conf: any, template?: string) => void;
  warn: (conf: any, template?: string) => void;
  info: (conf: any, template?: string) => void;
}

export type LoggerType = 'stdout' | 'stderr' | 'file';
export type LoggerFormat = 'pretty' | 'pretty-timestamped' | 'file';
export type LoggerLevel = 'http' | 'fatal' | 'warn' | 'info' | 'debug' | 'trace';

export interface LoggerConfItem {
  type: LoggerType;
  format: LoggerFormat;
  level: LoggerLevel;
}

export interface Headers {
  [key: string]: string;
}

export interface UpLinkTokenConf {
  type: TypeToken;
  token?: string;
  token_env?: boolean | string;
}

export interface UpLinkConf {
  url: string;
  ca?: string;
  cache?: boolean;
  timeout?: string | void;
  maxage?: string | void;
  max_fails?: number | void;
  fail_timeout?: string | void;
  headers?: Headers;
  auth?: UpLinkTokenConf;
  strict_ssl?: boolean | void;
  _autogenerated?: boolean;
}

export type RateLimit = {
  windowMs?: number;
  max?: number;
};

export interface WebConf {
  enable?: boolean;
  title?: string;
  logo?: string;
  favicon?: string;
  gravatar?: boolean;
  sort_packages?: string;
  rateLimit?: RateLimit;
}

export interface UpLinksConfList {
  [key: string]: UpLinkConf;
}

export interface AuthHtpasswd {
  file: string;
  max_users: number;
}

export type AuthConf = any | AuthHtpasswd;

export interface JWTOptions {
  sign: JWTSignOptions;
  verify: JWTVerifyOptions;
}

export interface JWTSignOptions {
  algorithm?: string;
  expiresIn?: string;
  notBefore?: string;
  ignoreExpiration?: boolean;
  maxAge?: string | number;
  clockTimestamp?: number;
}

export interface JWTVerifyOptions {
  algorithm?: string;
  expiresIn?: string;
  notBefore?: string | number;
  ignoreExpiration?: boolean;
  maxAge?: string | number;
  clockTimestamp?: number;
}

export interface APITokenOptions {
  legacy: boolean;
  jwt?: JWTOptions;
}

export interface Security {
  web: JWTOptions;
  api: APITokenOptions;
}

export interface PublishOptions {
  allow_offline: boolean;
}

export interface ListenAddress {
  [key: string]: string;
}

export interface HttpsConfKeyCert {
  key: string;
  cert: string;
  ca?: string;
}

export interface HttpsConfPfx {
  pfx: string;
  passphrase?: string;
}

export type HttpsConf = HttpsConfKeyCert | HttpsConfPfx;

export interface Notifications {
  method: string;
  packagePattern: RegExp;
  packagePatternFlags: string;
  endpoint: string;
  content: string;
  headers: Headers;
}

export type ServerSettingsConf = {
  // express-rate-limit settings
  rateLimit: RateLimit;
  keepAliveTimeout?: number;
};

export interface ConfigYaml {
  _debug?: boolean;
  storage?: string | void;
  packages: PackageList;
  uplinks: UpLinksConfList;
  // FUTURE: log should be mandatory
  logs?: LoggerConfItem;
  web?: WebConf;
  auth?: AuthConf;
  security: Security;
  publish?: PublishOptions;
  store?: any;
  listen?: ListenAddress;
  https?: HttpsConf;
  http_proxy?: string;
  plugins?: string | void;
  https_proxy?: string;
  no_proxy?: string;
  max_body_size?: string;
  notifications?: Notifications;
  notify?: Notifications | Notifications[];
  middlewares?: any;
  filters?: any;
  url_prefix?: string;
  server?: ServerSettingsConf;
}

export interface ConfigRuntime extends ConfigYaml {
  // @deprecated on v6 this is config_path
  self_path: string;
}

export interface Config extends ConfigYaml, ConfigRuntime {
  user_agent?: string | boolean;
  server_id: string;
  secret: string;
  // deprecated
  checkSecretKey(token: string): string;
  getMatchedPackagesSpec(storage: string): PackageAccess | void;
  [key: string]: any;
}
