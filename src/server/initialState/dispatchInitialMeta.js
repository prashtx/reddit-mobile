import * as metaActions from '../../app/actions/meta';

export const dispatchInitialMeta = async (ctx, dispatch) => {
  const meta = {
    userAgent: ctx.headers['user-agent'] || '',
    country: ctx.headers['cf-ipcountry'] || '',
  };

  dispatch(metaActions.setMeta(meta));
};
