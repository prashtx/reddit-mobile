import { getEventTracker } from 'lib/eventTracker';

import { getBasePayload } from './utils';

function buildLoginData(state) {
  const payload = {
    ...getBasePayload(state),
    //successful: state.successful,
    //user_name: state.user.name,
  };

  /*
  addIfPresent(payload, 'process_notes', state.process_notes);
  addIfPresent(payload, 'email', state.email);
  addIfPresent(payload, 'email_verified', state.has_verified_email);
  */

  return payload;
}

export const EVENT__LOGIN = 'EVENT__LOGIN';
export const login = () => async (dispatch, getState, { waitForState }) => {
  let state = getState();

  return await waitForState(state => state.user.name && state.accounts[state.user.name], () => {
    state = getState();
    const data = buildLoginData(state);
    console.log('LOGIN', data);
    getEventTracker(state).track('login_events', 'cs.login_attempt', data);
  });
};
