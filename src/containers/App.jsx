'use strict';

import '../css/app.less';

import React, { Component } from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import { Provider } from 'react-redux';

import Workspace from 'Containers/Workspace.jsx';
import LandingPage from 'Containers/LandingPage.jsx';
import Tutorial from 'Containers/Tutorial.jsx';
import PromptName from 'Components/PromptName.jsx';
import NotFound from 'Containers/NotFound.jsx';

import Store from '../store';

class App extends Component {
    render() {
        return (
            <Provider store={Store()}>
                <Router history={browserHistory}>
                    <Route path='/' component={LandingPage} />
                    <Route path='/compass/edit/:code/:username' viewOnly={false} component={Workspace} />
                    <Route path='/compass/edit/:code' viewOnly={false} component={PromptName} />
                    <Route path='/compass/view/:code(/:username)' viewOnly={true} component={Workspace} />
                    <Route path='/tutorial' component={Tutorial} />
                    <Route path='*' component={NotFound} />
                </Router>
            </Provider>
        );
    }
}

$(window).ready(() => render(<App />, document.getElementById('container')));
