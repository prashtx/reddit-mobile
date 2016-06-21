import React from 'react';

import { UrlSwitch, Page } from '@r/platform/url';

import { CommentsPage } from './Comments';
import { PostsFromSubredditPage } from './PostsFromSubreddit';
import { SavedAndHiddenPage } from './SavedAndHidden';
import { SearchPage } from './SearchPage';
import { SubredditAboutPage } from './SubredditAbout';
import { UserActivityPage } from './UserActivity';
import { UserProfilePage } from './UserProfile';

import Login from 'app/components/Login';

export const AppMainPage = () => (
  <UrlSwitch>
    <Page
      url='/'
      component={ PostsFromSubredditPage }
    />
    <Page
      url='/r/:subredditName'
      component={ PostsFromSubredditPage }
    />
    <Page
      url='/r/:subredditName/comments/:postId/comment/:commentId'
      component={ CommentsPage }
    />
    <Page
      url='/r/:subredditName/comments/:postId/:postTitle/:commentId'
      component={ CommentsPage }
    />
    <Page
      url='/r/:subredditName/comments/:postId/:postTitle?'
      component={ CommentsPage }
    />
    <Page url='/search' component={ SearchPage } />
    <Page url='/r/:subredditName/search' component={ SearchPage } />
    <Page url='/r/:subredditName/about' component={ SubredditAboutPage } />
    <Page
      url='/comments/:postId/:postTitle?'
      component={ CommentsPage }
    />
    <Page url='/u/:userName/activity' component={ UserActivityPage } />
    <Page url='/u/:userName/gild' component={ UserProfilePage } />
    <Page url='/u/:userName/:savedOrHidden(saved|hidden)' component={ SavedAndHiddenPage } />
    <Page url='/u/:userName/' component={ UserProfilePage } />
    <Page
      url='/login'
      component={ Login }
    />
  </UrlSwitch>
);
