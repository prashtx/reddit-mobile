import { BaseHandler, METHODS } from '@r/platform/router';
import * as subredditActions from 'app/actions/subreddits';

export const NAME = 'ToggleSubredditSubscription';

export default class ToggleSubredditSubscription extends BaseHandler {
  name = NAME;

  async [METHODS.POST](dispatch) {
    dispatch(subredditActions.toggleSubscription(this.bodyParams));
  }
}
