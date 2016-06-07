import { createSelector } from 'reselect';
import features from 'featureFlags';

export const featuresSelector = createSelector(
  (state) => features.withContext({ state }),
  (feature) => (feature),
);

