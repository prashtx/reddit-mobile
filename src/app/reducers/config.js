import { SET_CONFIG } from 'app/actions/config';

export const DEFAULT = {
  trackerClientAppName: '',
  trackerClientSecret: '',
  trackerEndpoint: '',
  trackerKey: '',
};

export default (state=DEFAULT, action={}) => {
  switch (action.type) {
    case SET_CONFIG: {
      return action.config;
    }

    default: return state;
  }
};
