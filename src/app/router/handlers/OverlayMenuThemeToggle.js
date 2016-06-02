import { BaseHandler, METHODS } from '@r/platform/router';

import { toggleTheme } from 'app/actions/theme';
import { closeOverlayMenu } from 'app/actions/overlayMenu';

export const NAME = 'OverlayMenuThemeToggle';

export default class OverlayMenuThemeToggle extends BaseHandler {
  name = NAME;

  async [METHODS.POST](dispatch) {
    dispatch(toggleTheme());
    dispatch(closeOverlayMenu());
  }
}
