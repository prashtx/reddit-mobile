import React from 'react';

import take from 'lodash/array/take';
import filter from 'lodash/collection/filter';

import { Swipeable } from 'react-touch';
import { Motion, spring } from 'react-motion';

import constants from '../../../constants';
import formatNumber from '../../../lib/formatNumber';
import mobilify from '../../../lib/mobilify';
import localStorageAvailable from '../../../lib/localStorageAvailable';

import BaseComponent from '../BaseComponent';
import PostContent from './PostContent';
import { cleanPostHREF } from './postUtils';

const T = React.PropTypes;

const NUM_TOP_lINKS = 3;
const NUM_NEXT_LINKS = 5;

const {
  VARIANT_RELEVANCY_TOP,
  VARIANT_RELEVANCY_ENGAGING,
  VARIANT_RELEVANCY_RELATED,
  VARIANT_NEXTCONTENT_BOTTOM,
  VARIANT_NEXTCONTENT_MIDDLE,
  VARIANT_NEXTCONTENT_BANNER,
  VARIANT_NEXTCONTENT_TOP3,
} = constants.flags;

function mod(m, n) {
  return ((m % n) + n) % n;
}

export default class RelevantContent extends BaseComponent {
  static propTypes = {
    feature: T.object.isRequired,
    relevant: T.object.isRequired,
    isSelfText: T.bool.isRequired,
    width: T.number.isRequired,
    subredditName: T.string,
    subreddit: T.object,
    listingId: T.string,
    loid: T.string.isRequired,
    loidcreated: T.string.isRequired,
  };

  constructor(props) {
    super(props);

    if (props.feature.enabled(VARIANT_NEXTCONTENT_MIDDLE)) {
      this.state = {
        postNum: 0,
        ...this.state,
      };
    }
    if (props.feature.enabled(VARIANT_NEXTCONTENT_BANNER)) {
      this.state = {
        displayBanner: false,
        ...this.state,
      };
    }

    this.renderPostList = this.renderPostList.bind(this);
    this.renderCarouselPost = this.renderCarouselPost.bind(this);
    this.goToSubreddit = this.goToSubreddit.bind(this);
    this.goToPost = this.goToPost.bind(this);
    this.goToRelevancyPost = this.goToRelevancyPost.bind(this);
    this.goToNextContentPost = this.goToNextContentPost.bind(this);
    this.maybeShowBanner = this.maybeShowBanner.bind(this);
  }

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  addListeners() {
    if (!this.hasListeners) {
      this.hasListeners = true;
      if (this.props.feature.enabled(VARIANT_NEXTCONTENT_BANNER)) {
        if (window) {
          this.scrollY = window.scrollY;
          this.props.app.on(constants.SCROLL, this.maybeShowBanner);
        }
      }
    }
  }

  removeListeners() {
    if (this.hasListeners) {
      this.hasListeners = false;
      if (this.props.feature.enabled(VARIANT_NEXTCONTENT_BANNER)) {
        this.props.app.off(constants.SCROLL, this.maybeShowBanner);
      }
    }
  }

  maybeShowBanner() {
    if (window && window.scrollY > this.scrollY) {
      this.props.app.off(constants.SCROLL, this.maybeShowBanner);
      window.requestAnimationFrame(() => {
        this.setState({
          displayBanner: true,
        });
      });
    }
  }


  goToSubreddit(e, { url, id, name, linkName, linkIndex }) {
    e.preventDefault();
    const { app, isSelfText, loid, loidcreated } = this.props;
    // Send event
    app.emit('click:experiment', {
      eventType: 'cs.relevant_posts_mweb_click',
      loid,
      loidcreated,
      experimentName: 'relevancy_mweb',
      linkIndex,
      linkName,
      referrerPageType: isSelfText ? 'self' : 'link',
      referrerUrl: window.location.href,
      targetId: parseInt(id, 36),
      targetUrl: url,
      targetName: name,
      targetType: 'subreddit',
    });

    app.redirect(url);
  }

