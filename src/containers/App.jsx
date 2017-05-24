'use strict';

import css from 'style-loader!css-loader!less-loader!./../../public/css/app.less';

import React, { Component } from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import { Provider } from 'react-redux';

import Store from '../store';

import CompassEdit from 'Containers/CompassEdit.jsx';
import CompassView from 'Containers/CompassView.jsx';
import LandingPage from 'Containers/LandingPage.jsx';
import Tutorial from 'Containers/Tutorial.jsx';
import PromptName from 'Components/PromptName.jsx';
import NotFound from 'Containers/NotFound.jsx';

class App extends Component {

    constructor(props, context) {
        super(props, context);
        this.state = {data: {}};
    }

    render() {
        return (
            <Provider store={Store()}>
                <Router history={browserHistory}>
                    <Route path='/' component={LandingPage} />
                    <Route path='/compass/edit/:code/:username' component={CompassEdit} />
                    <Route path='/compass/edit/:code' component={PromptName} />
                    <Route path='/compass/view/:code(/:username)' component={CompassView} />
                    <Route path='/tutorial' component={Tutorial} />
                    <Route path='*' component={NotFound} />
                </Router>
            </Provider>
        );
    }
}

$(window).ready(() => render(<App />, document.getElementById('container')));
