import { flags as flagConstants } from 'app/constants';
import featureFlags from 'app/featureFlags';

export const CLOSE = 'MODAL__CLOSE';
export const closeModal = () => ({ type: CLOSE });

export const XPROMO_CLICK = 'MODAL_XPROMO_CLICK';
export const xpromoClickModal = () => ({ type: XPROMO_CLICK });

export const showXpromoModal = () => async (dispatch, getState) => {
  const state = getState();
  const features = featureFlags.withContext({ state });
  const { showBanner } = state.smartBanner;
  const { VARIANT_XPROMO_CLICK } = flagConstants;

  if (showBanner && features.enabled(VARIANT_XPROMO_CLICK)) {
    dispatch(xpromoClickModal());
  }
};
