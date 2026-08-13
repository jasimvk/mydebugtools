import {
  addRequestToCollections,
  collectOrphanedRequests,
  parseStoredCollections,
  Collection,
  SavedRequest,
} from '../useCollections';

const baseCollection: Collection = {
  id: 'local-collection',
  name: 'Imported API',
  description: '',
  requests: [],
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
};

const importedRequest: SavedRequest = {
  id: 'local-request',
  name: 'List users',
  method: 'GET',
  url: 'https://api.example.com/users',
  headers: [],
  body: '',
  contentType: 'application/json',
  authConfig: { type: 'none' },
  description: '',
  createdAt: 1700000000001,
  updatedAt: 1700000000001,
};

describe('addRequestToCollections', () => {
  it('adds imported requests to a collection from the latest state snapshot', () => {
    const result = addRequestToCollections([baseCollection], baseCollection.id, importedRequest);

    expect(result[0].requests).toHaveLength(1);
    expect(result[0].requests[0]).toMatchObject({
      name: 'List users',
      url: 'https://api.example.com/users',
    });
  });

  it('does not mutate the previous collection state', () => {
    const result = addRequestToCollections([baseCollection], baseCollection.id, importedRequest);

    expect(baseCollection.requests).toHaveLength(0);
    expect(result).not.toBe([baseCollection]);
  });
});

describe('parseStoredCollections', () => {
  it('returns stored collections when the value is an array', () => {
    expect(parseStoredCollections(JSON.stringify([baseCollection]))).toHaveLength(1);
  });

  it('returns an empty list for corrupt or non-array values instead of breaking the UI', () => {
    expect(parseStoredCollections(null)).toEqual([]);
    expect(parseStoredCollections('not json')).toEqual([]);
    expect(parseStoredCollections('{"id":"oops"}')).toEqual([]);
    expect(parseStoredCollections('"a string"')).toEqual([]);
  });
});

describe('collectOrphanedRequests', () => {
  const cloudCollection: Collection = {
    ...baseCollection,
    id: 'cloud-collection',
    requests: [
      { ...importedRequest, id: 'local-req-1' },
      { ...importedRequest, id: 'cloud-req-1' },
    ],
  };

  it('finds requests that never reached the cloud inside a synced collection', () => {
    expect(collectOrphanedRequests([cloudCollection])).toEqual([
      { collectionId: 'cloud-collection', request: cloudCollection.requests[0] },
    ]);
  });

  it('ignores collections that the collection-level sweep already handles', () => {
    const localCollection: Collection = {
      ...baseCollection,
      requests: [{ ...importedRequest, id: 'local-req-2' }],
    };

    expect(collectOrphanedRequests([localCollection])).toEqual([]);
  });
});

