import './styles.less';

import React from 'react';

import { map } from 'lodash/collection';

import Comment from 'app/components/Comment';

function limitTrees(limit, trees) {
  if (limit === 0 || !trees || trees.length === 0) {
    return [0, []];
  }
  const first = trees[0];
  const rest = trees.slice(1);
  const [count, pruned] = limitTree(limit, first);
  if (limit > count) {
    const [restCount, restPruned] = limitTrees(limit - count, rest);
    return [count + restCount, [pruned].concat(restPruned)];
  }
  return [count, [pruned]];
}

function limitTree(limit, tree) {
  if (limit === 0) {
    return [0, null];
  } else if (limit === 1) {
    return [1, { ...tree, replies: [] }];
  }
  const [count, children] = limitTrees(limit - 1, tree.replies);
  return [count + 1, { ...tree, replies: children }];
}
export default (props) => {
  const { commentRecords, parentComment, postCreated, user, op, nestingLevel, limit } = props;

  let trees;
  if (limit === undefined || limit === null) {
    trees = map(commentRecords, record => (
        <Comment
          key={ `comment-id-${record.uuid}` }
          commentId={ record.uuid }
          parentComment= { parentComment }
          postCreated={ postCreated }
          user={ user }
          op={ op }
          nestingLevel={ nestingLevel }
        />
    ));
  } else {
    // Limit the total number of comments displayed.
    if (limit === 0 || commentRecords.length === 0) {
      // XXX
    }
  }

  return (
    <div className={ `CommentsList ${props.className || ''}` }>

      { trees }
    </div>
  );
};
