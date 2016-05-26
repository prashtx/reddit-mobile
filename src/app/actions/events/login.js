import { getBasePayload, convertId } from './utils';
import addIfPresent from '../../../lib/addIfPresent';

function buildLoginData(state) {
  /*
  const payload = {
    ...getBasePayload(state),
    successful: state.successful,
    user_name: state.user.name,
  };

  addIfPresent(payload, 'user_id', convertId(state.user.id));
  addIfPresent(payload, 'loid', state.loid);
  addIfPresent(payload, 'loid_created', state.loidcreated);
  addIfPresent(payload, 'process_notes', state.process_notes);
  addIfPresent(payload, 'email', state.email);
  addIfPresent(payload, 'email_verified', state.has_verified_email);

  // originalUrl can only be a relative url
  if (state.originalUrl) {
    payload.referrer_domain = payload.domain;
    payload.referrer_url = payload.domain + state.originalUrl;
  }

  return payload;
  */
  return {};
}

export const EVENT__LOGIN = 'EVENT__LOGIN';
export const login = () => async (dispatch, getState, { waitForState }) => {
  let state = getState();

  return await waitForState(state => state.user.name && state.accounts[state.user.name], () => {
    state = getState();
    console.log('LOGIN', buildLoginData(state));
  });
};
