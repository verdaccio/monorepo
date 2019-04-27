import { S3 } from 'aws-sdk';
import { UploadTarball, ReadTarball } from '@verdaccio/streams';
import { Callback, Logger, Package, ILocalPackageManager } from '@verdaccio/types';
import { is404Error, convertS3Error, create409Error } from './s3Errors';
import { deleteKeyPrefix } from './deleteKeyPrefix';
import { S3Config } from './config';

const pkgFileName = 'package.json';

export default class S3PackageManager implements ILocalPackageManager {
  config: S3Config;
  logger: Logger;
  packageName: string;
  s3: S3;
  _localData: any;

  constructor(config: S3Config, packageName: string, logger: Logger) {
    this.config = config;
    this.packageName = packageName;
    this.logger = logger;
    this.s3 = new S3({
      endpoint: this.config.endpoint,
      region: this.config.region,
      s3ForcePathStyle: this.config.s3ForcePathStyle
    });
  }

  updatePackage(name: string, updateHandler: Callback, onWrite: Callback, transformPackage: Function, onEnd: Callback) {
    (async () => {
      try {
        const json = await this._getData();
        updateHandler(json, err => {
          if (err) {
            onEnd(err);
          } else {
            onWrite(name, transformPackage(json), onEnd);
          }
        });
      } catch (err) {
        return onEnd(err);
      }
    })();
  }

  async _getData(): Promise<any> {
    return await new Promise((resolve, reject) => {
      this.s3.getObject(
        {
          Bucket: this.config.bucket,
          Key: `${this.config.keyPrefix}${this.packageName}/${pkgFileName}`
        },
        (err, response) => {
          if (err) {
            reject(convertS3Error(err));
            return;
          }
          let data;
          try {
            // @ts-ignore
            data = JSON.parse(response.Body.toString());
          } catch (e) {
            reject(e);
            return;
          }
          resolve(data);
        }
      );
    });
  }

  deletePackage(fileName: string, callback: Callback) {
    this.s3.deleteObject(
      {
        Bucket: this.config.bucket,
        Key: `${this.config.keyPrefix}${this.packageName}/${fileName}`
      },
      (err, data) => {
        if (err) {
          callback(err);
        } else {
          callback(null);
        }
      }
    );
  }

  removePackage(callback: Callback): void {
    deleteKeyPrefix(
      this.s3,
      {
        Bucket: this.config.bucket,
        Prefix: `${this.config.keyPrefix}${this.packageName}`
      },
      // @ts-ignore
      callback
    );
  }

  createPackage(name: string, value: Package, callback: Function) {
    this.s3.headObject(
      {
        Bucket: this.config.bucket,
        Key: `${this.config.keyPrefix}${this.packageName}/${pkgFileName}`
      },
      (err, data) => {
        if (err) {
          const s3Err = convertS3Error(err);
          // only allow saving if this file doesn't exist already
          if (is404Error(s3Err)) {
            this.savePackage(name, value, callback);
          } else {
            callback(s3Err);
          }
        } else {
          callback(create409Error());
        }
      }
    );
  }

  savePackage(name: string, value: Package, callback: Function) {
    this.s3.putObject(
      {
        Body: JSON.stringify(value, null, '  '),
        Bucket: this.config.bucket,
        Key: `${this.config.keyPrefix}${this.packageName}/${pkgFileName}`
      },
      // @ts-ignore
      callback
    );
  }

  readPackage(name: string, callback: Function) {
    (async () => {
      try {
        const data = await this._getData();
        callback(null, data);
      } catch (err) {
        callback(err);
      }
    })();
  }

  writeTarball(name: string) {
    const uploadStream = new UploadTarball({});

    let streamEnded = 0;
    uploadStream.on('end', () => {
      streamEnded = 1;
    });

    const baseS3Params = {
      Bucket: this.config.bucket,
      Key: `${this.config.keyPrefix}${this.packageName}/${name}`
    };

    // NOTE: I'm using listObjectVersions so I don't have to download the full object with getObject.
    // Preferably, I'd use getObjectMetadata or getDetails when it's available in the node sdk
    // TODO: convert to headObject
    this.s3.headObject(
      {
        Bucket: this.config.bucket,
        Key: `${this.config.keyPrefix}${this.packageName}/${name}`
      },
      (err, response) => {
        if (err) {
          const convertedErr = convertS3Error(err);
          if (!is404Error(convertedErr)) {
            uploadStream.emit('error', convertedErr);
          } else {
            const managedUpload = this.s3.upload(Object.assign({}, baseS3Params, { Body: uploadStream }));
            // NOTE: there's a managedUpload.promise, but it doesn't seem to work

            const promise = new Promise((resolve, reject) => {
              managedUpload.send((err, data) => {
                if (err) {
                  uploadStream.emit('error', convertS3Error(err));
                } else {
                  resolve();
                }
              });
              uploadStream.emit('open');
            });

            uploadStream.done = () => {
              const onEnd = async () => {
                try {
                  await promise;
                  uploadStream.emit('success');
                } catch (err) {
                  // already emitted in the promise above, necessary because of some issues
                  // with promises in jest
                }
              };
              if (streamEnded) {
                onEnd();
              } else {
                uploadStream.on('end', onEnd);
              }
            };

            uploadStream.abort = () => {
              try {
                managedUpload.abort();
              } catch (err) {
                uploadStream.emit('error', convertS3Error(err));
              } finally {
                this.s3.deleteObject(baseS3Params);
              }
            };
          }
        } else {
          uploadStream.emit('error', create409Error());
        }
      }
    );

    return uploadStream;
  }

  readTarball(name: string) {
    const readTarballStream = new ReadTarball({});

    const request = this.s3.getObject({
      Bucket: this.config.bucket,
      Key: `${this.config.keyPrefix}${this.packageName}/${name}`
    });

    let headersSent = false;

    const readStream = request
      .on('httpHeaders', (statusCode, headers) => {
        // don't process status code errors here, we'll do that in readStream.on('error'
        // otherwise they'll be processed twice

        // verdaccio force garbage collects a stream on 404, so we can't emit more
        // than one error or it'll fail
        // https://github.com/verdaccio/verdaccio/blob/c1bc261/src/lib/storage.js#L178
        if (statusCode !== 404) {
          if (headers['content-length']) {
            const contentLength = parseInt(headers['content-length'], 10);

            // not sure this is necessary
            if (headersSent) {
              return;
            }

            headersSent = true;

            readTarballStream.emit('content-length', contentLength);
            // we know there's content, so open the stream
            readTarballStream.emit('open');
          }
        }
      })
      .createReadStream();

    readStream.on('error', err => {
      // @ts-ignore
      readTarballStream.emit('error', convertS3Error(err));
    });

    readStream.pipe(readTarballStream);

    readTarballStream.abort = () => {
      request.abort();
      readStream.destroy();
    };

    return readTarballStream;
  }
}
