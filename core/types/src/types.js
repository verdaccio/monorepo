/* @flow */

declare interface verdaccio$IUploadTarball extends stream$PassThrough {
  abort: Function;
  done: Function;
  _transform: Function;
  abort(): void;
  done(): void;
}

declare interface verdaccio$IReadTarball extends stream$PassThrough {
  abort: Function;
  abort(): void;
}

declare type verdaccio$Callback = Function;

declare type verdaccio$StorageList = Array<string>;

declare type verdaccio$LocalStorage = {
  list: verdaccio$StorageList;
  secret: string;
}

declare type verdaccio$Dist = {
  integrity?: string;
  shasum: string;
  tarball: string;
}

declare type verdaccio$Author = {
  name: string;
  email: string;
}

declare type verdaccio$Version = {
  name: string,
  version: string,
  devDependencies: string,
  directories: any,
  dist: verdaccio$Dist,
  author: string,
  main: string,
  homemage: string,
  license: string,
  readme: string,
  readmeFileName: string,
  description: string,
  bin: string,
  bugs: any,
  files: Array<string>,
  gitHead: string,
  maintainers: Array<verdaccio$Author>,
  repository: string | any,
  scripts: any,
  homepage: string,
  dist: verdaccio$Dist,
  readmeFilename: string;
  etag: string;
  contributors: Array<verdaccio$Author>,
  dependencies: any,
  keywords: string | Array<string>,
  _id: string,
  nodeVersion: string,
  _npmUser: verdaccio$Author,
  _hasShrinkwrap: boolean
};

declare type verdaccio$Logger = {
  child: (conf: any) => any;
  debug: (conf: any, template?: mixed) => void;
  error: (conf: any, template?: mixed) => void;
  http: (conf: any, template?: mixed) => void;
  trace: (conf: any, template?: mixed) => void;
  warn: (conf: any, template?: mixed) => void;
  info: (conf: any, template?: mixed) => void;
}

declare type verdaccio$Versions = {
  [key: string]: verdaccio$Version;
}

declare type verdaccio$DistFile = {
  url: string;
  sha: string;
  registry?: string;
}

declare type verdaccio$MergeTags = {
  [key: string]: string;
}

declare type verdaccio$DistFiles = {
  [key: string]: verdaccio$DistFile;
}

declare type verdaccio$AttachMents = {
  [key: string]: verdaccio$Version;
}

declare type verdaccio$GenericBody = {
  [key: string]: string;
}

declare type verdaccio$UpLinkMetadata = {
  etag: string;
  fetched: number;
}

declare type verdaccio$UpLinks = {
  [key: string]: verdaccio$UpLinkMetadata;
}

declare type verdaccio$Tags = {
  [key: string]: verdaccio$Version;
}

declare type verdaccio$Headers = {
  [key: string]: string;
}

declare type verdaccio$Package = {
  _id?: string;
  name: string;
  versions: verdaccio$Versions;
  'dist-tags': verdaccio$GenericBody;
  time?: verdaccio$GenericBody;
  readme?: string;
  _distfiles: verdaccio$DistFiles;
  _attachments: verdaccio$AttachMents;
  _uplinks: verdaccio$UpLinks;
  _rev: string;
}

declare interface verdaccio$ILocalStorage {
  add(name: string): void;
  remove(name: string): void;
  get(): verdaccio$StorageList;
  sync(): void;
}

declare type verdaccio$UpLinkTokenConf = {
  type: "Bearer" | "Basic",
  token?: string,
  token_env?: boolean | string
}

declare type verdaccio$UpLinkConf = {
  url: string;
  ca?: string;
  cache?: boolean;
  timeout?: string | void;
  maxage?: string| void;
  max_fails?: number | void;
  fail_timeout?: string | void;
  headers?: verdaccio$Headers;
  auth?: verdaccio$UpLinkTokenConf;
  strict_ssl?: boolean | void;
}

declare type verdaccio$PackageAccess = {
  storage: string;
  publish: string;
  proxy: string;
  access: string;
}

