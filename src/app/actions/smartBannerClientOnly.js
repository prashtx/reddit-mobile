import branch from 'branch-sdk';

import config from 'config';

import getRouteMetaFromState from 'lib/getRouteMetaFromState';
import { shouldShowBanner } from 'lib/smartBannerState';
import { show } from 'app/actions/smartBanner';
import features from 'app/featureFlags';

async function generateLink(payload) {
  return new Promise((resolve, reject) => {
    branch.link(payload, (err, link) => {
      if (err) { return reject(err); }
      resolve(link);
    });
  });
}

// The branch-sdk module makes an assumption that it runs in a browser
// environment, even just on load, so we cannot import it on the server. Right
// now we import all of the reducers on the server, though, and they in turn
// need access to the smartBanner actions. So we separate the checkAndSet bound
// action creator (which has a branch dependency) from the other smartBanner
// action code, so we can confine branch-sdk to the client.
export const checkAndSet = () => async (dispatch, getState) => {
  const state = getState();
  const routeMeta = getRouteMetaFromState(state);
  const {
    showBanner,
    clickUrl,
  } = shouldShowBanner({
    actionName: routeMeta && routeMeta.name,
    loidCreated: state.accounts.me && state.accounts.me.loidCreated,
    userAgent: state.meta.userAgent || '',
    feature: features.withState(state),
  });

  const { me={} } = state.accounts;
  const { loid, loidCreated } = me;

  if (showBanner) {
    if (clickUrl) {
      dispatch(show(clickUrl));
    } else {
      branch.init(config.branchKey, (err, data) => {
        // callback to handle err or data
        window.referring_link = data.referring_link;
        window.referring_data = data.data_parsed;
      });

      const basePayload = {
        channel: 'mweb_branch',
        feature: 'interstitial',
        campaign: 'xpromo_interstitial',
        // We can use this space to fill "tags" which will populate on the
        // branch dashboard and allow you sort/parse data. Optional/not required.
        // tags: [ 'tag1', 'tag2' ],
      };

      const baseData = {
        // Pass in data you want to appear and pipe in the app,
        // including user token or anything else!
        '$og_redirect': window.location.href,
        '$deeplink_path': window.location.href.split(window.location.host)[1],
        mweb_loid: loid,
        mweb_loid_created: loidCreated,
        utm_source: 'mweb_branch',
        utm_medium: 'interstitial',
        utm_name: 'xpromo_interstitial',
        mweb_user_id36: null,
        mweb_user_name: null,
      };

      const links = await Promise.all([
        generateLink({ ...basePayload, data: { ...baseData, utm_content: 'element_1' } }),
        generateLink({ ...basePayload, data: { ...baseData, utm_content: 'element_2' } }),
      ]);
      dispatch(show(links));
    }
  }
};
