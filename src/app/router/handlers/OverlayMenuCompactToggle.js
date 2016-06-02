import { BaseHandler, METHODS } from '@r/platform/router';

import { toggleCompact } from 'app/actions/compact';
import { closeOverlayMenu } from 'app/actions/overlayMenu';

export const NAME = 'OverlayMenuCompactToggle';

export default class OverlayMenuCompactToggle extends BaseHandler {
  name = NAME;

  async [METHODS.POST](dispatch) {
    dispatch(toggleCompact());
    dispatch(closeOverlayMenu());
  }
}
