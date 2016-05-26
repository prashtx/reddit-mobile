import { getBasePayload, convertId } from './utils';

export function buildCommentData(state) {
  /*
  const {
    subreddit,
    subreddit_id,
    author,
    name,
    body,
    link_id,
    parent_id,
  } = state;

  const payload = {
    ...getBasePayload(state),
    user_name: author,
    user_id: convertId(state.user.id),
    sr_name: subreddit,
    sr_id: convertId(subreddit_id),
    comment_id: convertId(name),
    comment_fullname: name,
    comment_body: body,
    parent_id: convertId(parent_id),
    parent_fullname: parent_id,
    parent_created_ts: state.parentCreated,
    post_id: convertId(link_id),
    post_fullname: link_id,
    post_created_ts: state.postCreated,
  };

  return payload;
  */
  return {};
}

export const EVENT__COMMENT_REPLY = 'EVENT__COMMENT_REPLY';
export const reply = () => async (dispatch, getState, { waitForState }) => {
  let state = getState();

  return await waitForState(state => state.user.name && state.accounts[state.user.name], () => {
    state = getState();
    console.log('COMMENT REPLY', buildCommentData(state));
  });
};
