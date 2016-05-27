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
    comment_body: comment.body,
    parent_id: convertId(parent.name),
    parent_fullname: parent.name,
    parent_created_ts: parent.createdUTC,
  };

  return payload;
}

export const EVENT__COMMENT_REPLY = 'EVENT__COMMENT_REPLY';
export const reply = ({ comment }) => async (dispatch, getState, { waitForState }) => {
  let state = getState();

  return await waitForState(state => state.user.name && state.accounts[state.user.name], () => {
    state = getState();
    console.log('COMMENT REPLY', buildCommentData(state, comment));
  });
};
