/* @flow */

declare module "@verdaccio/types" {

	declare export type Stdout = stream$Writable | tty$WriteStream;
	declare export type Stdin = stream$Readable | tty$ReadStream;
	declare export type SyncReturn = Error | void;

	declare export interface IStorage {
		addPackage(name: string, info: Package, callback: Callback): void;
		removePackage(name: string, callback: Callback): void;
		updateVersions(name: string, packageInfo: Package, callback: Callback): void;
		addVersion(name: string, version: string, metadata: Version, tag: string, callback: Callback): void;
		mergeTags(name: string, tags: Tags, callback: Callback): void;
		changePackage(name: string, metadata: Package, revision: string, callback: Callback): void;
		removeTarball(name: string, filename: string, revision: string, callback: Callback): void;
		addTarball(name: string, filename: string): void;
		getTarball(name: string, filename: string): void;
		getPackageMetadata(name: string, callback: Callback): void;
		search(startKey: string, options: any): Stream;
	}

	declare export interface IPlugableStorage {
		addPackage(name: string): SyncReturn;
		removePackage(name: string): SyncReturn;
		getPackage(): StorageList;
		syncPackages(): ?SyncReturn;
		createWriteStream(name: string): Stream;
		createReadStream(readTarballStream: any, callback?: Function): Stream;
		readJSON(fileName: string, callback: Callback): void;
		createJSON(name: string, value: any, cb: Function): void;
		unlink(fileName: string, callback: Callback): void;
		unlockFile(fileName: string, callback: Callback): void;
		rmdir(path: string, callback: Callback): void;
		lockAndReadJSON(fileName: string, callback: Callback): void;
		writeJSON(fileName: string, json: Package, callback: Callback): void;
	}

	declare export interface ILocalFS {
		createWriteStream(name: string): Stream;
		createReadStream(readTarballStream: any, callback?: Function): Stream;
		readJSON(fileName: string, callback: Callback): void;
		createJSON(name: string, value: any, cb: Function): void;
		deleteJSON(fileName: string, callback: Callback): void;
		unlock_file(fileName: string, callback: Callback): void;
    removePackage(path: string, callback: Callback): void;
		lockAndReadJSON(fileName: string, callback: Callback): void;
		writeJSON(fileName: string, json: Package, callback: Callback): void;
	}

	declare export interface ILocalData {
		add(name: string): SyncReturn;
		remove(name: string): SyncReturn;
		get(): StorageList;
		sync(): ?SyncReturn;
	}

	declare export interface ILocalStorage {
		add(name: string): void;
		remove(name: string): void;
		get(): StorageList;
		sync(): void;
	}

	declare export type UpLinkConf = {
		storage: string;
		url: string;
	}

	declare export type PackageAccess = {
		storage: string;
		publish: string;
		proxy: string;
		access: string;
	}

	declare export type PackageList = {
		[key: string]: PackageAccess;
	}

	declare export type UpLinksConfList = {
		[key: string]: UpLinkConf;
	}

	declare export type Config = {
		storage: string;
		packages: PackageList;
		uplinks: UpLinksConfList;
		self_path: string;
		getMatchedPackagesSpec: (storage: string) => PackageAccess;
	}

	declare export type Callback = Function;

	declare export type StorageList = Array<string>;

	declare export type LocalStorage = {
		list: StorageList;
	}

	declare export type Utils = {
			ErrorCode: any;
			getLatestVersion: Callback;
			is_object: (value: any) => boolean;
			validate_name: (value: any) => boolean;
			tag_version: (value: any, version: string, tag: string) => void;
			normalize_dist_tags: (pkg: Package) => void;
			semver_sort: (keys: Array<string>) => Array<string>;
	}

	declare export type Dist = {
		integrity?: string;
		shasum: string;
		tarball: string;
	}

	declare export type Author = {
		name: string;
		email: string;
	}

	declare export type Version = {
		name: string;
		version: string;
		devDependencies: string;
		directories: any;
		dist: Dist;
		author: string;
		homemage: string;
		license: string;
		readme: string;
		readmeFileName: string;
		description: string;
		bin: string;
		bugs: any;
		repository: string;
		homepage: string;
		dist: Dist;
		contributors: Array<string>;
		keywords: string | Array<string>;
		_npmUser: Author;
		_hasShrinkwrap: boolean;
	};

	declare export type Logger = {
		child: (conf: any) => any;
		debug: (conf: any, template?: mixed) => void;
		error: (conf: any, template?: mixed) => void;
		http: (conf: any, template?: mixed) => void;
		trace: (conf: any, template?: mixed) => void;
		info: (conf: any, template?: mixed) => void;
	}

	declare export type Versions = {
		[key: string]: Version;
	}

	declare export type DistFile = {
		url: string;
		sha: string;
		registry?: string;
	}

		declare export  type MergeTags = {
		[key: string]: strings;
	}

	declare export  type DistFiles = {
		[key: string]: DistFile;
	}

	declare export type AttachMents = {
		[key: string]: Version;
	}

	declare export type GenericBody = {
		[key: string]: string;
	}

	declare export type UpLinks = {
		[key: string]: Version;
	}

	declare export type Tags = {
		[key: string]: Version;
	}

	declare export type Package = {
		_id?: string;
		name: string;
		versions: Versions;
		'dist-tags': GenericBody;
		time: GenericBody;
		readme?: string;
		_distfiles: DistFiles;
		_attachments: AttachMents;
		_uplinks: UpLinks;
		_rev?: string;
	}

}
