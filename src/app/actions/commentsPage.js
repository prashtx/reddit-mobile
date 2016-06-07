import { some } from 'lodash/collection';

import { apiOptionsFromState } from 'lib/apiOptionsFromState';
import features from 'app/featureFlags';
import { endpoints } from '@r/api-client';
import { paramsToCommentsPageId } from 'app/models/CommentsPage';
import { receivedResponse } from './apiResponse';
import { paramsToPostsListsId } from 'app/models/PostsList';
import { fetchingSubredditPosts, receivedPostList } from 'app/actions/postsList';

const { CommentsEndpoint, PostsEndpoint } = endpoints;

export const FETCHING_COMMENTS_PAGE = 'FETCHING_COMMENTS_PAGE';

export const fetchingCommentsPage = (commentsPageId, commentsPageParams) => ({
  type: FETCHING_COMMENTS_PAGE,
  commentsPageId,
  commentsPageParams,
});

export const RECEIVED_COMMENTS_PAGE = 'RECEIVED_COMMENTS_PAGE';

export const receivedCommentsPage = (commentsPageId, commentsPageResults) => ({
  type: RECEIVED_COMMENTS_PAGE,
  commentsPageId,
  commentsPageResults,
});

export const fetchCommentsPage = commentsPageParams => async (dispatch, getState) => {
  const state = getState();
  const commentsPageId = paramsToCommentsPageId(commentsPageParams);
  const commentsPage = state.commentsPages[commentsPageId];

  if (commentsPage) { return; }

  dispatch(fetchingCommentsPage(commentsPageId, commentsPageParams));

  // note that the comments endpoint returns the post, so we don't have to also
  // fetch that somewere else. it's in the api response so the apiResponseReducers
  // will automatically update the post slice of the store
  const apiOptions = apiOptionsFromState(state);
  const apiResponse = await CommentsEndpoint.get(apiOptions, commentsPageParams);
  dispatch(receivedResponse(apiResponse));

  dispatch(receivedCommentsPage(commentsPageId, apiResponse.results));
};

function canGetSubreddit(state) {
  if (state.platform.currentPage.urlParams.subredditName) {
    return true;
  }

  const { commentsPages } = state;
  if (!commentsPages) {
    return false;
  }

  const { current } = commentsPages;
  if (!current) {
    return false;
  }

  return some(commentsPages[current].results, result =>
    state.comments[result.uuid] && !!state.comments[result.uuid].subreddit);
}

function getSubreddit(state) {
  if (state.platform.currentPage.urlParams.subredditName) {
    return state.platform.currentPage.urlParams.subredditName;
  }

  const { commentsPages } = state;
  const { current } = commentsPages;
  return state.comments[commentsPages[current].results[0].uuid].subreddit;
}

export const fetchRelevantContent =
  () => async (dispatch, getState, { waitForState }) => {
    await waitForState(canGetSubreddit, async () => {
      const state = getState();
      const feature = features.withContext({ state });
      const subredditName = getSubreddit(state);
      if (feature.enabled('foo')) {
        console.log('fetching posts'); // XXX
        const postsParams = {
          subredditName,
        };
        const postsListId = paramsToPostsListsId(postsParams);
        const postsList = state.postsLists[postsListId];

        if (!postsList) {
          dispatch(fetchingSubredditPosts(postsListId, postsParams));
          const apiOptions = apiOptionsFromState(state);
          const apiResponse = await PostsEndpoint.get(apiOptions, postsParams);
          dispatch(receivedResponse(apiResponse));
          dispatch(receivedPostList(postsListId, apiResponse.results));
        // const postsResponse = await PostsEndpoint.get(apiOptions, { subredditName: 'gaming'});
        }
      }
    });
  };
