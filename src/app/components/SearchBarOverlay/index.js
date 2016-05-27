import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { BackAnchor } from '@r/platform/components';

import * as searchActions from 'app/actions/search';
import OverlayMenu from 'app/components/OverlayMenu';
import SearchBar from './SearchBar';

import {
  urlWithSearchBarToggled,
} from 'app/actions/overlayMenu';

const T = React.PropTypes;

export const SearchBarOverlay = (props) => {
  const { pageData } = props;
  const { url, queryParams, urlParams } = pageData;
  const { subredditName } = urlParams;
  const { q: initialQuery } = queryParams;

  return (
    <OverlayMenu fullscreen={ true }
      onClose={ props.closeSearch }
    >
      <div className='SearchBarOverlay__searchArea'>
        <BackAnchor
          className='SearchBarOverlay__close'
          href={ urlWithSearchBarToggled(url, queryParams) }
          onClick={ props.closeSearch }
        >
          <span className='icon icon-nav-arrowback' />
        </BackAnchor>
        <div className='SearchBarOverlay__barContainer'>
          <SearchBar
            onClear={ props.clearSearch }
            subreddit={ subredditName }
            initialValue={ initialQuery ? decodeURIComponent(initialQuery) : '' }
          />
        </div>
      </div>
    </OverlayMenu>
  );
};

SearchBarOverlay.propTypes = {
  closeSearch: T.func,
  clearSearch: T.func,
  pageData: T.shape({
    url: T.string,
    queryParams: T.shape({
      q: T.string,
    }),
    urlParams: T.shape({
      subredditName: T.string,
    }),
  }),
};

const mapDispatchProps = (dispatch) => ({
  closeSearch: () => dispatch(searchActions.closeSearch()),
  clearSearch: () => dispatch(searchActions.clearSearch()),
});

export default connect(
  createSelector(
    state => state.platform.currentPage,
    (pageData) => ({ pageData }),
  ),
  mapDispatchProps
)(SearchBarOverlay);
