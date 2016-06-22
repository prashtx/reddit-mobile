import { setConfig } from 'app/actions/config';

export const dispatchInitialConfig = async (env, dispatch) => {
  const {
    TRACKER_CLIENT_NAME: trackerClientAppName = '',
    TRACKER_SECRET: trackerClientSecret = '',
    TRACKER_ENDPOINT: trackerEndpoint = '',
    TRACKER_KEY: trackerKey = '',
  } = env;

  dispatch(setConfig({
    trackerClientAppName,
    trackerClientSecret,
    trackerEndpoint,
    trackerKey,
  }));
};
