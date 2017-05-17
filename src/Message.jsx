import React, { Component } from 'react'

export default class Message extends Component {

    shouldComponentUpdate(nextProps, nextState) {
        return false;
    }

    render() {
        return (
            <div className="message">
                <div className={this.props.type} style={{background: this.props.color}}>
                    <p>{this.props.m.text}</p>
                </div>
            </div>
        );
    }
}

