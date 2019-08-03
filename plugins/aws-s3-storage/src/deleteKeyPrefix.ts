import { S3 } from 'aws-sdk';
import { convertS3Error, create404Error } from './s3Errors';

interface DeleteKeyPrefixOptions {
  Bucket: string;
  Prefix: string;
}

export function deleteKeyPrefix(s3: S3, options: DeleteKeyPrefixOptions, callback: (err: Error | null) => void) {
  s3.listObjectsV2(options, (err, data) => {
    if (err) {
      callback(convertS3Error(err));
    } else if (data.KeyCount) {
      s3.deleteObjects(
        {
          Bucket: options.Bucket,
          // @ts-ignore
          Delete: { Objects: data.Contents.map(({ Key }) => ({ Key })) }
        },
        (err, data) => {
          if (err) {
            callback(convertS3Error(err));
          } else {
            callback(null);
          }
        }
      );
    } else {
      callback(create404Error());
    }
  });
}
