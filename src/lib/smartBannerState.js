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

// XXX
// const PAGE_PERCENTAGES = {
//   'comments': 5,
// };

const { USE_BRANCH } = constants.flags;

export function shouldShowBanner(state) {
  // Lots of options we have to consider.
  // 1) Easiest. Make sure local storage exists
  if (!localStorageAvailable()) { return BASE_VAL; }

  // 2) Check if it's been dismissed recently
  const lastClosedStr = localStorage.getItem('bannerLastClosed');
  const lastClosed = lastClosedStr ? new Date(lastClosedStr).getTime() : 0;
  const lastClosedLimit = lastClosed + TWO_WEEKS;
  if (lastClosedLimit > Date.now()) {
    return BASE_VAL;
  }

  const device = getDevice(state);

  // 3) Check the user agent
  if (!ALLOWED_DEVICES.includes(device)) { return BASE_VAL; }

  // XXX Lean on the featureFlags component for the bucketing, so we can in turn rely on r2.
  // // Create a bucket; a few rules are going to depend on that
  // let userId = '';
  // if (user) { userId = user.loid || user.id; }
  // const userIdSum = userId.split('').reduce((sum, chr) => sum + chr.charCodeAt(0), 0);
  // const bucket = userIdSum % 100;

  // // 5) only show to a certain % of users that land on a given page
  // for (const pageName in PAGE_PERCENTAGES) {
  //   if ((actionName === pageName) && (bucket > PAGE_PERCENTAGES[pageName])) {
  //     return BASE_VAL;
  //   }
  // }

  // Ok, now we know we're actually going to show the banner. Next, we need to
  // determine what urls we're going to use
  // A) Use Branch link
  const feature = features.withContext({ state });
  if (feature && feature.enabled(USE_BRANCH)) {
    // just use the universal Branch link
    return {
      ...BASE_VAL,
      showBanner: true,
    };
  }

  // B) Use direct link. have to determine device type
  if (IOS_DEVICES.includes(device)) {
    return {
      ...BASE_VAL,
      showBanner: true,
      deepLinks: [constants.BANNER_URLS_DIRECT.IOS],
    };
  }

  if (device === ANDROID) {
    return {
      ...BASE_VAL,
      showBanner: true,
      deepLinks: [constants.BANNER_URLS_DIRECT.ANDROID],
    };
  }

  // C) don't have that device listed. infamous 'this should never happen' here.
  return BASE_VAL;
}

export function markBannerClosed() {
  if (!localStorageAvailable()) { return false; }

  // note that we dismissed the banner
  localStorage.setItem('bannerLastClosed', new Date());
}
