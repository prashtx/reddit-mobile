import React from 'react';

import PostAndCommentList from 'app/components/PostAndCommentList';

import { paramsToSavedRequestId } from 'app/models/SavedRequest';
import { paramsToHiddenRequestid } from 'app/models/HiddenRequest';
import SavedAndHiddenHandler from 'app/router/handlers/SavedAndHidden';

export const SavedAndHiddenPage = props => {
  const requestProps = SavedAndHiddenHandler.PageParamsToSavedParams(props);
  const isSavedPage = SavedAndHiddenHandler.isSavedPage(props);
  const requestLocation = isSavedPage ? 'savedRequests' : 'hiddenRequests';
  const requestId = isSavedPage ?
    paramsToSavedRequestId(requestProps) : paramsToHiddenRequestid(requestProps);

  return (
    <div className='BelowTopNav'>
      <PostAndCommentList
        requestLocation={ requestLocation }
        requestId={ requestId }
      />
    </div>
  );
};
