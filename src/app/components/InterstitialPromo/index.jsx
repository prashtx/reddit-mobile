/* eslint-disable react/jsx-curly-spacing */

import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { flags } from 'app/constants';
import { getDevice } from 'lib/getDeviceFromState';
import { getBranchLink } from 'lib/smartBannerState';

import { featuresSelector} from 'app/selectors/features';
import * as smartBannerActions from 'app/actions/smartBanner';
import SnooIcon from '../SnooIcon';
import Logo from '../Logo';

const T = React.PropTypes;

const {
  VARIANT_XPROMO_LIST,
  VARIANT_XPROMO_RATING,
} = flags;

// String constants
const TITLE = 'Just a tap away';
const SUBTITLE = `Why are you still using the browser?
The Reddit app is the easiest way to browser Reddit when you're on the go.`;
const CTA = 'Tap to get Reddit';


function List() {
  return (
    <div className='InterstitialPromo__bulletlist'>
      <ul>
        <li><span>Lightning Fast</span></li>
        <li><span>Autoplay GIFs</span></li>
        <li><span>Infinite Scroll</span></li>
      </ul>
    </div>
  );
}

function Rating(props) {
  const { device, url } = props;

  return (
    <a href={ url }>
      <div className='InterstitialPromo__rating'>
        <div className='InterstitialPromo__rating_icon'>
          <SnooIcon />
        </div>
        <div className='InterstitialPromo__rating_right'>
          <div className='InterstitialPromo__rating_title'>
            Reddit for { device }
          </div>
          <div className='InterstitialPromo__rating_stars'>
            <span className='icon icon-gold'></span>
            <span className='icon icon-gold'></span>
            <span className='icon icon-gold'></span>
            <span className='icon icon-gold'></span>
            <span className='icon icon-gold'></span>
          </div>
          <div className='InterstitialPromo__rating_text'>
            5,000+ 5-star reviews
          </div>
        </div>
      </div>
    </a>
  );
}

function InterstitialPromo(props) {
  const { urls, onClose, features, device } = props;

  return (
    <div className='InterstitialPromo'>
      <div
        className='InterstitialPromo__close icon icon-x'
        onClick={ onClose }
      />
      <div className='InterstitialPromo__icon'>
        <SnooIcon />
        <div className='InterstitialPromo__wordmark'>
          <Logo />
        </div>
      </div>
      <div className='InterstitialPromo__bottom'>
        <div className='InterstitialPromo__header'>
          <div className='InterstitialPromo__title'>{ TITLE }</div>
          <div className='InterstitialPromo__subtitle'>{ SUBTITLE }</div>
          { features.enabled(VARIANT_XPROMO_LIST) ? <List /> : null }
        </div>
        <a
          className='InterstitialPromo__button'
          href={ urls[0] }
        >
          { CTA }
          <span className="icon icon-play"></span>
        </a>
        <div className='InterstitialPromo__dismissal'>
          or go to the <a onClick={ onClose }>mobile site</a>
        </div>
        { features.enabled(VARIANT_XPROMO_RATING) ?
            <Rating device={ device} url={ urls[1] }/> : null }
      </div>
    </div>
  );
}

InterstitialPromo.propTypes = {
  urls: T.array.isRequired,
  onClose: T.func,
};

const selector = createStructuredSelector({
  urls: state => [
    getBranchLink(state, {
      feature: 'interstitial',
      campaign: 'xpromo_interstitial',
      utm_medium: 'interstitial',
      utm_name: 'xpromo_interstitial',
      utm_content: 'element_1',
    }),
    getBranchLink(state, {
      feature: 'interstitial',
      campaign: 'xpromo_interstitial',
      utm_medium: 'interstitial',
      utm_name: 'xpromo_interstitial',
      utm_content: 'element_2',
    }),
  ],
  features: featuresSelector,
  device: getDevice,
});

const mapDispatchToProps = dispatch => ({
  onClose: () => dispatch(smartBannerActions.close()),
});

export default connect(selector, mapDispatchToProps)(InterstitialPromo);
