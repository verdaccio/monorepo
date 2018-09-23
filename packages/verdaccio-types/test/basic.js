// @flow

// some info
// https://medium.com/@gcanti/testing-flow-declaration-files-69915089fa68

import type {Callback, Logger} from '@verdaccio/types';

function callback(cb: Callback) {

}

// logger
const logger: Logger = {
	child: (conf) => {},
	debug: (conf) => {},
	error: (conf) => {},
	http: (conf) => {},
	trace: (conf) => {},
	warn: (conf) => {},
	info: (conf) => {},
};
