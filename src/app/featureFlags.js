import Flags from '@r/flags';

import { flags as flagConstants } from './constants';

const {
  BETA,
  SMARTBANNER,
  VARIANT_RELEVANCY_TOP,
  VARIANT_RELEVANCY_ENGAGING,
  VARIANT_RELEVANCY_RELATED,
  VARIANT_NEXTCONTENT_BOTTOM,
  VARIANT_NEXTCONTENT_MIDDLE,
  VARIANT_NEXTCONTENT_BANNER,
  VARIANT_NEXTCONTENT_TOP3,
} = flagConstants;

const config = {
  'foo': {
    url: 'foo',
    variant: 'relevancy_mweb:foo',
  },
  [BETA]: true,
  [SMARTBANNER]: true,
  [VARIANT_RELEVANCY_TOP]: {
    and: {
      subreddit: 'gaming',
      or: [{
        url: 'experimentrelevancytop',
        variant: 'relevancy_mweb:top',
      }],
    },
  },
  [VARIANT_RELEVANCY_ENGAGING]: {
    and: {
      subreddit: 'gaming',
      or: [{
        url: 'experimentrelevancyengaging',
        variant: 'relevancy_mweb:engaging',
      }],
    },
  },
  [VARIANT_RELEVANCY_RELATED]: {
    and: {
      subreddit: 'gaming',
      or: [{
        url: 'experimentrelevancyrelated',
        variant: 'relevancy_mweb:related',
      }],
    },
  },
  [VARIANT_NEXTCONTENT_BOTTOM]: {
    url: 'experimentnextcontentbottom',
    subreddit: 'aww',
    and: [{
      variant: 'nextcontent_mweb:bottom',
      loggedin: false,
    }],
  },
  [VARIANT_NEXTCONTENT_MIDDLE]: {
    url: 'experimentnextcontentmiddle',
    subreddit: 'pic',
    and: [{
      variant: 'nextcontent_mweb:middle',
      loggedin: false,
    }],
  },
  [VARIANT_NEXTCONTENT_BANNER]: {
    url: 'experimentnextcontentbanner',
    subreddit: 'pics',
    and: [{
      variant: 'nextcontent_mweb:banner',
      loggedin: false,
    }],
  },
  [VARIANT_NEXTCONTENT_TOP3]: {
    or: [
      { url: 'experimentnextcontenttop3' },
      { url: 'top3' },
    ],
    subreddit: 'woodworking',
    and: [{
      variant: 'nextcontent_mweb:top3',
      loggedin: false,
    }],
  },
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

// XXX
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

// XXX
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

// XXX consolidate with actions/commentsPage
function getSubreddit(state) {
  if (state.platform.currentPage.urlParams.subredditName) {
    return state.platform.currentPage.urlParams.subredditName;
  }

  const { commentsPages = {}} = state;
  const { current } = commentsPages;
  if (!current) { return; }
  const results = commentsPages[current].results;
  if (!results || results.length === 0) { return; }
  const comment = state.comments[results[0].uuid];
  if (!comment) { return; }
  return comment.subreddit;
}

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
    // const { variant, experiment_id } = user.features[experiment_name];

    // XXX
    // // Fire bucketing event.
    // // A null variant means the user has been excluded from the experiment, so
    // // there is no bucket
    // let debouncedEvents;
    // if (this.props.app.state) {
    //   debouncedEvents = this.props.app.state.debouncedEvents;
    // }
    // if (!debouncedEvents) {
    //   debouncedEvents = {};
    //   // There is no this.props.app.state on the server, so we will end up
    //   // sending this event multiple times, but that's OK. We use the
    //   // debouncing to avoid generating too much unneeded traffic.
    //   if (this.props.app.state) {
    //     this.props.app.state.debouncedEvents = debouncedEvents;
    //   }
    // }
    // const eventID = `bucket:${experiment_id}:${this.props.loid}`;
    // if (variant && !debouncedEvents[eventID]) {
    //   debouncedEvents[eventID] = true;
    //   this.props.app.emit('bucket', {
    //     experiment_id,
    //     experiment_name,
    //     variant,
    //     loid: this.props.loid,
    //     loidcreated: this.props.loidcreated,
    //   });
    // }
    return variant === checkedVariant;
  }
  return false;
});

export default flags;
