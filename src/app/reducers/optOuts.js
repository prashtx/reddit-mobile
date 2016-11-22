import { merge } from '@r/platform';
import * as platformActions from '@r/platform/actions';

import { XPROMO_LISTING_OPT_OUT } from 'app/constants';

const DEFAULT = {};

export default function (state=DEFAULT, action={}) {
  switch (action.type) {
    case platformActions.SET_PAGE: {
      const { queryParams } = action.payload;

      const xpromoSetting = queryParams[XPROMO_LISTING_OPT_OUT];

      // If the setting is not present, we treat it as such.
      if (xpromoSetting === undefined) {
        return state;
      }

      // Unset the flag
      if (xpromoSetting === 'false') {
        return merge(state, {
          xpromoListing: undefined,
        });
      }

      return merge(state, {
        xpromoListing: true,
      });
    }

    default: return state;
  }
}
