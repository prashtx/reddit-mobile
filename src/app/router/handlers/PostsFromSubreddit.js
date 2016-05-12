import { BaseHandler, METHODS } from '@r/platform/router';
import * as postsListActions from '../../actions/postsList';

import { cleanObject } from '../../../lib/cleanObject';
import { fetchUserBasedData } from './handlerCommon';

export default class PostsFromSubreddit extends BaseHandler {
  static PageParamsToSubredditPostsParams({ urlParams, queryParams}) {
    const { subredditName, multi, multiUser } = urlParams;
    const { sort, t, after, before } = queryParams;

    return cleanObject({
      subredditName,
      multi,
      multiUser,
      sort,
      t,
      after,
      before,
    });
  }

  async [METHODS.GET](dispatch/*, getState, utils*/) {
    const subredditPostsParams = PostsFromSubreddit.PageParamsToSubredditPostsParams(this);

    dispatch(postsListActions.fetchPostsFromSubreddit(subredditPostsParams));
    fetchUserBasedData(dispatch);
  }
}
