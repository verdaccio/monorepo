import Datastore from '@google-cloud/datastore';
import { Config } from '@verdaccio/types';

export interface VerdaccioConfigGoogleStorage extends Config {
  // https://cloud.google.com/nodejs/docs/reference/storage/1.6.x/Bucket
  bucket?: string;
  // TODO: add description
  projectId?: string;
  // https://cloud.google.com/datastore/docs/reference/data/rest/v1/Key
  kind?: string;
  // for local development
  keyFilename?: string;
  // disable bucket validation
  validation?: GoogleValidation;
}

export type GoogleValidation = boolean | string;

export type GoogleCloudOptions = {
  projectId?: string;
  keyFilename?: string;
};

export type GoogleDataStorage = {
  secret: string;
  storage: any;
  datastore: Datastore;
};
