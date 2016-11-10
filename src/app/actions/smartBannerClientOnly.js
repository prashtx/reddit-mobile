import branch from 'branch-sdk';

import config from 'config';

import getRouteMetaFromState from 'lib/getRouteMetaFromState';
import { shouldShowBanner } from 'lib/smartBannerState';
import { show } from 'app/actions/smartBanner';

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
    userAgent: state.meta.userAgent || '',
    user: state.accounts[state.user.name],
  });
  if (showBanner) {
    if (clickUrl) {
      dispatch(show(clickUrl));
    } else {
      branch.init(config.branchKey, (err, data) => {
        // callback to handle err or data
        window.referring_link = data.referring_link;
        window.referring_data = data.data_parsed;
      });

      branch.link(
        {
          channel: 'Web',
          feature: 'Banner',
          // We can use this space to fill "tags" which will populate on the
          // branch dashboard and allow you sort/parse data. Optional/not required.
          // tags: [ 'tag1', 'tag2' ],
          data: {
            // Pass in data you want to appear and pipe in the app,
            // including user token or anything else!
            '$og_redirect': window.location.href,
            '$deeplink_path': window.location.href.split(window.location.host)[1],
          },
        },
        (err, link) => {
          dispatch(show(link));
        }
      );  
    }
  }
};
