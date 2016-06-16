import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { some } from 'lodash/collection';

import { flags } from 'app/constants';
import { featuresSelector } from 'app/selectors/features';

import CommentsList from 'app/components/CommentsList';
import CommentsPageTools from 'app/components/CommentsPage/CommentsPageTools';
import Post from 'app/components/Post';
import Loading from 'app/components/Loading';
import SubNav from 'app/components/SubNav';
import RelevantContent from 'app/components/RelevantContent';

import CommentsPageHandler from 'app/router/handlers/CommentsPage';
import { paramsToCommentsPageId } from 'app/models/CommentsPage';
import { paramsToPostsListsId } from 'app/models/PostsList';
import { unabbreviateComments } from 'app/actions/commentsPage';

const {
  VARIANT_NEXTCONTENT_BOTTOM,
} = flags;

const commentsPageSelector = createSelector(
  (state, props) => props,
  (state) => state.commentsPages,
  (state) => state.posts,
  (state) => state.platform.currentPage,
  featuresSelector,
  (state) => state.postsLists,
  (pageProps, commentsPages, posts, currentPage, feature, postsLists) => {
    const commentsPageParams = CommentsPageHandler.pageParamsToCommentsPageParams(pageProps);
    const commentsPageId = paramsToCommentsPageId(commentsPageParams);
    const commentsPage = commentsPages[commentsPageId];
    const topLevelComments = (!commentsPage || commentsPage.loading)
      ? []
      : commentsPage.results;

    const permalinkBase = pageProps.url;
    const postLoaded = !!posts[commentsPageParams.id];

    const replying = currentPage.queryParams.commentReply === commentsPageParams.id;

    const { subredditName } = commentsPageParams;
    const postsParams = {
      subredditName,
    };
    const postsListId = paramsToPostsListsId(postsParams);
    const postsList = postsLists[postsListId];

    const topPosts = (!postsList || postsList.loading) ? [] : postsList.results;

    return {
      postLoaded,
      commentsPageParams,
      commentsPage,
      commentsPageId,
      permalinkBase,
      topLevelComments,
      currentPage,
      replying,
      feature,
      topPosts,
    };
  },
);

export const CommentsPage = connect(commentsPageSelector)((props) => {
  const {
    commentsPage,
    commentsPageParams,
    topLevelComments,
    permalinkBase,
    postLoaded,
    currentPage,
    replying,
    feature,
    topPosts,
  } = props;

  return (
    <div className='CommentsPage BelowTopNav'>
      { postLoaded && <SubNav /> }
      { !postLoaded ?
        <Loading /> : [
          <Post postId={ commentsPageParams.id } single={ true } key='post' />,
          <CommentsPageTools
            key='tools'
            replying={ replying }
            currentPage={ currentPage }
            id={ commentsPageParams.id }
          />,
        ]
      }

      { !commentsPage || commentsPage.loading ?
        <Loading /> :
        <CommentsList
          commentRecords={ topLevelComments }
          permalinkBase={ permalinkBase }
          className={ 'CommentsList__topLevel' }
        /> }

      { some([
        'foo', // XXX
        VARIANT_NEXTCONTENT_BOTTOM,
      ], x => feature.enabled(x)) &&
        <RelevantContent
          listingId={ commentsPageParams.id }
          subreddit={ {} }
          subredditName='someSubredditWooHoo'
          posts={ topPosts }
        />
      }
    </div>
  );
});
