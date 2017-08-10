declare module "@verdaccio/types" {

	declare export interface IStorage {
		getPackages(name: string): void;
	}

	declare export type Config = {
		storage: string;
		self_path?: string;
	}

	declare export type Callback = Function;

	declare export type StorageList = Array<string>;

	declare export type LocalStorage = {
		list: StorageList;
	}

	declare export interface ILocalData {
		add(name: string): void;
		remove(name: string): void;
		get(): StorageList;
		sync(): void;
	}

	declare export interface ILocalStorage {
		add(name: string): void;
		remove(name: string): void;
		get(): StorageList;
		sync(): void;
	}
	
	declare export type Utils = {
			ErrorCode: any;
			getLatestVersion: Callback;
			is_object: (value: any) => boolean;
			validate_name: (value: any) => boolean;
			normalize_dist_tags: (pkg: Package) => void;
	}

	declare export type Dist = {
		integrity: string;
		shasum: string;
		tarball: string;
	}

	declare export type Version = {
		name: string;
		version: string;
		devDependencies: string;
		directories: any;
		dist: Dist;
		author?: string;
		homemage?: string;
    license?: string;
    readmeFileName?: string;
    description?: string;
    bin?: string;
    bugs?: any;
    contributors?: Array<string>;
    keywords?: string | Array<string>;
		_hasShrinkwrap: boolean;
	};

	declare export type Logger = {
		child: (conf: any) => any;
		debug: (conf: any) => any;
    info: (conf: any) => any;
	}

	declare export type LocalFS = {
		createWriteStream: (name: string) => Stream;
		readJSON: (fileName: string, callback: Callback) => void;
		unlink: (fileName: string, callback: Callback) => void;
		rmdir: (path: string, callback: Callback) => void;
		lockAndReadJSON: (fileName: string, callback: Callback) => void;
		writeJSON: (fileName: string, json: Package, callback: Callback) => void;
	}

	declare export type Versions = {
		[key: string]: Version;
	}

	declare export type DistFile = {
		url: string;
		hash: string;
		registry?: string;
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
		latest: string;
		[key: string]: Version;
	}

	declare export type Package = {
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
