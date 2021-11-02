import '../css/app.less';

import $ from 'jquery';
import React, { Component } from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';

import AdminPage from '@components/AdminPage';

import Toast from '@utils/Toast';

import Store from '../store';

class AdminApp extends Component {
  constructor() {
    super();
    this.toast = Toast.getInstance();
  }

  render() {
    return (
      <div>
        <Provider store={Store()}>
          <Router history={browserHistory}>
            <Route path={'/admin'} component={AdminPage} />
          </Router>
        </Provider>
      </div>
    );
  }
}

$(window).ready(() => render(<AdminApp/>, document.getElementById('container')));
