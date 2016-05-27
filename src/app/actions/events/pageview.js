import url from 'url';
import { NIGHTMODE } from 'app/actions/theme';
import { convertId } from './utils';

export function buildPageviewData (state) {
  const data = {
    language: 'en', // NOTE: update when there are translations
  };

  const {
    session,
    platform,
    accounts,
    user,
    loid,
  } = state;

  const { currentPage } = platform;
  const account = accounts[user.name];

  if (currentPage.referrer) {
    data.referrer_url = currentPage.referrer;
    data.referrer_domain = url.parse(currentPage.referrer).host;
  }

  // todo implement DNT
  //data.dnt = !!window.DO_NOT_TRACK;

  console.log(session, account);
  // If there is a logged-in user, add the user's data to the payload
  if (session.isValid && account) {
    data.user_name = user.name;
    data.user_id = convertId(account.id);
  } else {
    // Otherwise, send in logged-out ID
    data.loid = loid.loid;
    data.loid_created = loid.loidcreated;
  }

  data.compact_view = state.compact;

  if (state.theme === NIGHTMODE) {
    data.nightmode = true;
  }

  /* figure out what we're looking at
  const LINK_LIMIT = 25;
  // If we're looking at a subreddit, include the info in the payload
  if (props.data.subreddit) {
    data.sr_id = convertId(props.data.subreddit.name);
    data.sr_name = props.data.subreddit.id;
  }

  // If we're looking at a list of links or comments, include the sort order
  // (or a default). If it's just a list of links, not comments, also include
  // the page size.
  if (props.data.listings || props.data.search || props.data.activities || props.data.comments) {
    if (props.ctx.query.sort === 'top') {
      data.target_filter_time = props.ctx.query.time || 'all';
    }

    if (props.data.comments || props.data.activities) {
      data.target_sort = props.ctx.query.sort || 'confidence';
    } else {
      data.target_sort = props.ctx.query.sort || 'hot';
      data.target_count = LINK_LIMIT;

      const query = props.ctx.query;
      if (query.before) {
        data.target_before = query.before;
      }

      if (query.after) {
        data.target_after = query.after;
      }
    }

    if (props.data.search && props.ctx.query.q) {
      data.query_string = props.ctx.query.q;
      data.query_string_length = props.ctx.query.q.length;
    }

    if (props.data.search) {
      data.sr_listing = props.data.search.subreddits.map(sr => sr.display_name);
      data.target_type = 'search_results';
    }
  }

  // Try looking at the data to determine what the subject of the page is.
  // In order of priority, it could be a user profile, a listing, or a
  // subreddit.
  const target = (
    props.data.userProfile ||
      props.data.listing ||
        props.data.subreddit
  );

  if (target) {
    // Subreddit ids/names are swapped
    if (props.ctx.params.commentId) {
      data.target_id = convertId(props.ctx.params.commentId);
      data.target_fullname = `t1_${props.ctx.params.commentId}`;
      data.target_type = 'comment';
    } else if (target._type === 'Subreddit') {
      data.target_id = convertId(target.name);
      data.target_fullname = `${target.name}`;
      data.target_type = 'listing';
      data.listing_name = target.id;
    } else if (target._type === 'Link') {
      data.target_id = convertId(target.id);
      data.target_fullname = `t3_${target.id}`;
      data.target_type = 'link';
      if (target.selftext) {
        data.target_type = 'self';
      }
    } else if (target._type === 'Account') {
      data.target_id = convertId(target.id);
      data.target_name = target.name;
      data.target_fullname = `t2_${target.id}`;
      data.target_type = 'account';
    }

    if (target._type === 'Link') {
      data.target_url = target.url;
      data.target_url_domain = target.domain;
    }
  } else if (isOtherListing(props)) {
    // Fake subreddit, mark it as a listing
    data.target_type = 'listing';

    // explicitly check that this is the frontpage
    if (props.ctx.path === '/') {
      data.listing_name = 'frontpage';
    } else if (props.ctx.params.subreddit) {
      const subreddit = props.ctx.params.subreddit;
      if (subreddit.indexOf('+') !== -1) {
        data.listing_name = 'multi';
      } else {
        data.listing_name = subreddit;
      }
    } else if (props.ctx.params.multi) {
      data.listing_name = 'multi';
    }
  }
  */

  return data;
}

export const EVENT__PAGEVIEW = 'EVENT__PAGEVIEW';
export const pageview = () => async (dispatch, getState, { waitForState }) => {
  let state = getState();

  if (state.session.isValid) {
    return await waitForState(state => state.user.name && state.accounts[state.user.name], () => {
      state = getState();
      console.log('PAGEVIEW', buildPageviewData(state));
    });
  }

  const data = buildPageviewData(state);
  console.log('PAGEVIEW', data);
};