import { objectToHash } from 'lib/objectToHash';

// caching / infinite scroll logic goes here. TODO: abstract
// all of these requestable things with something like `app/models/APIResource`
export function paramsToSearchReqesutParams (params) { return params; }

export function paramsToSearchRequestId (params) {
  return objectToHash(paramsToSearchReqesutParams(params));
}

export const newSearchRequest = (id, params) => ({
  id,
  params,
  loading: true,
  subreddits: [],
  posts: [],
});
