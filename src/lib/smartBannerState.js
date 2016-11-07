import localStorageAvailable from './localStorageAvailable';
import * as constants from 'app/constants';

const BASE_VAL = {
  showBanner: false,
  clickUrl: '',
};

const TWO_WEEKS = 2 * 7 * 24 * 60 * 60 * 1000;

const ALLOWED_PAGES = new Set([
  'index',
  'listing',
  'comments',
]);

const IOS_USER_AGENTS = [
  'iPhone',
  'iPod',
];

const ANDROID_USER_AGENTS = [
  'Android',
];

const ALLOWED_DEVICES = IOS_USER_AGENTS.concat(ANDROID_USER_AGENTS);

const PAGE_PERCENTAGES = {
  'comments': 5,
};

const USE_BRANCH = 100;

const checkDeviceType = (allowedAgents, userAgentString) => {
  return allowedAgents.some(a => userAgentString.indexOf(a) > -1);
};

export function shouldShowBanner({ actionName, user, userAgent }={}) {
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

  // 3) Check if we're on the right page.
  if (!ALLOWED_PAGES.has(actionName)) { return BASE_VAL; }

  // 4) Check the user agent
  if (!checkDeviceType(ALLOWED_DEVICES, userAgent)) { return BASE_VAL; }

  // Create a bucket; a few rules are going to depend on that
  let userId = '';
  if (user) { userId = user.loid || user.id; }
  const userIdSum = userId.split('').reduce((sum, chr) => sum + chr.charCodeAt(0), 0);
  const bucket = userIdSum % 100;

  // 5) only show to a certain % of users that land on a given page
  for (const pageName in PAGE_PERCENTAGES) {
    if ((actionName === pageName) && (bucket > PAGE_PERCENTAGES[pageName])) {
      return BASE_VAL;
    }
  }

  // Ok, now we know we're actually going to show the banner. Next, we need to
  // determine what urls we're going to use
  // A) Use Branch link
  if (bucket < USE_BRANCH) {
    // just use the universal Branch link
    return {
      ...BASE_VAL,
      showBanner: true,
    };
  }

  // B) Use direct link. have to determine device type
  if (checkDeviceType(IOS_USER_AGENTS, userAgent)) {
    return {
      ...BASE_VAL,
      showBanner: true,
      clickUrl: constants.BANNER_URLS_DIRECT.IOS,
    };
  }

  if (checkDeviceType(ANDROID_USER_AGENTS, userAgent)) {
    return {
      ...BASE_VAL,
      showBanner: true,
      clickUrl: constants.BANNER_URLS_DIRECT.ANDROID,
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
