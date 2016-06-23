import './styles.less';

import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { Anchor, BackAnchor } from '@r/platform/components';

import {
  OVERLAY_MENU_PARAMETER,
  urlWithCommunityMenuToggled,
  urlWithSearchBarToggled,
  urlWithSettingsMenuToggled,
  COMMUNITY_MENU,
  SETTINGS_MENU,
} from 'app/actions/overlayMenu';

import * as searchActions from 'app/actions/search';

import Logo from 'app/components/Logo';
import SnooIcon from 'app/components/SnooIcon';

export const TopNav = (props) => {
  let { assetPath } = props;
  assetPath = assetPath ? assetPath : '';
  const { overlayMenu, subredditName, url, queryParams } = props;

  let currentSubredditPath = '';
  if (subredditName) {
    currentSubredditPath = `/r/${subredditName}`;
  }

  let notificationsCount;
  if (props.user && props.user.inbox_count) {
    notificationsCount = (
      <span className='badge badge-xs badge-orangered badge-right'>
        { props.user.inbox_count }
      </span>
    );
  }

  const settingsOpen = overlayMenu === SETTINGS_MENU;
  const communityMenuOpen = overlayMenu === COMMUNITY_MENU;

  let sideNavIcon = 'icon icon-menu icon-large';
  if (settingsOpen) {
    sideNavIcon += ' blue';
  }

  let communityMenuIcon = 'icon icon-nav-arrowdown';
  if (communityMenuOpen) {
    communityMenuIcon += 'icon icon-nav-arrowup blue';
  }

  return (
    <nav className={ `TopNav${settingsOpen ? ' opened' : ''}` }>
      <div className='pull-left TopNav-padding TopNav-left' key='topnav-menu'>
        <Anchor
          className='MobileButton TopNav-padding TopNav-snoo'
          href='/'
          data-no-route={ true }
        >
          <SnooIcon />
        </Anchor>
        <h1 className='TopNav-text TopNav-padding'>
          <BackAnchor
            className='TopNav-text-community-menu-button TopNav-text-vcentering'
            href={ urlWithCommunityMenuToggled(url, queryParams) }
          >
            <div className='TopNav-text-vcentering'>
              <Logo assetPath={ assetPath } />
            </div>
            <div className='MobileButton community-button'>
              <span className={ communityMenuIcon } />
            </div>
          </BackAnchor>
        </h1>
      </div>
      <div className='TopNav-padding TopNav-right' key='topnav-actions'>
        <Anchor
          className='MobileButton TopNav-floaty'
          href={ `${currentSubredditPath}/submit` }
        >
          <span className='icon icon-post_edit icon-large' />
        </Anchor>
        <BackAnchor
          className='MobileButton TopNav-floaty'
          href={ urlWithSearchBarToggled(url, queryParams) }
          onClick={ props.openSearch }
        >
          <span className='icon icon-search icon-large' />
        </BackAnchor>
        <BackAnchor
          className='MobileButton TopNav-floaty'
          href={ urlWithSettingsMenuToggled(url, queryParams) }
        >
          <span className={ sideNavIcon }></span>
          { notificationsCount }
        </BackAnchor>
      </div>
    </nav>
  );
};

const pageParamsSelector = (state) => state.platform.currentPage;
const combineSelectors = (pageParams) => {
  const { url, urlParams, queryParams } = pageParams;
  const overlayMenu = queryParams[OVERLAY_MENU_PARAMETER];
  const { subredditName } = urlParams;

  return { overlayMenu, subredditName, url, queryParams };
};

const mapStateToProps = createSelector(
  pageParamsSelector,
  combineSelectors,
);

const mapDispatchToProps = (dispatch) => ({
  openSearch: () => dispatch(searchActions.openSearch()),
});

export default connect(mapStateToProps, mapDispatchToProps)(TopNav);
