'use strict';

import css from 'style-loader!css-loader!less-loader!./../public/css/app.less';

import React, { Component } from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import { MODES, PROMPTS } from '../utils/constants.js';

import CompassEdit from './CompassEdit.jsx';
import CompassView from './CompassView.jsx';
import LandingPage from './LandingPage.jsx';
import Tutorial from './Tutorial.jsx';

class App extends Component {

    onReady(data) {
        this.setState({
            compass: data.compass,
            mode: data.mode,
            code:data.code,
            username: data.username
        }, () => browserHistory.push('/compass'));
    }

    render() {
        return (
            <Router history={browserHistory}>
                <Route path='/' ready={this.onReady.bind(this)} component={LandingPage} />
                <Route path='/:code/:username' socket={this.socket} component={LandingPage} />
                <Route path='/compass' component={() => {
                    if (this.state.mode === MODES.EDIT)
                        return <CompassEdit compass={this.state.compass} username={this.state.username} />
                    else if (this.state.mode === MODES.VIEW) {
                        return <CompassView compass={this.state.compass} />
                    }
                }} />
                <Route path='/tutorial' socket={this.socket} component={Tutorial} />
            </Router>
        );
    }
}

$(window).ready(() => render(<App />, document.getElementById('container')));
