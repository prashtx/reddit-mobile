import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import { endpoints } from '@r/api-client';
import { paramsToSearchRequestId } from 'app/models/SearchRequest';

const { SearchEndpoint } = endpoints;

export const FETCHING_SEARCH_REQUEST = 'FETCHING_SEARCH_REQUEST';
export const fetching = (id, params) => ({
  type: FETCHING_SEARCH_REQUEST,
  id,
  params,
});

export const RECEIVED_SEARCH_REQUEST = 'RECEIVED_SEARCH_REQUEST';
export const received = (id, apiResponse) => ({ type: RECEIVED_SEARCH_REQUEST, id, apiResponse });

export const search = searchParams => async (dispatch, getState) => {
  const state = getState();
  const id = paramsToSearchRequestId(searchParams);
  const currentRequest = state.searchRequests[id];

  if (currentRequest) { return; }

  dispatch(fetching(id, searchParams));

  const apiResponse = await SearchEndpoint.get(apiOptionsFromState(state), searchParams);
  dispatch(searched(searchParams, apiResponse));
  dispatch(receivedResponse(apiResponse));

  const subreddits = subredditFilter(apiResponse.results);
  const posts = postFilter(apiResponse.results);

  dispatch(received(id, apiResponse));
};

export const SEARCHED = 'SEARCHED';
export const searched = (searchParams, response) => ({ type: SEARCHED, searchParams, response });

export const OPEN_SEARCH = 'OPEN_SEARCH';
export const openSearch = () => ({ type: OPEN_SEARCH });

export const CLOSE_SEARCH = 'CLOSE_SEARCH';
export const closeSearch = () => ({ type: CLOSE_SEARCH });

export const CLEAR_SEARCH = 'CLEAR_SEARCH';
export const clearSearch = () => ({ type: CLEAR_SEARCH });
