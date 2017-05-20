import React, { Component } from 'react';
import Draggable from 'react-draggable';
import { browserHistory } from 'react-router';

import DefaultCompass from '../models/defaultCompass.js';

import CompassEdit from './CompassEdit.jsx';
import Shared from './Shared.jsx';

const STEPS = [
    {
        header: 'Welcome to iCompass',
        text: 'In this short tour, we\'ll cover a few things to help you make informed decisions about this workspace',
        prep: () => $('#ic-tutorial-cover').fadeOut()
    },
    {
        header: 'Your workspace',
        text: 'This tutorial is not for the compass itself, but for this app. Feel free to drag this blurb around so you can see everything.',
        prep: () => {
            $('#ic-sidebar').css('left', '-240px');
            $('#ic-chat').css('bottom', '-265px');
        }
    },
    {
        header: 'The compass',
        text: 'This is the compass structure that you know and love. In the middle is the people group - you will be asked to fill this out when you make a compass.',
        prep: () => {
            $('#ic-tutorial-cover').fadeIn();
            $('#ic-sidebar').css({'left': '0px', 'z-index': 3});
        }
    },
    {
        header: 'The Sidebar',
        text: 'The sidebar is your best reference for everything.',
        prep: (root) => root.showOnly(0)
    },
    {
        header: 'Compass codes',
        text: 'This is how you share and FIND your compass. Scribble these down somewhere when you get them, or give me your email when you log in and I\'ll send them to you',
        prep: (root) => root.showOnly(1)
    },
    {
        header: 'Key bindings',
        text: 'Each of these keys is associated with a special action. For example, press "s" twice to toggle the sidebar',
        prep: (root) => root.showOnly(2)
    },
    {
        header: 'Active users',
        text: 'Each person in your current compass session is listed here, associated with a unique color. This is the color of stickies they make and their chat bubble',
        prep: (root) => root.showOnly(3)
    },
    {
        header: 'Connection status',
        text: 'When you disconnect from the server, the sidebar will open and you will see a red "Disconnected". If it\'s green you\'re all set',
        prep: (root) => root.showOnly(4)
    },
    {
        header: 'Reduce',
        text: 'Since I have no money, I would appreciate if you could clean up server space by deleting a compass you know you won\'t need again! You can also save a pdf or send me your complaints',
        prep: (root) => root.showOnly(5)
    },
    {
        header: 'People who made this Stuff',
        text: 'Do check us out!',
        prep: () => {
            $('#ic-sidebar').css('left', '-240px');
            $('#ic-chat').css({'bottom': '0px', 'z-index': 3});
        }
    },
    {
        header: 'Chat',
        text: 'Send messages to anyone who is online. Messages are cleared when you log out',
        prep: () => {
            $('#ic-chat').css('bottom', '-265px')
            $('#show-chat').css('z-index', 4);
            $('#show-sidebar').css('z-index', 4);
        }
    },
    {
        header: 'Buttons',
        text: 'If you forget the key bindings "s" for sidebar and "c" for chat, use these buttons to get them back',
    }
];

export default class Tutorial extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {vw: window.innerWidth, vh: window.innerHeight, i: 0};

        this.compass = DefaultCompass;
        this.compass.center = 'Your People Group';
        this.compass.editCode = '1s5a2nd0';
        this.compass.viewCode = 'd147bo5x';

        this.center = Shared.center.bind(this);
        this.next = this.next.bind(this);
    }

    componentDidMount() {
        $(window).on('resize', () => {
            this.setState({vw: window.innerWidth, vh: window.innerHeight});
        });
        this.lists = $('.ic-sidebar-list');
    }

    showOnly(x) {
        let opacity;
        for (let i=0; i<this.lists.length; i++) {
            opacity = i === x ? 1 : 0.1;
            $(this.lists[i]).fadeTo('slow', opacity);
        }
    }

    next() {
        let curr = this.state.i;
        if (curr < STEPS.length-1) {
            STEPS[curr].prep(this);
            this.setState({i: curr+1});
        } else {
            browserHistory.push('/');
        }
    }

    render() {
        return (
            <div id="ic-tutorial">
                <div className="ic-screen" id="ic-tutorial-cover"></div>
                <div className="ic-screen" id="ic-tutorial-prevent"></div>
                <Draggable>
                    <div id="ic-tutorial-text" style={this.center(300,200)}>
                        <h1>{STEPS[this.state.i].header}</h1>
                        <h3>{STEPS[this.state.i].text}</h3>
                        <button className="ic-button" onClick={this.next}>
                            {this.state.i === STEPS.length-1 ? 'finish' : 'next'}
                        </button>
                    </div>
                </Draggable>
                <CompassEdit compass={this.compass} username={'sandbox'} />
            </div>
        );
    }
}

