import { BaseHandler, METHODS } from '@r/platform/router';
import * as subredditActions from 'app/actions/subreddits';

import { fetchUserBasedData } from './handlerCommon';

export const NAME = 'SubredditAboutPage';

export default class SubredditAboutPage extends BaseHandler {
  name = NAME;

  async [METHODS.GET](dispatch, getState/*, utils*/) {
    const state = getState();
    if (state.platform.shell) { return; }

    const { subredditName } = this.urlParams;
    dispatch(subredditActions.fetchSubreddit(subredditName));
    fetchUserBasedData(dispatch);
  }
}
