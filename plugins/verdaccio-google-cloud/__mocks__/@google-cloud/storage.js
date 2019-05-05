import MemoryFileSystem from 'memory-fs';

const fs = new MemoryFileSystem();

class File {
  constructor(path, onRemove, onSave) {
    this.onRemove = onRemove;
    this.onSave = onSave;
    this.data = {};
    this.path = path;
    this.exist = false;
    this.name = path.split('/')[0];
  }

  createWriteStream() {
    // return uploadStream;
    const stream = fs.createWriteStream(`/test`);
    process.nextTick(function() {
      stream.on('end', () => {
        stream.emit('response');
      });
      stream.on('close', () => {
        stream.emit('response');
      });
    });

    return stream;
  }

  save(data) {
    this.data = data;
    this.exist = true;
    this.onSave(this.path, this);
    return Promise.resolve(data);
  }

  download() {
    return Promise.resolve([this.data]);
  }

  exists() {
    return [this.exist];
  }

  createReadStream() {
    const readStream = fs.createReadStream('/test');

    return readStream;
  }
  delete() {
    if (this.exist === false) {
      const e = new Error('no such package ENOENT');

      return Promise.reject(e);
    }
    this.onRemove(this.path);

    return Promise.resolve([{}]);
  }
}

class Bucket {
  constructor(options) {
    this.buckets = {};
    this.options = options;
  }

  onRemove(path) {
    delete this.buckets[path];
  }

  onSave(path, file) {
    this.buckets[path] = file;
  }

  file(path) {
    if (this.buckets[path]) {
      return this.buckets[path];
    } else {
      const file = new File(path, this.onRemove.bind(this), this.onSave.bind(this));

      return file;
    }
  }
}

export class Storage {
  constructor(options) {
    this.buckets = {};
    this.options = options;
  }

  bucket(name) {
    if (!this.buckets[name]) {
      const b = new Bucket();
      this.buckets[name] = b;

      return b;
    } else {
      return this.buckets[name];
    }
  }
}

module.exports = { Storage, Bucket, File };
