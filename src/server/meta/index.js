import { isString } from 'lodash/lang';

const appleAppSiteAssociation = JSON.stringify({
  activitycontinuation: {
    apps: [
      '2TDUX39LX8.com.reddit.Reddit',
    ],
  },
  webcredentials: {
    apps: [
      '2TDUX39LX8.com.reddit.Reddit',
    ],
  },
  applinks: {
    apps: [],
    details: [
      {
        appID: '2TDUX39LX8.com.reddit.Reddit',
        paths: [ '/r/*', '/u/*', '/user/*', '/' ],
      },
    ],
  },
});

const EXCLUDED_ROUTES = ['*', '/robots.txt', '/live/:idOrFilter?',
                         '/goto', '/faq', '/health', '/routes',
                         '/apple-app-site-association'];

export default (router, apiOptions) => {
  router.get('/routes', (ctx) => {
    ctx.body = router.stack
      .filter(function(r) {
        return (
          r.methods.indexOf('GET') > -1 && // only map GET requests
          !r.path.includes('/oauth2/') &&
          !EXCLUDED_ROUTES.includes(r.path)
        );
      })
      .map(function(r) {
        return {
          regexp: r.regexp.toString(),
          path: r.path,
        };
      });
  });

  router.get('/apple-app-site-association', (ctx) => {
    ctx.body = appleAppSiteAssociation;
    ctx.type = 'application/json';
  });

  router.get('/robots.txt', (ctx) => {
    ctx.body = `
      # 80legs
      User-agent: 008
      Disallow: /

      # 80legs' new crawler
      User-agent: voltron
      Disallow: /

      User-Agent: bender
      Disallow: /my_shiny_metal_ass

      User-Agent: Gort
      Disallow: /earth

      User-Agent: *
      Disallow: /*/comments/*?*sort=
      Disallow: /r/*/comments/*/*/c*
      Disallow: /comments/*/*/c*
      Disallow: /*after=
      Disallow: /*before=
      Disallow: /login
      Disallow: /search
      Disallow: /r/*/search
      Disallow: /u/*
      Disallow: /message/*
      Disallow: /submit*
      Disallow: /r/*/submit/*
      Allow: /
    `;
  });

  router.post('/error', (ctx) => {
    const { error } = ctx.request.body;
    // log it out if it's a legit origin
    if (ctx.headers.origin &&
        apiOptions.servedOrigin.indexOf(ctx.headers.origin) === 0 &&
        isString(error)) {
      console.log(error.substring(0,1000));
    }

    ctx.body = null;
    return;
  });

  router.post('/csp-report', (ctx) => {
    // log it out if it's a legit origin
    if (ctx.headers.origin &&
        apiOptions.servedOrigin.indexOf(ctx.headers.origin) === 0) {

      const { 'csp-report': report } = ctx.request.body;

      const log = [
        'CSP REPORT',
        report['document-uri'],
        report['blocked-uri'],
      ];

      console.log(log.join('|'));
    }

    ctx.body = null;
    return;
  });

  router.post('/timings', function *() {
    const statsURL = app.config.statsURL;
    const timings = this.request.body.rum;

    if (!app.config.actionNameSecret) {
      console.log('returning early, no secret');
      return;
    }

    const secret = (new Buffer(app.config.actionNameSecret, 'base64')).toString();
    const algorithm = 'sha1';
    let hash;

    const hmac = crypto.createHmac(algorithm, secret);
    hmac.setEncoding('hex');
    hmac.write(timings.actionName);
    hmac.end();

    hash = hmac.read();

    timings.verification = hash;

    superagent
        .post(statsURL)
        .type('json')
        .send({ rum: timings })
        .timeout(constants.DEFAULT_API_TIMEOUT)
        .end(function() { });
  });

};
