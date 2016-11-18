// import url from 'url';

import { shouldShowBanner } from 'lib/smartBannerState';
import { show } from 'app/actions/smartBanner';

// function generateLink(payload) {
//   return url.format({
//     protocol: 'https',
//     host: 'reddit.app.link',
//     pathname: '/',
//     query: payload,
//   });
// }

// The branch-sdk module makes an assumption that it runs in a browser
// environment, even just on load, so we cannot import it on the server. Right
// now we import all of the reducers on the server, though, and they in turn
// need access to the smartBanner actions. So we separate the checkAndSet bound
// action creator (which has a branch dependency) from the other smartBanner
// action code, so we can confine branch-sdk to the client.
export const checkAndSet = () => async (dispatch, getState) => {
  const state = getState();
  // XXX
  if (shouldShowBanner(state)) {
    dispatch(show());
  }
  // const {
  //   showBanner,
  //   clickUrl,
  // } = shouldShowBanner(state);


  // XXX
  // const { me={} } = state.accounts;
  // const { loid, loidCreated } = me;
  // if (showBanner) {
  //   if (clickUrl) {
  //     dispatch(show(clickUrl));
  //   } else {
  //     const basePayload = {
  //       channel: 'mweb_branch',
  //       feature: 'interstitial',
  //       campaign: 'xpromo_interstitial',
  //       // We can use this space to fill "tags" which will populate on the
  //       // branch dashboard and allow you sort/parse data. Optional/not required.
  //       // tags: [ 'tag1', 'tag2' ],
  //       // Pass in data you want to appear and pipe in the app,
  //       // including user token or anything else!
  //       '$og_redirect': window.location.href,
  //       '$deeplink_path': window.location.href.split(window.location.host)[1],
  //       mweb_loid: loid,
  //       mweb_loid_created: loidCreated,
  //       utm_source: 'mweb_branch',
  //       utm_medium: 'interstitial',
  //       utm_name: 'xpromo_interstitial',
  //       mweb_user_id36: null,
  //       mweb_user_name: null,
  //     };

  //     const links = [
  //       generateLink({ ...basePayload, utm_content: 'element_1' }),
  //       generateLink({ ...basePayload, utm_content: 'element_2' }),
  //     ];

  //     dispatch(show(links));
  //   }
  // }
};
