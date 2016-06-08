import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { models } from '@r/api-client';

import { filter, some } from 'lodash/collection';
import { take } from 'lodash/array';

import localStorageAvailable from 'lib/localStorageAvailable';

import { featuresSelector } from 'app/selectors/features';
import { flags, VISITED_POSTS_KEY } from 'app/constants';

import PostContent from 'app/components/Post/PostContent';

import {
  isPostDomainExternal,
} from 'app/components/Post/postUtils';

const { PostModel } = models;
// XXX
//
//import {
//  isPostDomainExternal,
//  postShouldRenderMediaFullbleed,
//} from './postUtils';
//
//import PostHeader from './PostHeader';
//import PostContent from './PostContent';
//import PostFooter from './PostFooter';

const {
  VARIANT_RELEVANCY_TOP,
  VARIANT_NEXTCONTENT_TOP3,
} = flags;

const NUM_TOP_LINKS = 3;

const T = React.PropTypes;

RelevantContent.propTypes = {
  feature: T.object,
  links: T.arrayOf(T.instanceOf(PostModel)),

  // postId: T.string,
  // user: T.object,
  // compact: T.bool,
  // hideComments: T.bool,
  // hideSubredditLabel: T.bool,
  // hideWhen: T.bool,
  // subredditIsNSFW: T.bool,
  // showOver18Interstitial: T.bool,
  // single: T.bool,
  // z: T.number,
};

RelevantContent.defaultProps = {
  winWidth: 360,
};

function renderPostList(props) {
  const { winWidth, posts, feature } = props;

  // let makeOnClick;
  // if (feature.enabled(VARIANT_RELEVANCY_TOP)) {
  //   makeOnClick = (url, name, i) => (
  //     e => this.goToRelevancyPost(e, { url, id: name, linkIndex: i + 1 })
  //   );
  // } else if (feature.enabled(VARIANT_NEXTCONTENT_TOP3)) {
  //   makeOnClick = (url, name, i) => (
  //     e => this.goToNextContentPost(e, { url, id: name, linkIndex: i + 1 })
  //   );
  // }

  const hasThumbs = some(posts, post => !!post.thumbnail && post.thumbnail !== '');

  return posts.map((post, i) => {
    const linkExternally = post.disable_comments;
    const externalDomain = isPostDomainExternal(post);
    // XXX const url = cleanPostHREF(mobilify(linkExternally ? post.url : post.cleanPermalink));
    const url = post.url;
    const { id, title, name } = post;
    // Make sure we always have an image to show
    // Link to the comment thread instead of external content
    const postWithFallback = {
      preview: {},
      ...post,
      thumbnail: post.thumbnail || 'img/placeholder-thumbnail.svg',
      cleanUrl: '#',
    };
    // XXX const onClick = makeOnClick(url, name, i);
    const noop = (e => e.preventDefault());
    const onClick = noop;
    return (
      <article ref='rootNode' className={ `Post ${hasThumbs ? '' : 'no-thumbs'}` } key={ id }>
        <div className='Post__header-wrapper' onClick={ onClick }>
          <PostContent
            post={ postWithFallback }
            single={ false }
            compact={ true }
            expandedCompact={ false }
            onTapExpand={ function () {} }
            width={ winWidth }
            toggleShowNSFW={ false }
            showNSFW={ false }
            editing={ false }
            forceHTTPS={ true }
            isDomainExternal={ externalDomain }
            renderMediaFullbleed={ true }
            showLinksInNewTab={ false }
          />
          <header className='PostHeader size-compact m-thumbnail-margin'>
            <div className='PostHeader__post-descriptor-line-overflow'>
            <a
              className={ `PostHeader__post-title-line-blue ${post.visited ? 'm-visited' : ''}` }
              href='#'
              onClick={ noop }
              target={ linkExternally ? '_blank' : null }
            >
              { title }
            </a></div>
            <a
              className='PostHeader__post-title-line'
              href='#'
              onClick={ noop }
              target={ linkExternally ? '_blank' : null }
            >
              { post.ups } upvotes in r/{ post.subreddit }
            </a>
          </header>
        </div>
      </article>
    );
  });
}

function RelevantContent(props) {
  const {
    feature,
    subredditName,
    subreddit,
    listingId,
    winWidth,
    topLinks,
  } = props;

  let visited = [];
  if (localStorageAvailable()) {
    const visitedString = localStorage.getItem(VISITED_POSTS_KEY);
    if (visitedString) {
      visited = visitedString.split(',');
    }
  }

  const safeAndNew = (link =>
    !link.over_18 &&
    link.id !== listingId &&
    !link.stickied &&
    (visited.indexOf(link.id) === -1));

  const safe = (link =>
      !link.over_18 &&
      link.id !== listingId &&
      !link.stickied);

  if (feature.enabled(VARIANT_RELEVANCY_TOP) ||
      feature.enabled(VARIANT_NEXTCONTENT_TOP3)) {
    // Show top posts from this subreddit
    const predicate = feature.enabled(VARIANT_NEXTCONTENT_TOP3) ? safeAndNew : safe;
    const links = take(filter(topLinks, predicate), NUM_TOP_LINKS);

    if (links.length === 0) { return; }

    const postList = renderPostList({
      winWidth,
      feature,
      posts: links,
    });

    const onActionClick = function () {};
    // const onActionClick = (e => this.goToSubreddit(e, {
    //   url: subreddit.url,
    //   id: subreddit.id,
    //   name: subreddit.title,
    //   linkName: 'top 25 posts',
    //   linkIndex: NUM_TOP_LINKS + 1,
    // }));

    return (
      <div className='RelevantContent container' key='relevant-container'>
        <div className='RelevantContent-header'>
          <span className='RelevantContent-row-spacer'>
            <span className='RelevantContent-icon icon-bar-chart orangered-circled'></span>
          </span>
          <span className='RelevantContent-row-text'>Top Posts in r/{ subredditName }</span>
        </div>
        { postList }
        <a
          className='RelevantContent-action'
          href='#'
          onClick={ onActionClick }
        >
            See top 25 Posts
        </a>
      </div>
    );
  }
}

const postIdSelector = (_, props) => props.listingId;

const postModelSelector = (state, props) => state.posts[props.postId];

const topPostIdsSelector = (_, props) => props.posts;

const topPostsSelector = (state, props) => props.posts.map(({ uuid }) => state.posts[uuid]);

const combineSelectors = (listingId, post, topLinkIds, topLinks, feature) => ({
  listingId, topLinkIds, topLinks, feature,
});

const makeSelector = () => {
  return createSelector(
    [
      postIdSelector,
      postModelSelector,
      topPostIdsSelector,
      topPostsSelector,
      featuresSelector,
    ],
    combineSelectors);
};

export default connect(makeSelector)(RelevantContent);
