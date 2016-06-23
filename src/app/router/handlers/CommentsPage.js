import { BaseHandler, METHODS } from '@r/platform/router';
import * as platformActions from '@r/platform/actions';
import { models } from '@r/api-client';

import isFakeSubreddit from 'lib/isFakeSubreddit';
import { cleanObject } from 'lib/cleanObject';

import * as commentsPageActions from 'app/actions/commentsPage';
import * as replyActions from 'app/actions/reply';
import * as subredditActions from 'app/actions/subreddits';

import { fetchUserBasedData } from './handlerCommon';
import PostsFromSubreddit from './PostsFromSubreddit';

const { POST_TYPE } = models.ModelTypes;
const PostIdRegExp = new RegExp(`^${POST_TYPE}_`);

const ensurePostTypePrefix = postId => {
  if (PostIdRegExp.test(postId)) { return postId; }

  return `${POST_TYPE}_${postId}`;
};

export const NAME = 'CommentsPage';

export default class CommentsPage extends BaseHandler {
  name = NAME;

  static pageParamsToCommentsPageParams({ urlParams, queryParams}) {
    let { postId } = urlParams;
    const { commentId } = urlParams;
    const { sort, context } = queryParams;

    postId = ensurePostTypePrefix(postId);

    let query;
    if (commentId) {
      query = {
        comment: commentId,
        context,
      };
    }

    return cleanObject({
      id: postId,
      sort,
      query,
    });
  }


  async [METHODS.GET](dispatch, getState) {
    const state = getState();
    if (state.platform.shell) { return; }

    const commentsPageParams = CommentsPage.pageParamsToCommentsPageParams(this);

    dispatch(commentsPageActions.fetchCommentsPage(commentsPageParams));
    fetchUserBasedData(dispatch);

    const subredditPostsParams = PostsFromSubreddit.PageParamsToSubredditPostsParams(this);
    const { subredditName } = subredditPostsParams;
    if (!isFakeSubreddit(subredditName)) {
      dispatch(subredditActions.fetchSubreddit(subredditName));
    }
  }

  async [METHODS.POST](dispatch, getState, { waitForState }) {
    const { thingId, text } = this.bodyParams;

    const state = getState();

    if (!state.session.isValid) {
      return dispatch(platformActions.setPage('/login'));
    }

    await waitForState(state => state.session.isValid && !state.sessionRefreshing, () => {
      try {
        dispatch(replyActions.reply(thingId, text));

        // Go back to the state before the comment form was opened, if we can go
        // back. Otherwise, redirect to the redirectUrl passed in.
        if (history && state.platform.history.length) {
          return history.go(-1);
        }/* else {
          // todo fix after implementing referrer
          // dispatch(platformActions.navigateToUrl(METHODS.GET, '/'));
        }*/
      } catch (e) {
        console.log('Error commenting');
        console.log(e);
      }
    });
  }
}
