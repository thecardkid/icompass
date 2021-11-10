import '@css/app.less';

import $ from 'jquery';
import React, { Component } from 'react';
import ReactGA from 'react-ga';
import { render } from 'react-dom';
import { connect, Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';

import DisableAutoEmail from './DisableAutoEmail';
import LandingPage from './LandingPage.jsx';
import NotFound from './NotFound.jsx';
import Workspace from './Workspace.jsx';

import * as uiX from '@actions/ui';
import PromptName from '@components/PromptName.jsx';
import Toast from '@components/utils/Toast';
import { initializeAPI } from '@utils/api';

import Store from '../store';
import { bindActionCreators } from 'redux';

class ConsumerAppInner extends Component {
  constructor(props) {
    super(props);

    initializeAPI(props.uiX);
    if (GA_TRACKING_ID) {
      ReactGA.initialize(GA_TRACKING_ID, { standardImplementation: true });
      // eslint-disable-next-line no-console
      console.log('Initialized Google Analytics');
    }
  }

  render() {
    return (
      <div>
        <Toast />
        <Router history={browserHistory}>
          <Route path={'/'} component={LandingPage} />
          <Route path={'/compass/view/:code(/:username)'} viewOnly={true} component={Workspace} />
          <Route path={'/compass/edit/:code/:username'} viewOnly={false} component={Workspace} />
          <Route path={'/compass/edit/:code'} viewOnly={false} component={PromptName} />
          <Route path={'/disable-auto-email'} component={DisableAutoEmail} />
          <Route path={'*'} component={NotFound} />
        </Router>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {
    uiX: bindActionCreators(uiX, dispatch),
  };
};

const ConsumerApp = connect(mapStateToProps, mapDispatchToProps)(ConsumerAppInner);

class App extends Component {
  render() {
    return (
      <div>
        <Provider store={Store()}>
          <ConsumerApp />
        </Provider>
      </div>
    );
  }
}

$(window).ready(() => render(<App/>, document.getElementById('container')));
