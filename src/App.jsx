'use strict';

import css from 'style-loader!css-loader!less-loader!./../public/css/app.less';

import React, { Component } from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';

import CompassEdit from './CompassEdit.jsx';
import CompassView from './CompassView.jsx';
import LandingPage from './LandingPage.jsx';
import Tutorial from './Tutorial.jsx';
import NotFound from './NotFound.jsx';

class App extends Component {

    constructor(props, context) {
        super(props, context);
        this.state = {data: {}};
    }

    render() {
        return (
            <Router history={browserHistory}>
                <Route path='/' component={LandingPage} />
                <Route path='/compass/edit/:code/:username' component={CompassEdit} />
                <Route path='/compass/view/:code/:username' component={CompassView} />
                <Route path='/tutorial' component={Tutorial} />
                <Route path='*' component={NotFound} />
            </Router>
        );
    }
}

$(window).ready(() => render(<App />, document.getElementById('container')));
