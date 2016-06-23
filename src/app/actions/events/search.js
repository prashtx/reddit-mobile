import { buildPageviewData } from './pageview';
import { waitForValidSession } from './utils';

import { getEventTracker } from 'lib/eventTracker';

import { NAME as Search} from 'app/router/handlers/SearchPage';
import { dataRequiredForHandler } from 'app/actions/events/pageview';

const SEARCH_EXECUTED = 'search_executed';
const SEARCH_CANCELLED = 'search_cancelled';
const SEARCH_OPENED = 'search_opened';
const SEARCH_FORM_CLEARED = 'search_form_cleared';

export function formatParams(params) {
  console.log(params);
  if (!params) { return {}; }

  return params.searchParams;
}

export function formatResponse(response) {
  if (!response) { return {}; }
  return { results: response.results.length };
}

export function buildSearchData(state, params, response) {
  const payload = {
    ...buildPageviewData(state, Search),
    ...formatParams(params),
    ...formatResponse(response),
  };

  return payload;
}

export const EVENT__SEARCH_EXECUTED = 'EVENT__SEARCH_EXECUTED';
export const executed = (params, response) =>
  async (dispatch, getState, { waitForState }) => {
    return await waitForState((state) => (dataRequiredForHandler(state, Search)), () => {
      const state = getState();
      const data = buildSearchData(state, params, response);
      data.type = SEARCH_EXECUTED;
      console.log('SEARCH_EXECUTED', data);
      getEventTracker(state).track('search_events', 'search_executed', data);
    });
  };

export const EVENT__SEARCH_CANCELLED = 'EVENT__SEARCH_CANCELLED';
export const cancelled = () =>
  async (dispatch, getState, { waitForState }) => {
    const state = getState();
    await waitForValidSession(state, waitForState, newState => {
      const data = buildSearchData(newState);
      data.type = SEARCH_CANCELLED;
      console.log(data);
      getEventTracker(newState).track('search_events', 'search_cancelled', data);
    });
  };

export const EVENT__SEARCH_OPENED = 'EVENT__SEARCH_OPENED';
export const opened = () =>
  async (dispatch, getState, { waitForState }) => {
    const state = getState();
    await waitForValidSession(state, waitForState, newState => {
      const data = buildSearchData(newState);
      data.type = SEARCH_OPENED;
      console.log(data);
      getEventTracker(newState).track('search_events', 'search_opened', data);
    });
  };

export const EVENT__SEARCH_FORM_CLEARED = 'EVENT__SEARCH_FORM_CLEARED';
export const formCleared = () =>
  async (dispatch, getState, { waitForState }) => {
    const state = getState();
    await waitForValidSession(state, waitForState, newState => {
      const data = buildSearchData(newState);
      data.type = SEARCH_FORM_CLEARED;
      console.log(data);
      getEventTracker(newState).track('search_events', 'search_form_cleared', data);
    });
  };
