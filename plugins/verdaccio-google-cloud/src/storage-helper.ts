import Datastore from '@google-cloud/datastore';
import { Storage } from '@google-cloud/storage';
import { Query } from '@google-cloud/datastore/query';

export default class StorageHelper {
  datastore: Datastore;
  storage: Storage;

  constructor(datastore: Datastore, storage: Storage) {
    this.datastore = datastore;
    this.storage = storage;
  }

  createQuery(key: string, valueQuery: string) {
    const query = this.datastore.createQuery(key).filter('name', valueQuery);

    return query;
  }

  async runQuery(query: Query) {
    const result = await this.datastore.runQuery(query);

    return result;
  }

  async updateEntity(key: string, excludeFromIndexes: any, data: any) {
    const entity = {
      key,
      excludeFromIndexes,
      data
    };

    const result = await this.datastore.update(entity);

    return result;
  }

  async getFile(bucketName: string, path: string) {
    const myBucket = this.storage.bucket(bucketName);
    const file = myBucket.file(path);
    const data = await file.get();
    const fileData = data[0];
    const apiResponse = data[1];

    console.log('fileData', fileData);
    console.log('apiResponse', apiResponse);
  }

  async deleteEntity(key: string, itemId: any) {
    const keyToDelete = this.datastore.key([key, this.datastore.int(itemId)]);
    const deleted = await this.datastore.delete(keyToDelete);

    return deleted;
  }

  async getEntities(key: string) {
    const datastore = this.datastore;
    const query = datastore.createQuery(key);
    const dataQuery = await datastore.runQuery(query);
    const data = dataQuery[0].reduce((accumulator: any, task: any) => {
      const taskKey = task[datastore.KEY];
      if (task.name) {
        accumulator.push({
          id: taskKey.id,
          name: task.name
        });
      }
      return accumulator;
    }, []);
    return data;
  }
}
