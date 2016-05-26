import { getBasePayload, convertId } from './utils';
import { buildPageviewData } from './pageview';

export function buildSearchData(state) {
  /*
  */
  return {};
}

export const EVENT__SEARCH = 'EVENT__SEARCH';
export const search = () => async (dispatch, getState, { waitForState }) => {
  let state = getState();

  if (state.session.isValid) {
    return await waitForState(state => state.user.name && state.accounts[state.user.name], () => {
      state = getState();
      const initialData = buildPageviewData(state);
      console.log('SEARCH', buildSearchData(initialData));
    });
  }

  const initialData = buildPageviewData(state);
  console.log('SEARCH', buildSearchData(initialData));
};

// search_cancelled
// search_opened
// search_executed
// search_form_cleared
