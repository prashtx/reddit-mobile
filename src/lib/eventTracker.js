import crypto from 'crypto';
import EventTracker from 'event-tracker';

import makeRequest from 'lib/makeRequest';
import { objectToHash } from 'lib/objectToHash';

import { DEFAULT_API_TIMEOUT } from 'app/constants';

function calculateHash (key, string) {
  const hmac = crypto.createHmac('sha256', key);
  hmac.setEncoding('hex');
  hmac.write(string);
  hmac.end();

  return hmac.read();
}

function post({url, data, query, headers, done}) {
  return makeRequest
    .post(url)
    .query(query)
    .set(headers)
    .timeout(DEFAULT_API_TIMEOUT)
    .send(data)
    .then(done);
}

const trackers = {};

export function getEventTracker(state) {
  const {
    trackerKey,
    trackerClientSecret,
    trackerEndpoint,
    trackerClientAppName,
  } = state.config;

  const hash = objectToHash({
    trackerKey,
    trackerClientSecret,
    trackerEndpoint,
    trackerClientAppName,
  });

  let tracker = trackers[hash];

  if (!tracker) {
    const base64Secret = new Buffer(trackerClientSecret, 'base64').toString();

    tracker = new EventTracker(
      trackerKey,
      base64Secret,
      post,
      trackerEndpoint,
      trackerClientAppName,
      calculateHash,
      {
        appendClientContext: true,
        bufferLength: 1,
      }
    );

    trackers[hash] = tracker;
  }

  return tracker;
}
