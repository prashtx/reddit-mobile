import url from 'url';

const ID_REGEX = /(?:t\d+_)?(.*)/;

export function getBasePayload(state) {
  const referrer = state.platform.currentPage.referrer || '';
  const domain = window.location.host;

  // todo geoip_country, user_agent
  return {
    domain,
    //geoip_country: props.country || props.app.getState('country') || null,
    //user_agent: ctx.userAgent || '',
    referrer_domain: url.parse(referrer).host || domain,
    referrer_url: referrer,
  };
}


export function convertId (id) {
  const unprefixedId = ID_REGEX.exec(id)[1];
  return parseInt(unprefixedId, 36);
}
