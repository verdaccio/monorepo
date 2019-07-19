import { Callback, AuthConf, Config, IPluginAuth } from '@verdaccio/types';
export interface VerdaccioConfigApp extends Config {
    file: string;
}
/**
 * HTPasswd - Verdaccio auth class
 */
export default class HTPasswd implements IPluginAuth<VerdaccioConfigApp> {
    /**
     *
     * @param {*} config htpasswd file
     * @param {object} stuff config.yaml in object from
     */
    users: {};
    stuff: {};
    config: {};
    verdaccioConfig: Config;
    maxUsers: number;
    path: string;
    logger: {};
    lastTime: any;
    constructor(config: AuthConf, stuff: VerdaccioConfigApp);
    /**
     * authenticate - Authenticate user.
     * @param {string} user
     * @param {string} password
     * @param {function} cd
     * @returns {function}
     */
    authenticate(user: string, password: string, cb: Callback): void;
    /**
     * Add user
     * 1. lock file for writing (other processes can still read)
     * 2. reload .htpasswd
     * 3. write new data into .htpasswd.tmp
     * 4. move .htpasswd.tmp to .htpasswd
     * 5. reload .htpasswd
     * 6. unlock file
     *
     * @param {string} user
     * @param {string} password
     * @param {function} realCb
     * @returns {function}
     */
    adduser(user: string, password: string, realCb: Callback): any;
    /**
     * Reload users
     * @param {function} callback
     */
    reload(callback: Callback): void;
    _stringToUt8(authentication: string): string;
    _writeFile(body: string, cb: Callback): void;
    /**
     * changePassword - change password for existing user.
     * @param {string} user
     * @param {string} password
     * @param {function} cd
     * @returns {function}
     */
    changePassword(user: string, password: string, newPassword: string, realCb: Callback): void;
}
