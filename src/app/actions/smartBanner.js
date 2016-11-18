import { markBannerClosed } from 'lib/smartBannerState';

export const SHOW = 'SMARTBANNER__SHOW';
export const show = () => ({ type: SHOW });

export const HIDE = 'SMARTBANNER__HIDE';
export const hide = () => ({ type: HIDE });

export const close = () => async (dispatch) => {
  markBannerClosed();
  dispatch(hide());
};
