import url from 'url';

import localStorageAvailable from './localStorageAvailable';
import { getDevice, IOS_DEVICES, ANDROID } from 'lib/getDeviceFromState';
import * as constants from 'app/constants';
import features from 'app/featureFlags';

const BASE_VAL = {
  showBanner: false,
  deepLinks: [],
};

const TWO_WEEKS = 2 * 7 * 24 * 60 * 60 * 1000;

const ALLOWED_DEVICES = IOS_DEVICES.concat(ANDROID);

const { USE_BRANCH } = constants.flags;

export function getBranchLink(state, payload={}) {
  const { me={} } = state.accounts;
  const { loid, loidCreated } = me;

  const basePayload = {
    channel: 'mweb_branch',
    feature: 'smartbanner',
    campaign: 'xpromo_banner',
    // We can use this space to fill "tags" which will populate on the
    // branch dashboard and allow you sort/parse data. Optional/not required.
    // tags: [ 'tag1', 'tag2' ],
    // Pass in data you want to appear and pipe in the app,
    // including user token or anything else!
    '$og_redirect': window.location.href,
    '$deeplink_path': window.location.href.split(window.location.host)[1],
    mweb_loid: loid,
    mweb_loid_created: loidCreated,
    utm_source: 'mweb_branch',
    utm_medium: 'smartbanner',
    utm_name: 'xpromo_banner',
    mweb_user_id36: null,
    mweb_user_name: null,
  };

  return url.format({
    protocol: 'https',
    host: 'reddit.app.link',
    pathname: '/',
    query: {...basePayload, ...payload},
  });
}

export function getDeepLink(state) {
  const device = getDevice(state);
  if (!ALLOWED_DEVICES.includes(device)) {
    return null;
  }

  // See if we should use a Branch link
  const feature = features.withContext({ state });
  if (feature && feature.enabled(USE_BRANCH)) {
    // just use the universal Branch link
    return getBranchLink(state);
  }

  // Otherwise use a basic deep link

  if (IOS_DEVICES.includes(device)) {
    return constants.BANNER_URLS_DIRECT.IOS;
  }

  if (device === ANDROID) {
    return constants.BANNER_URLS_DIRECT.ANDROID;
  }
}

export function shouldShowBanner(state) {
  // Lots of options we have to consider.
  // 1) Easiest. Make sure local storage exists
  if (!localStorageAvailable()) { return BASE_VAL; }

  // 2) Check if it's been dismissed recently
  const lastClosedStr = localStorage.getItem('bannerLastClosed');
  const lastClosed = lastClosedStr ? new Date(lastClosedStr).getTime() : 0;
  const lastClosedLimit = lastClosed + TWO_WEEKS;
  if (lastClosedLimit > Date.now()) {
    return false;
  }

  const device = getDevice(state);

  // 3) Check the user agent
  if (!ALLOWED_DEVICES.includes(device)) {
    return false;
  }

  return true;
}

export function markBannerClosed() {
  if (!localStorageAvailable()) { return false; }

  // note that we dismissed the banner
  localStorage.setItem('bannerLastClosed', new Date());
}