  goToPost(e, { eventType, experimentName, linkName, url, id, linkIndex }) {
    e.preventDefault();
    const { app, isSelfText, loid, loidcreated } = this.props;
    // Send event
    app.emit('click:experiment', {
      eventType,
      loid,
      loidcreated,
      experimentName,
      linkIndex,
      // linkName: `top post ${linkIndex}`,
      linkName,
      referrerPageType: isSelfText ? 'self' : 'link',
      referrerUrl: window.location.href,
      targetFullname: id,
      targetUrl: url,
      targetType: 'link',
    });

    app.redirect(url);
  }

  goToRelevancyPost(e, { url, id, linkIndex }) {
    return this.goToPost(e, {
      eventType: 'cs.relevant_posts_mweb_click',
      experimentName: 'relevancy_mweb',
      linkName: `top post ${linkIndex}`,
      url,
      id,
      linkIndex,
    });
  }

  goToNextContentPost(e, { url, id, linkIndex }) {
    // XXX change event type and experiment name
    return this.goToPost(e, {
      eventType: 'cs.nextcontent_posts_mweb_click', // XXX
      experimentName: 'nextcontent_mweb', // XXX
      linkName: `next content ${linkIndex}`,
      url,
      id,
      linkIndex,
    });
  }

  renderPostList(posts) {
    const { width, feature } = this.props;

    let makeOnClick;
    if (feature.enabled(VARIANT_RELEVANCY_TOP)) {
      makeOnClick = (url, name, i) => (
        e => this.goToRelevancyPost(e, { url, id: name, linkIndex: i + 1 })
      );
    } else if (feature.enabled(VARIANT_NEXTCONTENT_TOP3)) {
      makeOnClick = (url, name, i) => (
        e => this.goToNextContentPost(e, { url, id: name, linkIndex: i + 1 })
      );
    }

    return posts.map((post, i) => {
      const linkExternally = post.disable_comments;
      const url = cleanPostHREF(mobilify(linkExternally ? post.url : post.cleanPermalink));
      const { id, title, name } = post;
      // Make sure we always have an image to show
      // Link to the comment thread instead of external content
      const postWithFallback = {
        preview: {},
        ...post,
        thumbnail: post.thumbnail || '/img/placeholder-thumbnail.svg',
        cleanUrl: '#',
      };
      const onClick = makeOnClick(url, name, i);
      const noop = (e => e.preventDefault());
      return (
        <article ref='rootNode' className='Post' key={ id }>
          <div className='Post__header-wrapper' onClick={ onClick }>
            <PostContent
              post={ postWithFallback }
              single={ false }
              compact={ true }
              expandedCompact={ false }
              onTapExpand={ function () {} }
              width={ width }
              toggleShowNSFW={ false }
              showNSFW={ false }
              editing={ false }
              toggleEditing={ false }
              saveUpdatedText={ false }
              forceHTTPS={ this.forceHTTPS }
              isDomainExternal={ this.externalDomain }
              renderMediaFullbleed={ true }
              showLinksInNewTab={ false }
            />
            <header className='PostHeader size-compact m-thumbnail-margin'>
              <div className='PostHeader__post-descriptor-line-overflow'>
              <a
                className={ `PostHeader__post-title-line-blue ${post.visited ? 'm-visited' : ''}` }
                href='#'
                onClick={ noop }
                target={ linkExternally ? '_blank' : null }
              >
                { title }
              </a></div>
              <a
                className='PostHeader__post-title-line'
                href='#'
                onClick={ noop }
                target={ linkExternally ? '_blank' : null }
              >
                { post.ups } upvotes in r/{ post.subreddit }
              </a>
            </header>
          </div>
        </article>
      );
    });
  }

