/* eslint-disable react/jsx-curly-spacing */

import './styles.less';

import React from 'react';
// XXX import { Motion, spring } from 'react-motion';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import * as smartBannerActions from 'app/actions/smartBanner';
import SnooIcon from '../SnooIcon';

const T = React.PropTypes;

// String constants
const TITLE = 'Just a tap away';
const SUBTITLE = 'Why are you still using the browser? The Reddit app is the easiest way to browser Reddit when you\'re on the go.';
const CTA = 'Tap to get Reddit';

// Display helpers
const NOOP = () => {};

class InterstitialPromo extends React.Component {
  state = { isShowing: true }; // XXX

  // XXX
  onClick = () => {
    this.setState({ isShowing: false });
  };

  render() {
    const { url, onClose } = this.props;
    // XXX const { isShowing } = this.state;

    // XXX add logotype under SnooIcon
    return (
      <div className='InterstitialPromo'>
        <div
          className='InterstitialPromo__close icon icon-x'
          onClick={ onClose }
        />
        <div className='InterstitialPromo__icon'>
          <SnooIcon />
        </div>
        <div className='InterstitialPromo__header'>
          <div className='InterstitialPromo__title'>{ TITLE }</div>
          <div className='InterstitialPromo__subtitle'>{ SUBTITLE }</div>
        </div>
        <a className='InterstitialPromo__button' href={ url }>{ CTA /* XXX right-pointing triangle */ }</a>
        <div className='InterstitialPromo__dismissal'>
          <div className='InterstitialPromo__dismissaltext'>or go to the <a className='InterstitialPromo__altlink' onclick={ onClose }>mobile site</a></div>
        </div>
      </div>
    );
  }
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
