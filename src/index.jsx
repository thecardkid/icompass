'use strict';

import css from 'style-loader!css-loader!less-loader!./../public/css/app.less';

import React, { Component } from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';

import Compass from './Compass.jsx';
import LandingPage from './LandingPage.jsx';

class Index extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {};

        this.setCompass = (compass, username) => {
            this.setState({compass: compass, username: username}, () => browserHistory.push('/compass'));
        }
    }

    render() {
        return (
            <Router history={browserHistory}>
                <Route path='/' setCompass={this.setCompass} component={LandingPage}/>
                <Route path='/compass' component={() => (<Compass compass={this.state.compass} username={this.state.username}/>)}/>
            </Router>
        );
    }
}

function run() {
    render(<Index/>, document.getElementById('container'));
}

$(window).ready(run);
