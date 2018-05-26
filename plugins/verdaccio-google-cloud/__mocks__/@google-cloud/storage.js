import fs from 'fs';
import path from 'path';

class File {
  constructor(path) {
    this.path = path;
  }

  createWriteStream() {
    /* eslint-disable */
    const ws = require('stream').Writable();
    /* eslint-disable */
    ws._write = function(chunk, enc, next) {
      next();
    };

    return ws;
  }
  createReadStream() {
    const stream = fs.createReadStream(path.join(__dirname, './file.tgz'));

    return stream;
  }
  delete() {
    return Promise.resolve();
  }
}

class Bucket {
  constructor(options) {
    this.options = options;
  }

  file(path) {
    return new File(path);
  }
}

export default class Storage {
  bucket(config) {
    return new Bucket();
  }
}