declare type verdaccio$PackageList = {
  [key: string]: verdaccio$PackageAccess;
}

declare type verdaccio$UpLinksConfList = {
  [key: string]: verdaccio$UpLinkConf;
}

declare interface verdaccio$AuthHtpasswd {
  file: string;
  max_users: string;
}

declare type verdaccio$LoggerType = 'stdout' | 'stderr' | 'file';
declare type verdaccio$LoggerFormat = 'pretty' | 'pretty-timestamped' | 'file';
declare type verdaccio$LoggerLevel = 'http' | 'fatal' | 'warn' | 'info' | 'debug' | 'trace';

declare type verdaccio$LoggerConfItem = {
  type: verdaccio$LoggerType;
  format: verdaccio$LoggerFormat;
  level: verdaccio$LoggerLevel;
}

declare type verdaccio$PublishOptions = {
  allow_offline: boolean;
}

declare interface verdaccio$LoggerConf {
  [key: string]: verdaccio$LoggerConfItem;
}

declare interface verdaccio$ListenAddress {
  [key: string]: string;
}

declare interface verdaccio$WebConf {
  enable: boolean;
  title: string;
  logo: string;
}

declare interface verdaccio$HttpsConf {
  key?: string;
  cert?: string;
  ca?: string;
  pfx?: string;
  passphrase?: string;
}

declare type verdaccio$AuthConf = any | verdaccio$AuthHtpasswd;

declare type verdaccio$Notifications = {
  method: string;
  packagePattern: RegExp;
  packagePatternFlags: string;
  headers: verdaccio$Headers;
  endpoint: string;
  content: string;
  [key: string]: string;
}

declare type verdaccio$ConfigFile = {
  storage: string;
  self_path: string;
  packages: verdaccio$PackageList;
  uplinks: verdaccio$UpLinksConfList;
  logs: Array<verdaccio$LoggerConf>;
  web: verdaccio$WebConf;
  auth: verdaccio$AuthConf;
  publish?: verdaccio$PublishOptions;
  url_prefix?: string;
  listen?: verdaccio$ListenAddress;
  https?: verdaccio$HttpsConf;
  http_proxy?: string;
  https_proxy?: string;
  no_proxy?: string;
  max_body_size?: string;
  notifications: verdaccio$Notifications;
}

declare type verdaccio$Config = {
  user_agent: string;
  server_id: any;
  _debug?: boolean;
  storage: string;
  secret: string;
  self_path: string;
  packages: verdaccio$PackageList;
  uplinks: verdaccio$UpLinksConfList;
  logs: Array<verdaccio$LoggerConf>;
  web: verdaccio$WebConf;
  auth: verdaccio$AuthConf;
  publish?: verdaccio$PublishOptions;
  url_prefix?: string;
  store?: any;
  listen?: verdaccio$ListenAddress;
  https?: verdaccio$HttpsConf;
  http_proxy?: string;
  https_proxy?: string;
  no_proxy?: string;
  max_body_size?: string;
  notifications: verdaccio$Notifications;
  middlewares?: any;
  checkSecretKey: (token: string) => string;
  hasProxyTo(pkg: string, upLink: string): boolean;
  getMatchedPackagesSpec?: (storage: string) => verdaccio$PackageAccess;
}

declare type verdaccio$SyncReturn = Error | void;
declare type verdaccio$IPackageStorage = verdaccio$ILocalPackageManager | void;
declare interface verdaccio$ILocalData {
  add(name: string, callback: verdaccio$Callback): void;
  remove(name: string, callback: verdaccio$Callback): void;
  get(callback: verdaccio$Callback): void;
  getSecret(): Promise<string>;
  setSecret(secret: string): Promise<any>;
  getPackageStorage(packageInfo: string): verdaccio$IPackageStorage;
}

