import { S3 } from 'aws-sdk';
import { UploadTarball, ReadTarball } from '@verdaccio/streams';
import { HEADERS, HTTP_STATUS } from '@verdaccio/commons-api';
import { Callback, Logger, Package, ILocalPackageManager } from '@verdaccio/types';
import { is404Error, convertS3Error, create409Error } from './s3Errors';
import { deleteKeyPrefix } from './deleteKeyPrefix';
import { S3Config } from './config';
import { HttpError } from 'http-errors';

const pkgFileName = 'package.json';

export default class S3PackageManager implements ILocalPackageManager {
  public config: S3Config;
  public logger: Logger;
  private packageName: string;
  private s3: S3;

  public constructor(config: S3Config, packageName: string, logger: Logger) {
    this.config = config;
    this.packageName = packageName;
    this.logger = logger;
    const { endpoint, region, s3ForcePathStyle, accessKeyId, secretAccessKey } = config;

    this.s3 = new S3({ endpoint, region, s3ForcePathStyle, accessKeyId, secretAccessKey });
    this.logger.trace({ packageName }, 's3: [S3PackageManager constructor] packageName @{packageName}');
    this.logger.trace({ endpoint }, 's3: [S3PackageManager constructor] endpoint @{endpoint}');
    this.logger.trace({ region }, 's3: [S3PackageManager constructor] region @{region}');
    this.logger.trace({ s3ForcePathStyle }, 's3: [S3PackageManager constructor] s3ForcePathStyle @{s3ForcePathStyle}');
    this.logger.trace({ accessKeyId }, 's3: [S3PackageManager constructor] accessKeyId @{accessKeyId}');
    this.logger.trace({ secretAccessKey }, 's3: [S3PackageManager constructor] secretAccessKey @{secretAccessKey}');
  }

  public updatePackage(name: string, updateHandler: Callback, onWrite: Callback, transformPackage: Function, onEnd: Callback): void {
    this.logger.debug({ name }, 's3: [S3PackageManager updatePackage init] @{name}');
    (async () => {
      try {
        const json = await this._getData();
        updateHandler(json, err => {
          if (err) {
            this.logger.error({ err }, 's3: [S3PackageManager updatePackage updateHandler onEnd] @{err}');
            onEnd(err);
          } else {
            const transformedPackage = transformPackage(json);
            this.logger.debug({ transformedPackage }, 's3: [S3PackageManager updatePackage updateHandler onWrite] @{transformedPackage}');
            onWrite(name, transformedPackage, onEnd);
          }
        });
      } catch (err) {
        this.logger.error({ err }, 's3: [S3PackageManager updatePackage updateHandler onEnd catch] @{err}');

        return onEnd(err);
      }
    })();
  }

  private async _getData(): Promise<any> {
    this.logger.debug('s3: [S3PackageManager _getData init]');
    return await new Promise((resolve, reject) => {
      this.s3.getObject(
        {
          Bucket: this.config.bucket,
          Key: `${this.config.keyPrefix}${this.packageName}/${pkgFileName}`
        },
        (err, response) => {
          if (err) {
            this.logger.error({ err }, 's3: [S3PackageManager _getData] aws @{err}');
            const error: HttpError = convertS3Error(err);
            this.logger.error({ error }, 's3: [S3PackageManager _getData] @{error}');

            reject(error);
            return;
          }
          // @ts-ignore
          const body = response.Body.toString();
          let data;
          try {
            data = JSON.parse(body);
          } catch (e) {
            this.logger.error({ body }, 's3: [S3PackageManager _getData] error parsing: @{body}');
            reject(e);
            return;
          }

          this.logger.trace({ data }, 's3: [S3PackageManager _getData body] @{data.name}');
          resolve(data);
        }
      );
    });
  }

