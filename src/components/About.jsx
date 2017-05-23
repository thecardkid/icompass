'use strict';

import React, { Component } from 'react';
import { Link } from 'react-router';
import PropTypes from 'prop-types';

export default class Explanation extends Component {

    shouldComponentUpdate() {
        return false;
    }

    render() {
        return (
            <div id="ic-about">
                <button className="ic-close-window" onClick={this.props.close}>x</button>
                <div id="text">
                    <h1>Innovators&apos; Compass</h1>
                    <p>
                        Starting something or feeling stuck? Use four questions, asked by all kinds of innovators, to navigate everyday challenges in new ways.
                    </p>
                    <p>
                        In the center include <span>PEOPLE</span> who could be involved (including you). With them whenever possible, use these spaces to explore your:
                    </p>
                    <p>
                        <span>    OBSERVATIONS: What&apos;s happening? Why?</span> What are/were people doing? Saying? Thinking? Feeling? Why? Notice the full range without judging.
                    </p>
                    <p>
                        <span>    PRINCIPLES: What matters most</span> for things to work, now and in whatever happens? Why? Competing principles are natural and drive creative ideas.
                    </p>
                    <p>
                        <span>    IDEAS: What could happen?</span> Freely imagine possibilities before judging or detailing them. Anyone and anything can help. Look for inspiring examples.
                    </p>
                    <p>
                        <span>    EXPERIMENTS: What&apos;s a way to try</span> an idea, answering any questions about it? With the least time/risk/cost? <span>Do it</span>. Note new <span>OBSERVATIONS</span>. What&apos;s surprising?
                    </p>
                    <p>
                        Go around, or wherever you need more to move forward, until you find your way.
                    </p>
                    <p>
                        Ask more deeply, in new ways. Look, listen, feel; use words, draw, move, make.
                    </p>
                    <p>
                        Explore anything on your mind or to-do list. Do it alone or with others. On paper, tablet or in your head. You&pos;ll see more and more ways to navigate new challenges.
                    </p>
                    <p id="footnote">
                        More at <Link target="_blank" to="http://innovatorscompass.org" rel="noopener noreferrer"><span>innovatorscompass.org</span></Link>
                    </p>
                </div>
            </div>
        );
    }
}

Explanation.propTypes = {
    close: PropTypes.func.isRequired
};

