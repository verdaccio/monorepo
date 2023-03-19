import { Config } from '@verdaccio/legacy-types';

export interface S3Config extends Config {
  bucket: string;
  keyPrefix: string;
  endpoint?: string;
  region?: string;
  s3ForcePathStyle?: boolean;
  tarballACL?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
}