  renderCarouselPost(post, i, offset) {
    const { width } = this.props;
    const noop = (e => e.preventDefault());

    const linkExternally = post.disable_comments;
    const url = cleanPostHREF(mobilify(linkExternally ? post.url : post.cleanPermalink));
    const { id, title, name } = post;
    // Make sure we always have an image to show
    // Link to the comment thread instead of external content
    const postWithFallback = {
      preview: {},
      ...post,
      thumbnail: post.thumbnail || '/img/placeholder-thumbnail.svg',
      cleanUrl: '#',
    };
    const onClick = (e => this.goToNextContentPost(e, { url, id: name, linkIndex: i + 1 }));
    let articleClass;
    if (offset < 0) {
      articleClass = 'NextContent__carousel-prev';
    } else if (offset > 0) {
      articleClass = 'NextContent__carousel-next';
    } else {
      articleClass = 'NextContent__carousel-primary';
    }

        // style={ { transform: `translate3d(${dx}px, 0px, 0)`} }
    return (
      <article
        ref='rootNode'
        className={ `Post ${articleClass}` }
        key={ `${id}-${offset}` }
      >
        <div className='NextContent__post-wrapper' onClick={ onClick }>
          <PostContent
            post={ postWithFallback }
            single={ false }
            compact={ true }
            expandedCompact={ false }
            onTapExpand={ function () {} }
            width={ width }
            toggleShowNSFW={ false }
            showNSFW={ false }
            editing={ false }
            toggleEditing={ false }
            saveUpdatedText={ false }
            forceHTTPS={ this.forceHTTPS }
            isDomainExternal={ this.externalDomain }
            renderMediaFullbleed={ true }
            showLinksInNewTab={ false }
          />
          <header className='PostHeader size-compact m-thumbnail-margin'>
            <div className='PostHeader__post-descriptor-line'>
            <a
              className='PostHeader__post-title-line'
              href='#'
              onClick={ noop }
              target={ linkExternally ? '_blank' : null }
            >
              { title }
            </a></div>
            <a
              className='PostHeader__post-descriptor-line'
              href='#'
              onClick={ noop }
              target={ linkExternally ? '_blank' : null }
            >
              { post.ups } upvotes in r/{ post.subreddit }
            </a>
          </header>
        </div>
      </article>
    );
  }

  renderNextPostCarousel(posts) {
    const { postNum } = this.state;

    const postCount = Math.min(posts.length, NUM_NEXT_LINKS);

    const prevNum = mod(postNum - 1, postCount);
    const nextNum = mod(postNum + 1, postCount);

    const prevPost = this.renderCarouselPost(posts[prevNum], 0, -1);
    const primaryPost = this.renderCarouselPost(posts[postNum], 0, 0);
    const nextPost = this.renderCarouselPost(posts[nextNum], 0, 1);

    const onSwipeLeft = () => {
      console.log('swipe!'); // XXX
      this.setState({
        postNum: mod(postNum + 1, postCount),
      });
    };

    const onSwipeRight = () => {
      console.log('swipe!'); // XXX
      this.setState({
        postNum: mod(postNum - 1, postCount),
      });
    };

    return (
      <Swipeable onSwipeLeft={ onSwipeLeft } onSwipeRight={ onSwipeRight }>
        <div className='NextContent__drag-container'>
          { prevPost }
          { primaryPost }
          { nextPost }
        </div>
      </Swipeable>
    );
  }

