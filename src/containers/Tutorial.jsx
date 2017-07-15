'use strict';

import React, { Component } from 'react';
import Draggable from 'react-draggable';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'underscore';

import * as noteActions from 'Actions/notes';
import * as compassActions from 'Actions/compass';
import * as userActions from 'Actions/users';
import * as uiActions from 'Actions/ui';

import Compass from 'Components/Compass.jsx';
import Sidebar from 'Components/Sidebar.jsx';
import Chat from 'Components/Chat.jsx';
import NoteForm from 'Components/NoteForm.jsx';
import DoodleForm from 'Components/DoodleForm.jsx';

import DefaultCompass from 'Models/defaultCompass';

const FOCUSED = 1, UNFOCUSED = 0.1;
const USERS = {usernameToColor: {'sandbox': '#CCFFFF'}, colors: []};
const STEPS = [
    {
        header: 'Welcome to iCompass',
        text: 'Here\'s a short tour, to help you drive this workspace. Feel free to drag this blurb around so you can see everything.',
        prep: () => {
            $('#ic-tutorial-cover').fadeOut();
            $('#ic-sidebar').css('left', '-240px');
            $('#ic-chat').css('bottom', '-265px');
        }
    },
    {
        header: 'The Compass workspace',
        text: 'This is your Innovators\' Compass workspace. You will be asked to fill out the center when you create a Compass.',
        prep: () => {
            $('#ic-tutorial-cover').fadeIn();
            $('#ic-sidebar').css({'left': '0px', 'z-index': 4});
        }
    },
    {
        header: 'The Sidebar',
        text: 'The sidebar is your best reference for everything.',
        prep: (root) => root.showOnly(0, [0, 3])
    },
    {
        header: 'Saving your Compass',
        text: 'Bookmark workspaces for faster access when you log in, or save as a PDF.',
        prep: (root) => root.showOnly(0, [1, 2, 4])
    },
    {
        header: 'Sharing your compass',
        text: 'Share links with editing or view-only access, or tweet the view-only link with the hashtag #innovatorscompass.',
        prep: (root) => root.showOnly(1)
    },
    {
        header: 'Control keys',
        text: 'Each of these buttons also has a shortcut key on a computer.',
        prep: (root) => root.showOnly(1, [0])
    },
    {
        header: 'Creating text notes',
        text: 'Double click on any blank space to spawn a new text note there. On handheld devices, use a long click. Or, press "n" to bring up a new note form. You can put up to 300 characters in a text note.',
        prep: () => {}
    },
    {
        header: 'Creating photo notes',
        text: 'If you enter a photo\'s hyperlink in a text note, I can import that image for you.',
        prep: (root) => root.showOnly(1, [1])
    },
    {
        header: 'Creating sketched notes',
        text: 'Press this button or “d” to make a doodle note you can sketch on. (Note: if you have many doodles, your Compass may respond more slowly.)',
        prep: () => {}
    },
    {
        header: 'Working with notes',
        text: 'Click once on a note to bring it to the front, twice to edit its contents. Click and drag notes to move them.',
        prep: (root) => root.showOnly(1, [2])
    },
    {
        header: 'Compact mode',
        text: 'When things get crowded, try compact mode. You can see four lines of note text and scroll for more. Doodles are shown smaller. (Note: compact mode only applies to your own view; check that others see it the same way before moving notes.)',
        prep: (root) => root.showOnly(1, [3, 4])
    },
    {
        header: 'Toggling the sidebar or chat',
        text: 'Press “s” or “c” to show/hide the sidebar or chat. Or, click the “X” at the top right of the box to hide. On handheld devices you can also swipe left from the sidebar, or down from the chat box, to hide them.',
        prep: (root) => root.showOnly(1, [5])
    },
    {
        header: 'Compass prompts',
        text: 'Press this button or “p” to show/hide more detailed prompts for the Innovators’ Compass.',
        prep: (root) => root.showOnly(2)
    },
    {
        header: 'Active users',
        text: 'Each person in your current Compass session is listed here, associated with a unique color. This is the color of stickies they make and their chat bubble.',
        prep: (root) => root.showOnly(3)
    },
    {
        header: 'Connection status',
        text: 'When you disconnect from the server, the sidebar will open and you will see a red "Disconnected". If it\'s green you\'re all set.',
        prep: (root) => root.showOnly(4)
    },
    {
        header: 'More actions',
        text: 'You can see this tutorial anytime. And, send us app bugs or ideas. I would appreciate if you could save server space by deleting a compass you know you won\'t need again!',
        prep: (root) => root.showOnly(5)
    },
    {
        header: 'People who made this Stuff.',
        text: 'Do check us out!',
        prep: () => {
            $('#ic-sidebar').css('left', '-240px');
            $('#ic-chat').css({'bottom': '0px', 'z-index': 4});
        }
    },
    {
        header: 'Chat',
        text: 'Send messages to current collaborators. Messages are cleared when you log out. Swipe down to hide the chat on handheld devices.',
        prep: () => {
            $('#ic-chat').css('bottom', '-265px');
            $('#ic-show-chat').css('z-index', 4);
            $('#ic-show-sidebar').css('z-index', 4);
            $('#ic-compact').css('z-index', 4);
        }
    },
    {
        header: 'Workspace buttons',
        text: 'A few buttons are on your workspace for convenience. You can show the hidden sidebar or chat box, toggle compact mode, or make a new doodle.',
        prep: () => {
            $('#ic-show-chat').css('z-index', 2);
            $('#ic-show-sidebar').css('z-index', 2);
            $('#ic-compact').css('z-index', 2);
        }
    },
    {
        header: 'That\'s it!',
        text: 'You\'re ready to try out the real thing :)'
    }
];

