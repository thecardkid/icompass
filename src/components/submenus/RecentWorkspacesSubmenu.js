import * as classNames from 'classnames';
import React, { Component } from 'react';

import Storage from '@utils/Storage';

export const scrollerClass = 'recent-scroller';

function displayTimestamp(ts) {
  const d = new Date(ts);
  const diffDays = Math.round((new Date() - d) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Return HH:MM timestamp with no seconds.
    return 'today';
  } else if (diffDays === 1) {
    return 'yesterday';
  } else {
    return `${diffDays} days ago`;
  }
}

function isCurrentWorkspace(code) {
  const parts = location.pathname.split('/');
  if (parts.length < 4) {
    return false;
  }
  return code === parts[3];
}

export default class RecentWorkspacesSubmenu extends Component {
  constructor(props) {
    super(props);

    this.perPage = 10;
    this.state = {
      page: 0,
    };
    this.recentWorkspaces = Object.values(Storage.getRecentWorkspaces()).sort((a, b) => {
      return b.visitedAt - a.visitedAt;
    }).filter(x => {
      return !isCurrentWorkspace(x.url.split('/')[3]);
    });
    this.maxPages = Math.ceil(this.recentWorkspaces.length / this.perPage);
  }

  prevPage = () => {
    this.setState({ page: Math.max(0, this.state.page-1) });
  };

  nextPage = () => {
    this.setState({ page: Math.min(this.maxPages-1, this.state.page+1) });
  };

  render() {
    const count = this.recentWorkspaces.length;
    if (count === 0) {
      return (
        <div className={'ic-menu ic-recent-submenu short'}>
          <div className={'ic-menu-item recent-workspace'} key={i}>
            <div>None</div>
          </div>
        </div>
      );
    }

    const i = this.state.page * this.perPage;
    const j = (this.state.page + 1) * this.perPage;
    const showNavbar = count > this.perPage;
    return (
      <div className={classNames('ic-menu ic-recent-submenu', {simple: !showNavbar})}>
        {showNavbar && (
          <section>
            <div className={'ic-menu-item navbar'}>
              <span className={'fraction'} >{this.state.page+1}/{this.maxPages}</span>
              <div className={'buttons'}>
                <button onClick={this.prevPage} className={classNames('back', scrollerClass, {disabled: i === 0})}>Back</button>
                <button onClick={this.nextPage} className={classNames('next', scrollerClass, {disabled: j > count})}>Next</button>
              </div>
            </div>
          </section>
        )}
        <section>
          {this.recentWorkspaces.slice(i, j).map((x, i) => {
            return (
              <div className={'ic-menu-item recent-workspace'} key={i}>
                <a href={x.url} className={'container'}>
                  <div className={'text'} key={0}>
                    <i className={'material-icons'}>{x.isViewOnly ? 'visibility' : 'edit'}</i>
                    <p className={'topic'}>{x.topic}</p>
                  </div>
                  <div className={'when'} key={1}>
                    <em>{displayTimestamp(x.visitedAt)}</em>
                  </div>
                </a>
              </div>
            );
          })}
        </section>
      </div>
    );
  }
}
