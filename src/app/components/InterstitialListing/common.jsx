/* eslint-disable react/jsx-curly-spacing */

import React from 'react';
import { createSelector } from 'reselect';

import { flags } from 'app/constants';
import { getDevice } from 'lib/getDeviceFromState';
import getSubreddit from 'lib/getSubredditFromState';
import { getBranchLink } from 'lib/smartBannerState';

import PostsFromSubreddit from 'app/router/handlers/PostsFromSubreddit';
import { paramsToPostsListsId } from 'app/models/PostsList';
import { featuresSelector} from 'app/selectors/features';
import SnooIcon from '../SnooIcon';
import Logo from '../Logo';

const T = React.PropTypes;

const {
  VARIANT_XPROMO_SUBREDDIT,
} = flags;


function List() {
  return (
    <div className='InterstitialListing__bulletlist'>
      <ul>
        <li><span>50% Faster</span></li>
        <li><span>Infinite Scroll</span></li>
        <li><span>Autoplay GIFs</span></li>
      </ul>
    </div>
  );
}

export function InterstitialListingCommon(props) {
  /* NOTE: We default to the VARIANT_XPROMO_CLICK case because
   * it breaks otherwise when we navigate off a listing page.
   */
  const { urls, onClose, features, subreddit, thumbnails, navigator } = props;

  const titleText = features.enabled(VARIANT_XPROMO_SUBREDDIT)
    ? ''
    : 'View this post in the official Reddit app';

  const subtitleText = features.enabled(VARIANT_XPROMO_SUBREDDIT)
    ? `r/${ subreddit } is better with the app. We hate to intrude, ` +
      'but you deserve the best.'
    : '';

  const buttonText = 'Continue';

  return (
    <div className='InterstitialListing__common'>
      <div
        className='InterstitialListing__close icon icon-x'
        onClick={ onClose }
      />
      <div className='InterstitialListing__icon'>
        <SnooIcon />
        <div className='InterstitialListing__wordmark'>
          <Logo />
        </div>
      </div>
      <div className='InterstitialListing__bottom'>
        <div className='InterstitialListing__header'>
          { thumbnails ? thumbnails.map(tn =>
              <img className='InterstitialListing__thumbnail' src={ tn } />
            ) : null }
          <div className='InterstitialListing__title'>
            { titleText }
          </div>
          <div className='InterstitialListing__subtitle'>
            { subtitleText }
          </div>
          <List />
        </div>
        <div
          className='InterstitialListing__button'
          onClick={ navigator(urls[0]) }
        >
          { buttonText }
          <span className="icon icon-play"></span>
        </div>
        <div className='InterstitialListing__dismissal'>
          or go to the <a onClick={ onClose }>mobile site</a>
        </div>
      </div>
    </div>
  );
}

InterstitialListingCommon.propTypes = {
  urls: T.array.isRequired,
  onClose: T.func,
};

function getUrls(state) {
  return [
    getBranchLink(state, {
      feature: 'interstitial',
      campaign: 'xpromo_interstitial_listing',
      utm_medium: 'interstitial',
      utm_name: 'xpromo_interstitial_listing',
      utm_content: 'element_1',
    }),
    getBranchLink(state, {
      feature: 'interstitial',
      campaign: 'xpromo_interstitial_listing',
      utm_medium: 'interstitial',
      utm_name: 'xpromo_interstitial_listing',
      utm_content: 'element_2',
    }),
  ];
}

export const selector = createSelector(
  getUrls,
  featuresSelector,
  getDevice,
  getSubreddit,
  state => state.subreddits,
  state => state.postsLists,
  state => state.posts,
  state => state.modal,
  state => state.platform.currentPage,
  (
    urls,
    features,
    device,
    subredditName,
    subreddits,
    postsLists,
    posts,
    modal,
    currentPage,
  ) => {
    let subreddit = subredditName;
    let thumbnails;
    let over18 = false;

    // Show the subreddit's displayName if possible
    const subredditInfo = subreddits[subredditName.toLowerCase()];
    if (subredditInfo) {
      subreddit = subredditInfo.displayName;
      over18 = subredditInfo.over18;
    }

    // For subreddit listings, we use the listing data we're already
    // grabbing and return 9 thumbails if there are at least that many.
    let hash = null;
    if (modal.type) {
      hash = modal.props ? modal.props.hash : null;
    } else {
      const { urlParams, queryParams } = currentPage;
      const getPageParams = PostsFromSubreddit.pageParamsToSubredditPostsParams;
      const pageParams = getPageParams({ urlParams, queryParams });
      hash = paramsToPostsListsId(pageParams);
    }
    const postsList = hash && postsLists[hash];
    if (postsList && !postsList.loading) {
      const uuids = postsList.results.map(item => item.uuid);
      const allThumbs = uuids
        .filter(item => over18 || !posts[item].over18)
        .filter(item => !posts[item].stickied)
        .map(item => posts[item].thumbnail)
        .filter(item => !!item && item.startsWith('http'));
      if (allThumbs.length >= 9) {
        thumbnails = allThumbs.slice(0, 9);
      } else {
        thumbnails = null;
      }
    }

    return {
      urls,
      features,
      device,
      subreddit,
      thumbnails,
    };
  },
);
