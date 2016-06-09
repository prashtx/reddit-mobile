import Flags from '@r/flags';

import getSubreddit from 'lib/getSubredditFromState';

import { flags as flagConstants } from './constants';

const {
  BETA,
  SMARTBANNER,
} = flagConstants;

const config = {
  [BETA]: true,
  [SMARTBANNER]: true,
};

const flags = new Flags(config);

function extractUser(ctx) {
  const { state } = ctx;
  if (!state || !state.user || !state.accounts) {
    return;
  }
  return state.accounts[state.user.name];
}

flags.addRule('loggedin', function(val) {
  return (!!this.state.user && !this.state.user.loggedOut) === val;
});

flags.addRule('users', function(users) {
  const user = extractUser(this);
  return users.includes(user.name);
});

flags.addRule('employee', function(val) {
  return extractUser(this).is_employee === val;
});

flags.addRule('admin', function(val) {
  return extractUser(this).is_admin === val;
});

flags.addRule('beta', function(val) {
  return extractUser(this).is_beta === val;
});

flags.addRule('url', function(query) {
  // turns { feature_thing: true, wat: 7 } into { thing: true }
  const parsedQuery = Flags.parseConfig(this.state.platform.currentPage.queryParams);
  return Object.keys(parsedQuery).includes(query);
});

flags.addRule('and', (function (flags) {
  return function (config) {
    return Object.keys(config).every(rule => {
      if (!flags.rules[rule]) {
        return false;
      }
      return flags.rules[rule].call(this, config[rule]);
    });
  };
})(flags));

// OR is the default behavior, but we can't have multiple AND rules (or
// multiples of any rule type, or nested ORs with an AND) without an explicit
// OR
flags.addRule('or', (function (flags) {
  return function (config) {
    return config.some(subConfig =>
      Object.keys(subConfig).some(rule =>
        !flags.rules[rule] ? false : flags.rules[rule].call(this, subConfig[rule])
      )
    );
  };
})(flags));

flags.addRule('subreddit', function (name) {
  const subreddit = getSubreddit(this.state);
  if (!subreddit) {
    return false;
  }

  return subreddit.toLowerCase() === name.toLowerCase();
});

flags.addRule('variant', function (name) {
  const [experiment_name, checkedVariant] = name.split(':');
  const user = extractUser(this);
  if (user && user.features && user.features[experiment_name]) {
    const { variant } = user.features[experiment_name];
    return variant === checkedVariant;
  }
  return false;
});

export default flags;
