/* eslint-disable react/jsx-curly-spacing */

import './styles.less';

import React from 'react';
// XXX import { Motion, spring } from 'react-motion';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import * as smartBannerActions from 'app/actions/smartBanner';
import SnooIcon from '../SnooIcon';
import Logo from '../Logo';

const T = React.PropTypes;

// String constants
const TITLE = 'Just a tap away';
const SUBTITLE = 'Why are you still using the browser? The Reddit app is the easiest way to browser Reddit when you\'re on the go.';
const CTA = 'Tap to get Reddit';

function InterstitialPromo(props) {
  const { url, onClose } = props;
  // XXX const { isShowing } = this.state;

  return (
    <div className='InterstitialPromo'>
      <div
        className='InterstitialPromo__close icon icon-x'
        onClick={ onClose }
      />
      <div className='InterstitialPromo__icon'>
        <SnooIcon />
      </div>
      <div className='InterstitialPromo__wordmark'>
        <Logo />
      </div>
      <div className='InterstitialPromo__header'>
        <div className='InterstitialPromo__title'>{ TITLE }</div>
        <div className='InterstitialPromo__subtitle'>{ SUBTITLE }</div>
      </div>
      <a className='InterstitialPromo__button' href={ url }>{ CTA /* XXX right-pointing triangle */ }</a>
      <div className='InterstitialPromo__dismissal'>or go to the <a onClick={ onClose }>mobile site</a></div>
    </div>
  );
}

InterstitialPromo.propTypes = {
  url: T.string.isRequired,
  onClose: T.func,
};

const selector = createSelector(
  state => state.smartBanner.clickUrl,
  url => ({ url })
);

const mapDispatchToProps = dispatch => ({
  onClose: () => dispatch(smartBannerActions.close()),
});

export default connect(selector, mapDispatchToProps)(InterstitialPromo);
