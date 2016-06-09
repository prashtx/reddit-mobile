export default function getSubreddit(state) {
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
