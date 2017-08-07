'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';

import Modal from 'Utils/Modal.jsx';
import Validator from 'Utils/Validator.jsx';

export default class PromptName extends Component {
    componentDidMount() {
        let modal = new Modal();

        modal.prompt('Enter your name:', (name) => {
            let valid = Validator.validateUsername(name);

            if (valid[0]) {
                let newUrl = '/compass/edit/' + this.props.params.code + '/' + valid[1];
                browserHistory.push(newUrl);
            } else {
                modal.alert(valid[1] + '. You will now be taken back to the login page.', () => {
                    browserHistory.push('/');
                });
            }
        });
    }

    render() {
        return <div />;
    }
}

PromptName.propTypes = {
    params: PropTypes.object.isRequired
};
