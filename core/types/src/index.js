
declare module "@verdaccio/types" {
	declare export interface Storage {
		getPackages(name: string): void;
	}

	declare export type Config = {
		storage: string;
	}

	declare export interface ILocalData {
		add(name: string): void;
	}
}