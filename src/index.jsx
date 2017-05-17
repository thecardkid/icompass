'use strict';

import css from 'style-loader!css-loader!less-loader!./../public/css/app.less';

import React, { Component } from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import { MODES } from '../utils/constants.js';

import CompassEdit from './CompassEdit.jsx';
import CompassView from './CompassView.jsx';
import LandingPage from './LandingPage.jsx';

class Index extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {};

        this.setCompass = (json, username) => {
            this.setState({
                compass: json.compass,
                mode: json.mode,
                code:json.code,
                username: username
            }, () => browserHistory.push('/compass'));
        }
    }

    render() {
        return (
            <Router history={browserHistory}>
                <Route path='/' setCompass={this.setCompass} component={LandingPage}/>
                <Route path='/compass' component={() => {
                    if (this.state.mode === MODES.EDIT)
                        return <CompassEdit compass={this.state.compass} username={this.state.username}/>
                    else if (this.state.mode === modes.view) {
                        return <CompassView compass={this.state.compass}/>
                    }
                }}/>
            </Router>
        );
    }
}

$(window).ready(() => render(<Index/>, document.getElementById('container')));
