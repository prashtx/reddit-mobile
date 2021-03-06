// Redirect desktop urls to mobile-web urls.
const SORTS = 'hot|new|rising|controversial|top|gilded';

function redirectSort(ctx, sort, subreddit) {
  let url = `?sort=${sort}`;

  if (subreddit) {
    url = `/r/${subreddit}${url}`;
  } else {
    url = `/${url}`;
  }

  ctx.redirect(url);
}

function routes(app) {
  app.router.get(`/:sort(${SORTS})`, function *() {
    const { sort, subreddit} = this.params;
    redirectSort(this, sort, subreddit);
  });

  app.router.get(`/r/:subreddit/:sort(${SORTS})`, function *() {
    const { sort, subreddit} = this.params;
    redirectSort(this, sort, subreddit);
  });

  app.router.get('/user/:user', function *() {
    return this.redirect(`/u/${this.params.user}`);
  });

  app.router.get('/user/:user/m/:multi', function *() {
    return this.redirect(`/u/${this.params.user}/m/${this.params.multi}`);
  });

  app.router.get('/search/:query', function *() {
    return this.redirect(`/search?q=${this.params.query}`);
  });

  app.router.get('/r/:subreddit/search/:query', function *() {
    return this.redirect(`/r/${this.params.subreddit}/search?q=${this.params.query}`);
  });

  app.router.get('/help/*', function*() {
    const url = this.params[0];
    return this.redirect(`/wiki/${url}`);
  });

  app.router.get('/rules', function*() {
    return this.redirect('/wiki/contentpolicy');
  });

  app.router.get('/live/:idOrFilter?', function*() {
    const { idOrFilter } = this.params;
    const id = idOrFilter ? `/${idOrFilter}` : '';
    return this.redirect(`${app.config.reddit}/live${id}`);
  });
}

export default routes;
