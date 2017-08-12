// @flow

import fs from 'fs';
import Path from 'path';
import mkdirp from 'mkdirp';
import type {ILocalData, LocalStorage} from '@verdaccio/types'; 

/**
 * Handle local database.
 * FUTURE: must be a plugin.
 */
 class LocalData implements ILocalData {

  path: string;
  data: LocalStorage;

  /**
   * Load an parse the local json database.
   * @param {*} path the database path
   */
   constructor(path: string) {
    this.path = path;
    try {
      this.data = JSON.parse(fs.readFileSync(this.path, 'utf8'));
    } catch (_) {
      this.data = {list: []};
    }
  }

  /**
   * Add a new element.
   * @param {*} name
   */
  add(name: string) {
    if (this.data.list.indexOf(name) === -1) {
      this.data.list.push(name);
      this.sync();
    }
  }

  /**
   * Remove an element from the database.
   * @param {*} name
   */
  remove(name: string) {
    const i = this.data.list.indexOf(name);
    if (i !== -1) {
      this.data.list.splice(i, 1);
    }
    this.sync();
  }

  /**
   * Return all database elements.
   * @return {Array}
   */
  get() {
    return this.data.list;
  }

  /**
   * Syncronize {create} database whether does not exist.
   */
  sync() {
    // Uses sync to prevent ugly race condition
    try {
      mkdirp.sync(Path.dirname(this.path));
    } catch (err) {
      // perhaps a logger instance?
      /* eslint no-empty:off */
    }
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }

}

export default LocalData;
