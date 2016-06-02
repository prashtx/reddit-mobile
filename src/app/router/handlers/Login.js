import { BaseHandler, METHODS } from '@r/platform/router';
import * as platformActions from '@r/platform/actions';

import Session from 'app/models/Session';
import * as sessionActions from 'app/actions/session';
import * as loginActions from 'app/actions/login';

export const NAME = 'Login';

export default class Login extends BaseHandler {
  name = NAME;

  async [METHODS.GET](/*dispatch, getState, utils*/) {
    return;
  }

  async [METHODS.POST](dispatch/*, getState, utils*/) {
    const { username, password } = this.bodyParams;

    try {
      const newSession = await Session.fromLogin(username, password);
      dispatch(sessionActions.setSession(newSession));
      dispatch(loginActions.loggedIn());
      dispatch(platformActions.navigateToUrl(METHODS.GET, '/'));
    } catch (e) {
      return; // do nothing until session is better
    }
  }
}
