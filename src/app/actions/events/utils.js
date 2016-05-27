import { models } from '@r/api-client';
import url from 'url';

const ID_REGEX = /(?:t\d+_)?(.*)/;

export function convertId (id) {
  if (!id) { return; }

  const unprefixedId = ID_REGEX.exec(id)[1];
  return parseInt(unprefixedId, 36);
}

export function getBasePayload(state) {
  const referrer = state.platform.currentPage.referrer || '';
  const domain = window.location.host;

  const user = getCurrentUserFromState(state);

  const payload = {
    domain,
    geoip_country: state.meta.country,
    user_agent: state.meta.userAgent,
    referrer_domain: url.parse(referrer).host || domain,
    referrer_url: referrer,
  };

  if (user) {
    payload.user_name = user.name;
    payload.user_id = convertId(user.id);
  } else {
    payload.loid = state.loid;
    payload.loid_created = state.loidcreated;
  }

  return payload;
}

export function getCurrentUrlParamsFromState (state) {
  return state.platform.currentPage.urlParams;
}

export function getCurrentSubredditFromState (state) {
  const { subredditName } = getCurrentUrlParamsFromState(state);
  if (!subredditName) { return; }

  return state.subreddits[subredditName];
}

export function getCurrentPostFromState (state) {
  const { postId } = getCurrentUrlParamsFromState(state);
  if (!postId) { return; }

  return state.posts[`t3_${postId}`];
}

export function getCurrentUserFromState (state) {
  const { user, accounts } = state;
  if (user.loggedOut) { return; }

  return accounts[user.name];
}

export function getThingFromStateById (state, id) {
  if (!id) { return; }

  const type = models.ModelTypes.thingType(id);
  if (!type) { return; }

  const objects = state[`${type}s`];
  const thing = objects[id];

  return thing;
}

export async function waitForValidSession(state, waitForState, cb) {
  if (state.session.isValid) {
    return await waitForState(state => state.user.name && state.accounts[state.user.name], cb);
  } else {
    cb(state);
  }
}
