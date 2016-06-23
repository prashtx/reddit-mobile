import 'babel-polyfill';
import React from 'react';
import Client from '@r/platform/Client';
import * as actions from '@r/platform/actions';
import isEmpty from 'lodash/isEmpty';

import { isLocalStorageAvailable } from '@r/redux-state-archiver';

import routes from 'app/router';
import App from 'app';
import reducers from 'app/reducers';
import Session from 'app/models/Session';

import middleware from 'app/middleware';

const client = Client({
  routes,
  reducers,
  modifyData: data => {
    if (!isEmpty(data.session)) {
      data.session = new Session(data.session);
      window.session = data.session;
    }

    data.collapsedComments = {};

    if (isLocalStorageAvailable()) {
      try {
        data.collapsedComments = JSON.parse(window.localStorage.collapsedComments);
      } catch (e) { console.warn(e); }

      try {
        data.expandedPosts = JSON.parse(window.localStorage.expandedPosts);
      } catch (e) { console.warn(e); }
    }

    return data;
  },
  appComponent: <App/>,
  debug: true,
  reduxMiddleware: middleware,
})();

client.dispatch(actions.activateClient());
