declare module '@verdaccio/streams' {
  import { PassThrough } from 'stream';

  export interface IReadTarball extends PassThrough {
    abort?: () => void;
  }

  export interface IUploadTarball extends PassThrough {
    done?: () => void;
    abort?: () => void;
  }

  export class ReadTarball extends PassThrough implements IReadTarball {
    abort(): void;
  }

  export class UploadTarball extends PassThrough implements IUploadTarball {
    abort(): void;
    done(): void;
  }
}
