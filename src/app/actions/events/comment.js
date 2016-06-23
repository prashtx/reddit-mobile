import { getEventTracker } from 'lib/eventTracker';

import {
  getBasePayload,
  convertId,
  getCurrentSubredditFromState,
  getCurrentPostFromState,
  getThingFromStateById,
} from './utils';

export function buildCommentData(state, comment) {
  const post = getCurrentPostFromState(state);
  const subreddit = getCurrentSubredditFromState(state);

  const parent = getThingFromStateById(state, comment.parentId);

  const payload = {
    ...getBasePayload(state),
    sr_name: subreddit.uuid,
    sr_id: convertId(subreddit.name),
    post_id: convertId(post.name),
    post_fullname: post.name,
    post_created_ts: post.createdUTC,
    comment_id: convertId(comment.name),
    comment_fullname: comment.name,
    comment_body: comment.bodyHTML, // XXX use comment.body once snoode includes that field.
    parent_id: convertId(parent.name),
    parent_fullname: parent.name,
    parent_created_ts: parent.createdUTC,
  };

  return payload;
}

export const EVENT__COMMENT_REPLY = 'EVENT__COMMENT_REPLY';
export const reply = ({ model }) => async (dispatch, getState, { waitForState }) => {
  return await waitForState(state => state.user.name && state.accounts[state.user.name], () => {
    const state = getState();
    const data = buildCommentData(state, model);
    console.log('COMMENT REPLY', data);
    getEventTracker(state).track('comment_events', 'cs.comment', data);
  });
};
