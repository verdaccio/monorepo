import { S3 } from 'aws-sdk';
interface DeleteKeyPrefixOptions {
    Bucket: string;
    Prefix: string;
}
export declare function deleteKeyPrefix(s3: S3, options: DeleteKeyPrefixOptions, callback: (err: Error | null) => void): void;
export {};
