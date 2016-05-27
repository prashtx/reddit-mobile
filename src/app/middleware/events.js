import * as platform from '@r/platform/actions';
import * as search from 'app/actions/search';
import * as login from 'app/actions/login';
import * as comment from 'app/actions/comment';

import * as pageviewEvent from 'app/actions/events/pageview';
import * as searchEvent from 'app/actions/events/search';
import * as loginEvent from 'app/actions/events/login';
//import * as registerEvent from 'app/actions/events/register';
import * as commentEvent from 'app/actions/events/comment';
//import * as submitEvent from 'app/actions/events/submit';

const actionEventMap = {
  [platform.SET_PAGE]: pageviewEvent.pageview,
  [search.FETCHING_SEARCH_REQUEST]: searchEvent.search,
  [login.LOGGED_IN]: loginEvent.login,
  //[register.REGISTERED]: registerEvent.register,
  [comment.REPLIED]: commentEvent.reply,
  [search.OPEN_SEARCH]: searchEvent.opened,
  [search.SEARCHED]: searchEvent.executed,
  [search.CLOSE_SEARCH]: searchEvent.cancelled,
  [search.CLEAR_SEARCH]: searchEvent.formCleared,
  // submit post
};

export default store => next => action => {
  const trackingAction = actionEventMap[action.type];

  if (trackingAction) {
    store.dispatch(trackingAction(action));
  }

  return next(action);
};
