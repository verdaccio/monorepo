/* @flow */

declare module "@verdaccio/file-locking" {
	
  declare export type LockOptions = {
    lock?: boolean,    
    parse?: boolean
  };

	declare export function readFile(name: string, data: any, callback: Function): void;
	declare export function unlockFile(name: string, callback: Function): void;
	declare export function lockFile(name: string, callback: Function): void;

}