  public deletePackage(fileName: string, callback: Callback): void {
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

  public removePackage(callback: Callback): void {
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

  public createPackage(name: string, value: Package, callback: Function): void {
    this.logger.debug({ name, packageName: this.packageName }, 's3: [S3PackageManager createPackage init] name @{name}/@{packageName}');
    this.logger.trace({ value }, 's3: [S3PackageManager createPackage init] name @value');
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
            this.logger.debug({ s3Err }, 's3: [S3PackageManager createPackage] 404 package not found]');
            this.savePackage(name, value, callback);
            this.logger.trace({ data }, 's3: [S3PackageManager createPackage] package saved data from s3: @data');
          } else {
            this.logger.error({ s3Err }, 's3: [S3PackageManager createPackage error] @s3Err');
            callback(s3Err);
          }
        } else {
          this.logger.debug('s3: [S3PackageManager createPackage ] package exist already');
          callback(create409Error());
        }
      }
    );
  }

  public savePackage(name: string, value: Package, callback: Function): void {
    this.logger.debug({ name, packageName: this.packageName }, 's3: [S3PackageManager savePackage init] name @{name}/@{packageName}');
    this.logger.trace({ value }, 's3: [S3PackageManager savePackage ] init value @value');
    this.s3.putObject(
      {
        // TODO: not sure whether save the object with spaces will increase storage size
        Body: JSON.stringify(value, null, '  '),
        Bucket: this.config.bucket,
        Key: `${this.config.keyPrefix}${this.packageName}/${pkgFileName}`
      },
      // @ts-ignore
      callback
    );
  }

  public readPackage(name: string, callback: Function): void {
    this.logger.debug({ name, packageName: this.packageName }, 's3: [S3PackageManager readPackage init] name @{name}/@{packageName}');
    (async (): Promise<void> => {
      try {
        const data = await this._getData();
        this.logger.trace({ data, packageName: this.packageName }, 's3: [S3PackageManager readPackage] packageName: @{packageName} / data @data');
        callback(null, data);
      } catch (err) {
        this.logger.error({ err }, 's3: [S3PackageManager readPackage] @{err}');

        callback(err);
      }
    })();
  }

  public writeTarball(name: string): any {
    this.logger.debug({ name, packageName: this.packageName }, 's3: [S3PackageManager writeTarball init] name @{name}/@{packageName}');
    const uploadStream = new UploadTarball({});

    let streamEnded = 0;
    uploadStream.on('end', () => {
      this.logger.debug({ name, packageName: this.packageName }, 's3: [S3PackageManager writeTarball event: end] name @{name}/@{packageName}');
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
          this.logger.error({ convertedErr }, 's3: [S3PackageManager writeTarball headObject] @convertedErr');

          if (is404Error(convertedErr) === false) {
            this.logger.error({ convertedErr }, 's3: [S3PackageManager writeTarball headObject] non a 404 emit error');

            uploadStream.emit('error', convertedErr);
          } else {
            this.logger.debug('s3: [S3PackageManager writeTarball managedUpload] init stream');
            const managedUpload = this.s3.upload(Object.assign({}, baseS3Params, { Body: uploadStream }));
            // NOTE: there's a managedUpload.promise, but it doesn't seem to work
            const promise = new Promise(resolve => {
              this.logger.debug('s3: [S3PackageManager writeTarball managedUpload] send');
              managedUpload.send((err, data) => {
                if (err) {
                  const error: HttpError = convertS3Error(err);
                  this.logger.error({ error }, 's3: [S3PackageManager writeTarball managedUpload send] emit error @{error}');

                  uploadStream.emit('error', error);
                } else {
                  this.logger.trace({ data }, 's3: [S3PackageManager writeTarball managedUpload send] response @data');

                  resolve();
                }
              });

              this.logger.debug({ name }, 's3: [S3PackageManager writeTarball uploadStream] emit open @{name}');
              uploadStream.emit('open');
            });

            uploadStream.done = () => {
              const onEnd = async (): Promise<void> => {
                try {
                  await promise;

                  this.logger.debug('s3: [S3PackageManager writeTarball uploadStream done] emit success');
                  uploadStream.emit('success');
                } catch (err) {
                  // already emitted in the promise above, necessary because of some issues
                  // with promises in jest
                  this.logger.error({ err }, 's3: [S3PackageManager writeTarball uploadStream done] error @{err}');
                }
              };
              if (streamEnded) {
                this.logger.trace({ name }, 's3: [S3PackageManager writeTarball uploadStream] streamEnded true @{name}');
                onEnd();
              } else {
                this.logger.trace({ name }, 's3: [S3PackageManager writeTarball uploadStream] streamEnded false emit end @{name}');
                uploadStream.on('end', onEnd);
              }
            };

            uploadStream.abort = () => {
              this.logger.debug('s3: [S3PackageManager writeTarball uploadStream abort] init');
              try {
                this.logger.debug('s3: [S3PackageManager writeTarball managedUpload abort]');
                managedUpload.abort();
              } catch (err) {
                const error: HttpError = convertS3Error(err);
                uploadStream.emit('error', error);

                this.logger.error({ error }, 's3: [S3PackageManager writeTarball uploadStream error] emit error @{error}');
              } finally {
                this.logger.debug({ name, baseS3Params }, 's3: [S3PackageManager writeTarball uploadStream abort] s3.deleteObject @{name}/@baseS3Params');

                this.s3.deleteObject(baseS3Params);
              }
            };
          }
        } else {
          this.logger.debug({ name }, 's3: [S3PackageManager writeTarball headObject] emit error @{name} 409');

          uploadStream.emit('error', create409Error());
        }
      }
    );

    return uploadStream;
  }

  public readTarball(name: string): any {
    this.logger.debug({ name, packageName: this.packageName }, 's3: [S3PackageManager readTarball init] name @{name}/@{packageName}');
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
        this.logger.debug({ name, packageName: this.packageName }, 's3: [S3PackageManager readTarball httpHeaders] name @{name}/@{packageName}');
        this.logger.trace({ headers }, 's3: [S3PackageManager readTarball httpHeaders event] headers @headers');
        this.logger.trace({ statusCode }, 's3: [S3PackageManager readTarball httpHeaders event] statusCode @statusCode');
        if (statusCode !== HTTP_STATUS.NOT_FOUND) {
          if (headers[HEADERS.CONTENT_LENGTH]) {
            const contentLength = parseInt(headers[HEADERS.CONTENT_LENGTH], 10);

            // not sure this is necessary
            if (headersSent) {
              return;
            }

            headersSent = true;

            this.logger.debug('s3: [S3PackageManager readTarball readTarballStream event] emit content-length');
            readTarballStream.emit(HEADERS.CONTENT_LENGTH, contentLength);
            // we know there's content, so open the stream
            readTarballStream.emit('open');
            this.logger.debug('s3: [S3PackageManager readTarball readTarballStream event] emit open');
          }
        } else {
          this.logger.trace('s3: [S3PackageManager readTarball httpHeaders event] not found, avoid emit open file');
        }
      })
      .createReadStream();

    readStream.on('error', err => {
      // @ts-ignore
      const error: HttpError = convertS3Error(err);

      readTarballStream.emit('error', error);
      this.logger.error({ error }, 's3: [S3PackageManager readTarball readTarballStream event] error @{error}');
    });

    this.logger.trace('s3: [S3PackageManager readTarball readTarballStream event] pipe');
    readStream.pipe(readTarballStream);

    readTarballStream.abort = () => {
      this.logger.debug('s3: [S3PackageManager readTarball readTarballStream event] request abort');
      request.abort();
      this.logger.debug('s3: [S3PackageManager readTarball readTarballStream event] request destroy');
      readStream.destroy();
    };

    return readTarballStream;
  }
}
