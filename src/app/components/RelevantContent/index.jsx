import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { models } from '@r/api-client';

import filter from 'lodash/fp/filter';
import first from 'lodash/fp/first';
import flow from 'lodash/fp/flow';

import localStorageAvailable from 'lib/localStorageAvailable';
import mobilify from 'lib/mobilify';

import { featuresSelector } from 'app/selectors/features';
import { flags, VISITED_POSTS_KEY } from 'app/constants';

import PostContent from 'app/components/Post/PostContent';

import {
  isPostDomainExternal,
  cleanPostHREF,
} from 'app/components/Post/postUtils';

const { PostModel } = models;

const {
  VARIANT_NEXTCONTENT_BOTTOM,
} = flags;


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

function NextPost(props) {
  const { topLinks, width, listingId } = props;

  // XXX move into a helper
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

  const post = flow(
    filter(safeAndNew),
    first
  )(topLinks);

  if (!post) {
    return null;
  }

  const linkExternally = post.disable_comments;
  const url = cleanPostHREF(mobilify(linkExternally ? post.url : post.cleanPermalink));
  const { id, title, name } = post;
  // Make sure we always have an image to show
  // Link to the comment thread instead of external content
  const postWithFallback = {
    preview: {},
    ...post,
    thumbnail: post.thumbnail || 'img/placeholder-thumbnail.svg',
    cleanUrl: '#',
  };
  // const onClick = (e => this.goToNextContentPost(e, { url, id: name, linkIndex: 0 }));
  // XXX
  const onClick = (e => {
    e.preventDefault();
    console.log(name, url);
  });
  const noop = (e => e.preventDefault());

  const variant = 'bottom';
  const descriptor = (
    <a
      className='PostHeader__post-descriptor-line'
      href='#'
      onClick={ noop }
      target={ linkExternally ? '_blank' : null }
    >
      { post.ups } upvotes in r/{ post.subreddit }
    </a>
  );
  const actionText = 'NEXT';

  const externalDomain = isPostDomainExternal(postWithFallback);

  return (
    <div
      className={ `NextContent container ${variant}` }
      key='nextcontent-container'
      onClick={ onClick }
    >
      <article ref='rootNode' className='Post' key={ id }>
        <div className='NextContent__post-wrapper'>
          <PostContent
            post={ postWithFallback }
            single={ false }
            compact={ true }
            expandedCompact={ false }
            onTapExpand={ function () {} }
            width={ width }
            toggleShowNSFW={ false }
            showNSFW={ false }
            editing={ false }
            toggleEditing={ false }
            saveUpdatedText={ false }
            forceHTTPS={ true }
            isDomainExternal={ externalDomain }
            renderMediaFullbleed={ true }
            showLinksInNewTab={ false }
          />
          <header className='NextContent__header'>
            <div className='NextContent__post-descriptor-line'>
            <a
              className='NextContent__post-title-line'
              href='#'
              onClick={ noop }
              target={ linkExternally ? '_blank' : null }
            >
              { title }
            </a></div>
            { descriptor }
          </header>
        </div>
        <div className='NextContent__next-link'>
          <a
            href='#'
            onClick={ noop }
          >
            { actionText }
            <span className='icon-nav-arrowforward icon'></span>
          </a>
        </div>
      </article>
    </div>
  );
}

function RelevantContent(props) {
  const {
    feature,
    listingId,
    winWidth,
    topLinks,
  } = props;

  if (feature.enabled(VARIANT_NEXTCONTENT_BOTTOM)) {
    if (topLinks.length === 0) {
      return null;
    }

    return (
      <NextPost
        topLinks={ topLinks }
        width={ winWidth }
        listingId={ listingId }
      />
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
