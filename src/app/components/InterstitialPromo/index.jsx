/* eslint-disable react/jsx-curly-spacing */

import './styles.less';

import React from 'react';
import { Motion, spring } from 'react-motion';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import * as smartBannerActions from 'app/actions/smartBanner';
import SnooIcon from '../SnooIcon';

const T = React.PropTypes;

// String constants
const TITLE = 'Reddit';
const SUBTITLE = 'Get the official mobile app';
const CTA = 'GET THE APP';

// Display helpers
const NOOP = () => {};

class InterstitialPromo extends React.Component {
  state = { isShowing: true };

  onClick = () => {
    this.setState({ isShowing: false });
  };

  render() {
    const { url, onClose } = this.props;
    const { isShowing } = this.state;

    return (
      <div className='InterstitialPromo'>
        <div className='InterstitialPromo__left'>
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
        </div>
        <div className='InterstitialPromo__right'>
          <a className='InterstitialPromo__button' href={ url }>{ CTA }</a>
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
