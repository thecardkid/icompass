'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';

import Validator from 'Utils/Validator.jsx';

export default class PromptName extends Component {
    componentDidMount() {
        let valid = Validator.validateUsername(window.prompt('Enter your name:'));

        while (!valid[0])
            valid = Validator.validateUsername(window.prompt(valid[1] + '. Enter your name:'));

        let newUrl = '/compass/edit/' + this.props.params.code + '/' + valid[1];
        browserHistory.push(newUrl);
    }

    render() {
        return <div></div>;
    }
}

PromptName.propTypes = {
    params: PropTypes.object.isRequired
};

