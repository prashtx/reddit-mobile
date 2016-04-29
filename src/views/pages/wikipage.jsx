import React from 'react';
import moment from 'moment';

import mobilify from '../../lib/mobilify';
import blankTargets from '../../lib/blankTargets';

import BasePage from './BasePage';
import Loading from '../components/Loading';
import Listing from '../components/listings/Listing';
import TextSubNav from '../components/TextSubNav';

const PAGETYPES = {
  LISTING: 't3',
  WIKIPAGE: 'WikiPage',
  WIKI_REVISION: 'WikiRevision',
  WIKIPAGE_LISTING: 'WikiPageListing',
  WIKIPAGE_SETTINGS: 'WikiPageSettings',
};

export const MESSAGES = {
  NO_REVISIONS: 'No recent revisions to show.',
  NO_CONVERSATIONS: 'No discussions about this page.',
  NO_MARKDOWN: 'Nothing here...',
};

class WikiPageComp extends BasePage {
  static propTypes = {
    subredditName: React.PropTypes.string,
    ctx: React.PropTypes.object.isRequired,
  };

  renderWikiRevisions(wikiPage) {
    if (!wikiPage.revisions.length) {
      return (
        <div className='wikiPage-container'>
          <p>{ MESSAGES.NO_REVISIONS }</p>
        </div>
      );
    }

    const revisions = wikiPage.revisions.map((wikiRevision, i) => {
      const { author, page, timestamp } = wikiRevision;
      return (
        <tr key={ i }>
          <td className='wikiPage-revision-author'>{ author ? author.name : 'Unknown' }</td>
          <td>{ page }</td>
          <td className='wikiPage-revision-date'>{ moment(timestamp * 1000).fromNow() }</td>
        </tr>
      );
    });

    return (
      <div className='wikiPage-container'>
        <h2>Revisions</h2>
        <table className='wikiPage-revision-table'>
          <tbody>
            <tr>
              <th>User</th>
              <th>Page</th>
              <th>When</th>
            </tr>
            { revisions }
          </tbody>
        </table>
      </div>
    );
  }

  renderConversations(wikiPage, user, props) {
    const { conversations } = wikiPage;
    if (!conversations || !conversations.length) {
      return (
        <div className='wikiPage-container'>
          <p>{ MESSAGES.NO_CONVERSATIONS }</p>
        </div>
      );
    }

    return (
      <Listing
        {...props}
        feature={ this.state.feature }
        compact={ props.compact }
        user={ user || null }
        showAds={ false }
        listings={ conversations }
      />
    );
  }

  renderWikiPageList(wikiPage) {
    const list = wikiPage.pages.map((link, i) => {
      return (
        <li key={ i }>
          <a href={ link }>{ link }</a>
        </li>
      );
    });

    return (
      <div className='wikiPage-container'>
        <ul className='list-unstyled'>
          { list }
        </ul>
      </div>
    );
  }

  renderWikiPage(wikiPage) {
    const { content_html, revision_by, revision_date } = wikiPage;
    const body = content_html || MESSAGES.NO_MARKDOWN;
    const editor = revision_by ? revision_by.name: 'Unknown';
    const date = moment(revision_date * 1000).fromNow();

    return (
      <div>
        <div className='wikiPage-container'>
          <div
            className='wikiPage-html'
            dangerouslySetInnerHTML={ { __html: blankTargets(mobilify(body)) } }
          />
        </div>
        <p className='wikiPage-last-edit'>
          Revision by
          <span className='bold'> { editor }</span> - { date }
        </p>
      </div>
    );
  }

  renderWikiSettings(wikiPage, wikiPath) {
    const { pageEditorsList, editingPermissionLevel, listedInPagesIndex } = wikiPage;
    const editors = pageEditorsList.map((editor, i) => {
      return (
        <li key= { i } >{ editor.name }</li>
      );
    });

    const showInIndex = listedInPagesIndex ? 'true' : 'false';

    return (
      <div className='wikiPage-container'>
        <div>
          <h2 className='wikiPage-settings-title'>Settings for { wikiPath }</h2>
          <p>
            Page editing permissions:
            <span className='bold'> { editingPermissionLevel }</span>
          </p>
          <p>
            show this page on the list of wiki pages:
            <span className='bold'> { showInIndex }</span>
          </p>
          <h4>Authorized to edit this page:</h4>
          <ul className='list-unstyled'>
            { editors }
          </ul>
        </div>
      </div>
    );
  }

  makeContent(props, data, wikiPath) {
    const { wikiPage, user } = data;

    switch (data.wikiPage._type) {
      case PAGETYPES.LISTING:
        return this.renderConversations(wikiPage, user, props);
      case PAGETYPES.WIKI_REVISION:
        return this.renderWikiRevisions(wikiPage);
      case PAGETYPES.WIKIPAGE_LISTING:
        return this.renderWikiPageList(wikiPage);
      case PAGETYPES.WIKIPAGE:
        return this.renderWikiPage(wikiPage);
      case PAGETYPES.WIKIPAGE_SETTINGS:
        return this.renderWikiSettings(wikiPage, wikiPath);
    }
  }

  maybeRenderDiscussLink(wikiPath, discussActive, urlPrefix) {
    return wikiPath ? (
      <li className={ `TextSubNav-li ${discussActive}` } >
        <a
          className='TextSubNav-a'
          href={ `${urlPrefix}/wiki/discussions/${wikiPath}` }
        >
          Discussions
        </a>
      </li>
    ) : null;
  }

  render() {
    const { data, loaded } = this.state;

    if (!loaded || !data.wikiPage) {
      return (
        <Loading />
      );
    }

    const { wikiPath, subPath } = this.props.ctx.params;
    const content = this.makeContent(this.props, data, wikiPath);

    const subreddit = this.props.subredditName;
    const urlPrefix = subreddit ? `/r/${subreddit}` : '';

    const revisionActive = subPath === 'revisions' ? 'active' : '';
    const pagesActive = subPath === 'pages' ? 'active' : '';
    const discussActive = subPath === 'discussions' ? 'active' : '';

    const discussLink = this.maybeRenderDiscussLink(wikiPath,
                                                    discussActive,
                                                    urlPrefix);

    const path = wikiPath ? `/${wikiPath}` : '';

    return (
      <div className='container wikiPage-wrapper'>
        <TextSubNav>
          <li className={ `TextSubNav-li ${revisionActive}` } >
            <a
              className='TextSubNav-a'
              href={ `${urlPrefix}/wiki/revisions${path}` }
            >
              Revisions
            </a>
          </li>
          { discussLink }
          <li className={ `TextSubNav-li ${pagesActive}` } >
            <a
              className='TextSubNav-a'
              href={ `${urlPrefix}/wiki/pages` }
            >
              Pages
            </a>
          </li>
        </TextSubNav>
         { content }
      </div>
    );
  }
}

export default WikiPageComp;
