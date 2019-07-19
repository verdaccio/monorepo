import { AWSError } from 'aws-sdk';
import { VerdaccioError } from '@verdaccio/commons-api';
export declare function is404Error(err: VerdaccioError): boolean;
export declare function create404Error(): VerdaccioError;
export declare function is409Error(err: VerdaccioError): boolean;
export declare function create409Error(): VerdaccioError;
export declare function is503Error(err: VerdaccioError): boolean;
export declare function create503Error(): VerdaccioError;
export declare function convertS3Error(err: AWSError): VerdaccioError;
