const results = [];
const _symbol = Symbol('KEY');
const defaultResuponse = [
  results,
  {
    endCursor: 'CjgSMmoOZX52ZXJkYW=',
    moreResults: 'NO_MORE_RESULTS'
  }
];
const keyContent = () => {
  const id = Math.random();

  return {
    namespace: undefined,
    id,
    kind: 'metadataDatabaseKey',
    path: ['metadataDatabaseKey', `${id}`]
  };
};

export default class Storage {
  constructor() {
    this.KEY = _symbol;
  }

  int(id) {
    return id;
  }

  key(_key) {
    return _key;
  }

  save(toSave) {
    const data = toSave.data;
    data[this.KEY] = keyContent();

    results.push(data);
    return Promise.resolve();
  }

  update(entity) {
    return {};
  }

  delete(key) {
    const id = key[1];
    let counter = 1;
    const elementToRemove = results.filter((item, index) => {
      const medatada = item[this.KEY];

      if (medatada.id === id) {
        results.splice(index, 0);
        return true;
      }

      return false;
    });

    const response = {
      indexUpdates: counter,
      mutationResults: elementToRemove
    };

    return Promise.resolve([response]);
  }

  createQuery() {
    return {
      filter: () => 'query'
    };
  }
  runQuery(query) {
    return Promise.resolve(defaultResuponse);
  }
}