  render() {
    const {
      feature,
      relevant,
      subredditName,
      subreddit,
      listingId,
    } = this.props;

    let visited = [];
    if (localStorageAvailable()) {
      const visitedString = localStorage.getItem('visitedPosts');
      if (visitedString) {
        visited = visitedString.split(',');
      }
    }

    const safeAndNew = (link =>
      !link.over_18 &&
      link.id !== listingId &&
      !link.stickied &&
      (visited.indexOf(link.id) === -1));

    const safe = (link =>
        !link.over_18 &&
        link.id !== listingId &&
        !link.stickied);

    if (feature.enabled(VARIANT_RELEVANCY_TOP) ||
        feature.enabled(VARIANT_NEXTCONTENT_TOP3)) {
      // Show top posts from this subreddit
      const topLinks = relevant.topLinks;
      const predicate = feature.enabled(VARIANT_NEXTCONTENT_TOP3) ? safeAndNew : safe;
      const links = take(filter(topLinks, predicate), NUM_TOP_lINKS);
      const postList = this.renderPostList(links);

      const onActionClick = (e => this.goToSubreddit(e, {
        url: subreddit.url,
        id: subreddit.id,
        name: subreddit.title,
        linkName: 'top 25 posts',
        linkIndex: NUM_TOP_lINKS + 1,
      }));

      return (
        <div className='RelevantContent container' key='relevant-container'>
          <div className='RelevantContent-header'>
            <span className='RelevantContent-row-spacer'>
              <span className='RelevantContent-icon icon-bar-chart orangered-circled'></span>
            </span>
            <span className='RelevantContent-row-text'>Top Posts in r/{ subredditName }</span>
          </div>
          { postList }
          <a
            className='RelevantContent-action'
            href='#'
            onClick={ onActionClick }
          >
              See top 25 Posts
          </a>
        </div>
      );
    }

    if (feature.enabled(VARIANT_NEXTCONTENT_BOTTOM) ||
        feature.enabled(VARIANT_NEXTCONTENT_BANNER)) {
      const { displayBanner } = this.state;

      const { topLinks } = relevant;
      // XXX rename some of these bindings
      let post;
      let i = 0;
      while (!post && i < topLinks.length) {
        const link = topLinks[i];
        if (safeAndNew(link)) {
          post = link;
        }
        i += 1;
      }

      if (!post) {
        return;
      }

      const { width } = this.props;
      const linkExternally = post.disable_comments;
      const url = cleanPostHREF(mobilify(linkExternally ? post.url : post.cleanPermalink));
      const { id, title, name } = post;
      // Make sure we always have an image to show
      // Link to the comment thread instead of external content
      const postWithFallback = {
        preview: {},
        ...post,
        thumbnail: post.thumbnail || '/img/placeholder-thumbnail.svg',
        cleanUrl: '#',
      };
      const onClick = (e => this.goToNextContentPost(e, { url, id: name, linkIndex: 0 }));
      const noop = (e => e.preventDefault());

      let variant = 'banner';
      let descriptor = null;
      let actionText = 'MORE';
      if (feature.enabled(VARIANT_NEXTCONTENT_BOTTOM)) {
        variant = 'bottom';
        descriptor = (
          <a
            className='PostHeader__post-descriptor-line'
            href='#'
            onClick={ noop }
            target={ linkExternally ? '_blank' : null }
          >
            { post.ups } upvotes in r/{ post.subreddit }
          </a>
        );
        actionText = 'NEXT';
      }

      const nextContent = y => (
        <div
          className={ `NextContent container ${variant}` }
          key='nextcontent-container'
          onClick={ onClick }
          style={ {
            WebkitTransform: `translate3d(0, ${y}px, 0)`,
            transform: `translate3d(0, ${y}px, 0)`,
          } }
        >
          <article ref='rootNode' className='Post' key={ id }>
            <div className='NextContent__post-wrapper'>
              <PostContent
                post={ postWithFallback }
                single={ false }
                compact={ true }
                expandedCompact={ false }
                onTapExpand={ function () {} }
                width={ width }
                toggleShowNSFW={ false }
                showNSFW={ false }
                editing={ false }
                toggleEditing={ false }
                saveUpdatedText={ false }
                forceHTTPS={ this.forceHTTPS }
                isDomainExternal={ this.externalDomain }
                renderMediaFullbleed={ true }
                showLinksInNewTab={ false }
              />
              <header className='NextContent__header'>
                <div className='NextContent__post-descriptor-line'>
                <a
                  className='NextContent__post-title-line'
                  href='#'
                  onClick={ noop }
                  target={ linkExternally ? '_blank' : null }
                >
                  { title }
                </a></div>
                { descriptor }
              </header>
            </div>
            <div className='NextContent__next-link'>
              <a
                href='#'
                onClick={ noop }
              >
                { actionText }
                <span className='icon-nav-arrowforward icon-inline'></span>
              </a>
            </div>
          </article>
        </div>
      );

      if (feature.enabled(VARIANT_NEXTCONTENT_BOTTOM)) {
        return nextContent(0);
      }
      return (
        <Motion style={ { y: spring(displayBanner ? 0 : 200) } }>
          { ({ y }) =>
            nextContent(y)
          }
        </Motion>
      );
    }

    if (feature.enabled(VARIANT_NEXTCONTENT_MIDDLE)) {
      // const { postNum } = this.state;

      const topLinks = relevant.topLinks;
      const links = take(filter(topLinks, safeAndNew), NUM_NEXT_LINKS);
      // const postCount = Math.min(links.length, NUM_NEXT_LINKS);
      const postList = this.renderNextPostCarousel(links);

      // const onSwipeLeft = () => {
      //   this.setState({
      //     postNum: (postNum + 1) % postCount,
      //   });
      //   console.log('swipe!'); // XXX
      // };

      // const onSwipeRight = () => {
      //   this.setState({
      //     postNum: (postNum - 1) % postCount,
      //   });
      //   console.log('swipe!'); // XXX
      // };

      return (
        <div
          className='NextContent container middle'
          key='nextcontent-container'
        >
          <div className='NextContent__heading'>
            Top Posts from r/Gaming {/* XXX */}
          </div>
          { postList }
        </div>
      );
    }

    if (feature.enabled(VARIANT_RELEVANCY_RELATED) ||
        feature.enabled(VARIANT_RELEVANCY_ENGAGING)) {
      // Show related or popular/engaging subreddits
      const communities = relevant.communities;

      let relevanceTitle = 'Popular Communities';
      let demonym = 'users';
      let icon = 'snoo';
      let iconColor = 'orangered-circled';
      let linkType = 'engaging';
      if (feature.enabled(VARIANT_RELEVANCY_RELATED)) {
        relevanceTitle = 'Gaming Communities';
        demonym = 'gamers';
        icon = 'gaming';
        iconColor = 'mint-circled';
        linkType = 'related';
      }

      return (
        <div className='RelevantContent container' key='relevant-container'>
          <div className='RelevantContent-header'>
            <span className='RelevantContent-row-spacer'>
              <span className={ `RelevantContent-icon icon-${icon} ${iconColor}` }></span>
            </span>
            <span className='RelevantContent-row-text'>{ relevanceTitle }</span>
          </div>
          { communities.map((c, i) => {
            const onClick = (e => this.goToSubreddit(e, {
              url: c.url,
              id: c.id,
              name: c.title,
              linkName: `${linkType} subreddit ${i + 1}`,
              linkIndex: i + 1,
            }));
            return (
              <div className='SearchPage__community' key={ c.id }>
                <div className='CommunityRow'>
                  <a
                    className='CommunityRow__icon'
                    href='#'
                    onClick={ onClick }
                  >
                    { c.icon_img
                      ? <img className='CommunityRow__iconImg' src={ c.icon_img }/>
                      : <div className='CommunityRow__iconBlank'/> }
                  </a>
                  <a
                    className='CommunityRow__details'
                    href='#'
                    onClick={ onClick }
                  >
                    <div className='CommunityRow__name'>
                      The { c.display_name } Community
                    </div>
                    <div className='CommunityRow__counts'>
                      Join { formatNumber(c.subscribers) } r/{ c.display_name } { demonym }
                    </div>
                    <div>
                      Visit this community
                    </div>
                  </a>
                </div>
              </div>
            );
          }) }
        </div>
      );
    }

    return null;
  }
}