class Tutorial extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {i: 0};

        this.compass = Object.assign({}, DefaultCompass, {
            center: 'The People involved',
            editCode: '1s5a2nd0',
            viewCode: 'd147bo5x'
        });

        this.center = this.center.bind(this);
        this.next = this.next.bind(this);

        this.props.uiActions.setScreenSize(window.innerWidth, window.innerHeight);
        this.props.compassActions.set(this.compass, false);
        this.props.userActions.update({users: USERS});
        this.props.userActions.me('sandbox');
    }

    componentDidMount() {
        $(window).on('resize', this.props.uiActions.resize);
    }

    componentWillUnmount() {
        $(window).off('resize', this.props.uiActions.resize);
    }

    getForm() {
        if (this.props.ui.newNote) {
            return <NoteForm style={this.center(300,230)}
                title={'Make a new post-it'}
                bg={'#CCFFFF'}
                note={{}}
            />;
        } else if (this.props.ui.doodleNote) {
            return <DoodleForm style={this.center(450, 345)}
                bg={'#CCFFFF'}
            />;
        }
    }

    showOnly(x, buttons) {
        let lists = $('.ic-sidebar-list');
        let showSome = buttons && buttons.length > 0;

        for (let i=0; i<lists.length; i++) {
            if (i === x) {
                $(lists[i]).fadeTo('slow', FOCUSED);

                if (showSome) {
                    let btns = $(lists[i]).children().slice(1);
                    for (let j=0; j<btns.length; j++) {
                        let o = _.contains(buttons, j) ? FOCUSED : UNFOCUSED;
                        $(btns[j]).fadeTo('slow', o);
                    }
                }
            } else {
                $(lists[i]).fadeTo('slow', UNFOCUSED);
            }
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

    center(w, h) {
        return {
            top: Math.max((this.props.ui.vh - h) / 2, 0),
            left: Math.max((this.props.ui.vw - w) / 2, 0)
        };
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
                        <button name="next-step" className="ic-button" onClick={this.next}>
                            {this.state.i === STEPS.length-1 ? 'finish' : 'next'}
                        </button>
                    </div>
                </Draggable>
                <button className="ic-corner-btn" id="ic-compact">Compact</button>
                <button className="ic-corner-btn" id="ic-show-sidebar">Show Sidebar</button>
                <button className="ic-corner-btn" id="ic-show-chat">Show Chat</button>
                <div id="circle"></div>
                <Compass />
                <Sidebar connected={true} />
                <Chat />
                {this.getForm()}
            </div>
        );
    }
}

Tutorial.propTypes = {
    ui: PropTypes.object.isRequired,
    uiActions: PropTypes.objectOf(PropTypes.func).isRequired,
    noteActions: PropTypes.objectOf(PropTypes.func).isRequired,
    compassActions: PropTypes.objectOf(PropTypes.func).isRequired,
    userActions: PropTypes.objectOf(PropTypes.func).isRequired
};

function mapStateToProps(state) {
    return {
        ui: state.ui
    };
}

function mapDispatchToProps(dispatch) {
    return {
        noteActions: bindActionCreators(noteActions, dispatch),
        compassActions: bindActionCreators(compassActions, dispatch),
        userActions: bindActionCreators(userActions, dispatch),
        uiActions: bindActionCreators(uiActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Tutorial);

