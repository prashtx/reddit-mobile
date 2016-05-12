import { BaseHandler, METHODS } from '@r/platform/router';

import { toggleCompact } from '../../actions/compact';
import { closeOverlayMenu } from '../../actions/overlayMenu';

export default class OverlayMenuCompactToggle extends BaseHandler {
  async [METHODS.POST](dispatch) {
    dispatch(toggleCompact());
    dispatch(closeOverlayMenu());
  }
}