declare interface verdaccio$ILocalPackageManager {
  writeTarball(name: string): verdaccio$IUploadTarball;
  readTarball(name: string): verdaccio$IReadTarball;
  readPackage(fileName: string, callback: verdaccio$Callback): void;
  createPackage(name: string, value: verdaccio$Package, cb: verdaccio$Callback): void;
  deletePackage(fileName: string, callback: verdaccio$Callback): void;
  removePackage(callback: verdaccio$Callback): void;
  updatePackage(pkgFileName: string,
                updateHandler: verdaccio$Callback,
                onWrite: verdaccio$Callback,
                transformPackage: Function,
                onEnd: verdaccio$Callback): void;
  savePackage(fileName: string, json: verdaccio$Package, callback: verdaccio$Callback): void;
}

declare module "@verdaccio/local-storage" {
  declare export type ILocalData =  verdaccio$ILocalData;
  declare export type IPackageStorage =  verdaccio$IPackageStorage;
  declare export type ILocalPackageManager =  verdaccio$ILocalPackageManager;
  declare class LocalDatabase<ILocalData>{
    constructor(config: verdaccio$Config, logger: verdaccio$Logger): ILocalData;
  }
  declare module.exports: typeof LocalDatabase;
}

declare module "@verdaccio/streams" {
  declare type IUploadTarball = verdaccio$IUploadTarball;
  declare type IReadTarball = verdaccio$IReadTarball;
  declare class UploadTarball<ILocalData>{
    abort: Function;
    done: Function;
    constructor(options: duplexStreamOptions): verdaccio$IUploadTarball;
    constructor(): verdaccio$IUploadTarball;
  }
  declare class ReadTarball<ILocalData>{
    abort: Function;
    constructor(options: duplexStreamOptions): verdaccio$IReadTarball;
    constructor(): verdaccio$IReadTarball;
  }
}

declare module "@verdaccio/file-locking" {
  declare export type LockOptions = {
    lock?: boolean,
    parse?: boolean
  };
  declare export function readFile(name: string, data: any, callback: Function): void;
  declare export function unlockFile(name: string, callback: Function): void;
  declare export function lockFile(name: string, callback: Function): void;
}

declare module "@verdaccio/types" {
  declare export type Stdout = stream$Writable | tty$WriteStream;
  declare export type Stdin = stream$Readable | tty$ReadStream;
  declare export type Package = verdaccio$Package;
  declare export type MergeTags = verdaccio$MergeTags;
  declare export type Version = verdaccio$Version;
  declare export type Callback = verdaccio$Callback;
  declare export type Logger = verdaccio$Logger;
  declare export type DistFile = verdaccio$DistFile;
  declare export type Versions = verdaccio$Versions;
  declare export type Config = verdaccio$Config;
  declare export type ConfigFile = verdaccio$ConfigFile;
  declare export type LoggerConf = verdaccio$LoggerConf;
  declare export type WebConf = verdaccio$WebConf;
  declare export type AuthConf = verdaccio$AuthConf;
  declare export type PublishOptions = verdaccio$PublishOptions;
  declare export type ListenAddress = verdaccio$ListenAddress;
  declare export type HttpsConf = verdaccio$HttpsConf;
  declare export type Notifications = verdaccio$Notifications;
  declare export type Headers = verdaccio$Headers;
  declare export type LoggerConfItem = verdaccio$LoggerConfItem;
  declare export type LoggerLevel = verdaccio$LoggerLevel;
  declare export type LoggerFormat = verdaccio$LoggerFormat;
  declare export type LoggerType = verdaccio$LoggerType;
  declare export type PackageList = verdaccio$PackageList;
  declare export type UpLinksConfList = verdaccio$UpLinksConfList;
  declare export type UpLinkMetadata = verdaccio$UpLinkMetadata;
  declare export type ILocalStorage = verdaccio$ILocalStorage;
  declare export type UpLinkConf = verdaccio$UpLinkConf;
  declare export type PackageAccess = verdaccio$PackageAccess;
  declare export type StorageList = verdaccio$StorageList;
  declare export type LocalStorage = verdaccio$LocalStorage;
}
