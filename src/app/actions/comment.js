import { endpoints } from '@r/api-client';
const { SavedEndpoint } = endpoints;

import { apiOptionsFromState } from 'lib/apiOptionsFromState';

export const TOGGLE_EDIT_FORM = 'TOGGLE_EDIT_FORM';
export const toggleEditForm = id => ({ type: TOGGLE_EDIT_FORM, id });

export const TOGGLE_COLLAPSE = 'TOGGLE_COLLAPSE';

export const toggledCollapse = (id, collapse) => ({ type: TOGGLE_COLLAPSE, id, collapse });
export const toggleCollapse = (id, collapse) => async (dispatch) => {
  dispatch(toggledCollapse(id, collapse));
};

export const RESET_COLLAPSE = 'RESET_COLLAPSE';
export const resetCollapse = collapse => ({ type: RESET_COLLAPSE, collapse });

export const SAVING = 'SAVING_COMMENT';
export const saving = (id, save) => ({
  type: SAVING,
  id,
  save,
});

export const save = (id, save=true) => async (dispatch, getState) => {
  dispatch(saving(id));

  const state = getState();
  const method = save ? 'post' : 'del';
  const apiResponse = await SavedEndpoint[method](apiOptionsFromState(state), { id });
  dispatch(saved(id, apiResponse));
};

export const SAVED = 'SAVED_COMMENT';
export const saved = (id, savedResults) => ({
  type: SAVED,
  id,
  savedResults,
});

export const DELETING = 'DELETING';
export const DELETED = 'DELETED';
export const del = id => async (dispatch, getState) => {
  console.log(id, getState());
};

export const REPORTING = 'REPORTING';
export const REPORTED = 'REPORTED';
export const report = (id, reason) => async (dispatch, getState) => {
  console.log(id, reason, getState());
};

export const LOADING_MORE = 'LOADING_MORE';
export const LOADED_MORE = 'LOADED_MORE';
export const loadMore = ids => async (dispatch, getState) => {
  console.log(ids, getState());
};

export const REPLYING = 'REPLYING';
export const REPLIED = 'REPLIED';
export const REPLY = 'REPLY';

export const replying = (id, text) => ({ type: REPLYING, id, text });
export const replied = (newComment) => ({ type: REPLIED, comment: newComment });
export const reply = (id, text) => async (dispatch, getState) => {
  const state = getState();

  if (state.replying[id] || !text || !id) { return; }

  text = text.trim();

  const type = models.ModelTypes.thingType(id);
  const objects = state[`${type}s`];
  const thing = objects[id];

  dispatch(replying(id, text));

  const apiResponse = await thing.reply(apiOptionsFromState(state), text);
  const newRecord = apiResponse.results[0];

  // add the new model
  dispatch(receivedResponse(apiResponse, models.ModelTypes.COMMENT));

  // If it's a comment, stub the parent so it receives the new replies.
  if (type === models.ModelTypes.COMMENT) {
    const stub = thing.set({ replies: [newRecord, ...thing.replies] });

    // update the parent with the new reply
    dispatch(updatedModel(stub, type));

  } else if (type === models.ModelTypes.POST) {
    const comment = apiResponse.comments[apiResponse.results[0].uuid];
    // If it's a post, add it as a new model.
    dispatch(newModel(comment, models.ModelTypes.COMMENT));
  }

  dispatch(replied(apiResponse.comments[newRecord.uuid]));
};
