import '../css/app.less';

import $ from 'jquery';
import React, { Component } from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';

import LandingPage from '../containers/LandingPage.jsx';
import NotFound from '../containers/NotFound.jsx';
import Workspace from '../containers/Workspace.jsx';

import PromptName from '../components/PromptName.jsx';

import Store from '../store';
import Toast from '../utils/Toast';

class App extends Component {
  constructor() {
    super();
    this.toast = Toast.getInstance();
  }

  render() {
    return (
      <Provider store={Store()}>
        <Router history={browserHistory}>
          <Route path='/' component={LandingPage}/>
          <Route path='/compass/edit/:code/:username' viewOnly={false} component={Workspace}/>
          <Route path='/compass/edit/:code' viewOnly={false} component={PromptName}/>
          <Route path='/compass/view/:code(/:username)' viewOnly={true} component={Workspace}/>
          <Route path='*' component={NotFound}/>
        </Router>
      </Provider>
    );
  }
}

$(window).ready(() => render(<App/>, document.getElementById('container')));
