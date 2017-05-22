import React, { Component } from 'react';
import { Link } from 'react-router';

export default class NotFound extends Component {
    render() {
        return (
            <div id="ic-404">
                <h1>Sorry. I don&apos;t have what you&apos;re looking for. Try going <Link to='/'>here</Link> instead.</h1>
            </div>
        );
    }
}
