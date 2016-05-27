import './styles.less';

import React from 'react';
import { connect } from 'react-redux';

import * as overlayMenuActions from 'app/actions/overlayMenu';

import {
  OVERLAY_MENU_CSS_CLASS,
  OVERLAY_MENU_CSS_TOP_NAV_MODIFIER,
} from 'app/constants';

const T = React.PropTypes;

const stopClickPropagation = (e) => {
  e.stopPropagation();
};

const overlayClassName = (props) => {
  let className = OVERLAY_MENU_CSS_CLASS;
  if (!props.fullscreen) {
    className += ` ${OVERLAY_MENU_CSS_TOP_NAV_MODIFIER}`;
  }

  return className;
};

const onClose = (props) => () => {
  props.onClose();
  props.closeOverlayMenu();
};

export const OverlayMenu = (props) => (
  <nav
    className={ overlayClassName(props) }
    onClick={ onClose(props) }
  >
    <ul className='OverlayMenu-ul list-unstyled' onClick={ stopClickPropagation }>
      { props.children }
    </ul>
  </nav>
);

OverlayMenu.defaultProps = {
  onClose: () => {},
};

OverlayMenu.propTypes = {
  fullscreen: T.bool,
  closeOverlayMenu: T.func,
  onClose: T.func,
  children: T.array,
};

const mapDispatchProps = (dispatch) => ({
  closeOverlayMenu: () => dispatch(overlayMenuActions.closeOverlayMenu()),
});

export default connect(() => ({}), mapDispatchProps)(OverlayMenu);
