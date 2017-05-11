import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { UserProfileHeader } from 'app/components/UserProfileHeader';
import PostAndCommentList from 'app/components/PostAndCommentList';
import SortAndTimeSelector from 'app/components/SortAndTimeSelector';
import Loading from 'app/components/Loading';
import NSFWInterstitial from 'app/components/NSFWInterstitial';

import { Section } from '../UserProfile';

import { userAccountSelector } from 'app/selectors/userAccount';
import UserActivityHandler from 'app/router/handlers/UserActivity';
import { paramsToActiviesRequestId } from 'app/models/ActivitiesRequest';

const mapStateToProps = createSelector(
  userAccountSelector,
  (state, props) => state.accounts[props.urlParams.userName.toLowerCase()],
  (state, props) => state.accountRequests[props.urlParams.userName],
  state => state.activitiesRequests,
  state => state.subreddits,
  state => state.preferences,
  (_, props) => props, // props is the page props splatted,
  (myUser, queriedUser, queriedUserRequest, activities, subreddits, preferences, pageProps) => {
    const activitiesParams = UserActivityHandler.pageParamsToActivitiesParams(pageProps);
    const activitiesId = paramsToActiviesRequestId(activitiesParams);
    const isVerified = queriedUser && queriedUser.verified;

    return {
      myUser,
      queriedUser: queriedUser || {},
      queriedUserRequest,
      activitiesId,
      currentActivity: activitiesParams.activity,
      isVerified,
      queriedUserSubreddit: queriedUser ? subreddits[queriedUser.subredditName] : null,
      preferences,
    };
  },
);

export const UserActivityPage = connect(mapStateToProps)(props => {
  const {
    myUser,
    queriedUser,
    queriedUserRequest,
    activitiesId,
    currentActivity,
    isVerified,
    preferences,
    queriedUserSubreddit: userSubreddit,
  } = props;
  const { name: userName, karma, subredditName } = queriedUser;
  const isMyUser = !!myUser && myUser.name === userName;
  const loaded = !!queriedUserRequest && !queriedUserRequest.loading;

  // If this profile is over18, then we need to show the NSFWInterstitial
  // before the user sees the actual content.
  // So if we haven't confirmed the users is over 18, wait until
  // the profile's subreddit info has loaded to check if we need to show the NSFWInterstitial.
  if (!preferences.over18) {
    if (!userSubreddit) {
      // Show loading until we know the profile is over 18 or not
      return (
        <div className='UserProfilePage'>
          <Loading />
        </div>
      );
    }

    if (userSubreddit.over18) {
      return (
        <div className='UserProfilePage'>
          <NSFWInterstitial />
        </div>
      );
    }
  }

  return (
    <div className='UserProfilePage'>
      <Section>
        { loaded && 
          <UserProfileHeader
            userName={ userName }
            userSubreddit={ subredditName }
            karma={ karma }
            isMyUser={ isMyUser }
            currentActivity={ currentActivity }
            isVerified={ isVerified }
          />
        }
      </Section>
      { loaded && <SortAndTimeSelector className='UserProfilePage__sorts' /> }
      <PostAndCommentList
        requestLocation='activitiesRequests'
        requestId={ activitiesId }
        thingProps={ {userActivityPage: true} }
      />
    </div>
  );
});
