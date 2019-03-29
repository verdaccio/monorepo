import { AWSError } from 'aws-sdk';

class VerdaccioError extends Error {
  httpCode: number;
  code: string;
  constructor(message: string, httpCode: number | string, code: string) {
    super(message);
    this.httpCode = httpCode as number;
    this.code = code;
  }
}

const error404Code = 'ENOENT';

export function is404Error(err: VerdaccioError) {
  return err.code === error404Code;
}

export function create404Error() {
  return new VerdaccioError('no such package available', 404, error404Code);
}

const error409Code = 'EEXISTS';

export function is409Error(err: VerdaccioError) {
  return err.code === error409Code;
}

export function create409Error() {
  return new VerdaccioError('file exists', 409, error409Code);
}

const error503Code = 'EAGAIN';

export function is503Error(err: VerdaccioError) {
  return err.code === error503Code;
}

export function create503Error() {
  return new VerdaccioError('resource temporarily unavailable', 500, error503Code);
}

export function convertS3Error(err: AWSError): VerdaccioError {
  switch (err.code) {
    case 'NoSuchKey':
    case 'NotFound':
      return create404Error();
    case 'RequestAbortedError':
      return new VerdaccioError('request aborted', 0, 'ABORTED');
    default:
      return new VerdaccioError(err.message, err.statusCode, err.code);
  }
}
