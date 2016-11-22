/* eslint-disable react/jsx-curly-spacing */

import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { redirect } from '@r/platform/actions';

import { markBannerClosed } from 'lib/smartBannerState';

import { getBranchLink } from 'lib/smartBannerState';
import getSubreddit from 'lib/getSubredditFromState';
import { objectToHash } from 'lib/objectToHash';

import { featuresSelector} from 'app/selectors/features';
import * as modalActions from 'app/actions/modal';
import * as smartBannerActions from 'app/actions/smartBanner';
import SnooIcon from '../SnooIcon';
import Logo from '../Logo';

const T = React.PropTypes;

// String constants
const TITLE = 'Visit this post in the official Reddit app';
const CTA = 'Continue';


function List() {
  return (
    <div className='InterstitialModal__bulletlist'>
      <ul>
        <li><span>50% Faster</span></li>
        <li><span>Infinite Scroll</span></li>
        <li><span>Autoplay GIFs</span></li>
      </ul>
    </div>
  );
}

function InterstitialModal(props) {
  const { urls, onClose, thumbnails, navigator } = props;

  return (
    <div className='InterstitialModal'>
      <div className='InterstitialModal__content'>
        <div
          className='InterstitialModal__close icon icon-x'
          onClick={ onClose }
        />
        <div className='InterstitialModal__icon'>
          <SnooIcon />
          <div className='InterstitialModal__wordmark'>
            <Logo />
          </div>
        </div>
        <div className='InterstitialModal__bottom'>
          <div className='InterstitialModal__header'>
            { thumbnails ? thumbnails.map(tn =>
                <img className='InterstitialPromo__thumbnail' src={ tn } />
              ) : null }
            <div className='InterstitialModal__title'>{ TITLE }</div>
            <div className='InterstitialModal__subtitle'>
            </div>
            <List />
          </div>
          <div
            className='InterstitialModal__button'
            onClick={ navigator(urls[0]) }
          >
            { CTA }
            <span className="icon icon-play"></span>
          </div>
          <div className='InterstitialModal__dismissal'>
            or go to the <a onClick={ onClose }>mobile site</a>
          </div>
        </div>
      </div>
    </div>
  );
}

InterstitialModal.propTypes = {
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

const selector = createSelector(
  getUrls,
  featuresSelector,
  getSubreddit,
  state => state.subreddits,
  state => state.postsLists,
  state => state.posts,
  (urls, features, subredditName, subreddits, postsLists, posts) => {
    let subreddit = subredditName;
    let thumbnails;

    // Show the subreddit's displayName if possible
    const subredditInfo = subreddits[subredditName.toLowerCase()];
    if (subredditInfo) {
      subreddit = subredditInfo.displayName;
    }

    const hash = objectToHash({ subredditName: subredditName.toLowerCase() });
    const postsList = postsLists[hash];
    if (postsList && !postsList.loading) {
      const uuids = postsList.results.map(item => item.uuid);
      const allThumbs = uuids.map(item => posts[item].thumbnail)
                             .filter(item => !!item);
      if (allThumbs.length >= 9) {
        thumbnails = allThumbs.slice(0, 9);
      } else {
        thumbnails = null;
      }
    }

    return {
      urls,
      features,
      subreddit,
      thumbnails,
    };
  },
);

const mapDispatchToProps = dispatch => ({
  onClose: () => {
    dispatch(modalActions.closeModal());
    dispatch(smartBannerActions.close());
  },
  navigator: (url) => (() => {
    markBannerClosed();
    dispatch(redirect(url));
  }),
});

export default connect(selector, mapDispatchToProps)(InterstitialModal);
