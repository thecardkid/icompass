'use strict';

import React, { Component } from 'react';
import Draggable from 'react-draggable';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

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
import { MODES, KEYCODES } from 'Lib/constants';

const USERS = {usernameToColor: {'sandbox': '#CCFFFF'}, colors: []};
const STEPS = [
    {
        header: 'Welcome to iCompass',
        text: 'In this short tour, we\'ll cover a few things to help you make informed decisions about this workspace.',
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
        text: 'This is the compass structure that you know and love. You will be asked to fill out the center when you create a new compass.',
        prep: () => {
            $('#ic-tutorial-cover').fadeIn();
            $('#ic-sidebar').css({'left': '0px', 'z-index': 4});
        }
    },
    {
        header: 'The Sidebar',
        text: 'The sidebar is your best reference for everything.',
        prep: (root) => root.showOnly(0)
    },
    {
        header: 'Sharing your compass',
        text: 'Share with editing or view-only access, or export it to a pdf, or tweet the view-only link with the hashtag #innovatorscompass.',
        prep: (root) => {
            root.showOnly(1);
            $(window).on('keydown', (e) => {
                if (e.which === KEYCODES.S) root.props.uiActions.toggleSidebar();
            });
        }
    },
    {
        header: 'Key bindings',
        text: 'Each of these keys is associated with a special action. For example, press "s" twice to toggle the sidebar. On handheld devices, swipe left on the sidebar.',
        prep: () => {
            let t = 800;
            $('#circle').css({
                position:'absolute',
                left:'30vw',
                top:'40vh',
                width:'20px',
                height:'20px',
                background:'black',
                'border-radius':'100%',
            }).fadeOut(t).fadeIn(t).fadeOut(t).fadeIn(t);
        }
    },
    {
        header: 'Creating notes',
        text: 'Double click anywhere on a blank space to spawn a new note there. On handheld devices: long click.',
        prep: (root) => {
            $('#ic-tutorial-cover').fadeOut();
            $('#circle').hide();
            $(window).on('keydown', (e) => {
                if (e.which === KEYCODES.N) {
                    e.preventDefault();
                    root.props.uiActions.showNewNote();
                }
            });
        }
    },
    {
        header: 'New note key',
        text: 'Press "n" to bring up the new note form. You can put up to 300 characters in a note. Drag this blurb to see the from.',
        prep: () => $('#ic-form-text').val('https://s-media-cache-ak0.pinimg.com/736x/73/de/32/73de32f9e5a0db66ec7805bb7cb3f807.jpg')
    },
    {
        header: 'Linking images',
        text: 'If you enter a hyperlink, I can import that image for you.',
        prep: () => $('button[name=nvm]').click()
    },
    {
        header: 'Working with notes',
        text: 'Click once to bring a sticky to the foreground, twice to edit its contents. Stickies are draggable by default. On handheld devices: tap and long click.',
        prep: (root) => {
            $(window).on('keydown', (e) => {
                if (e.which === KEYCODES.D) root.props.uiActions.showDoodle();
            });
        }
    },
    {
        header: 'Doodling',
        text: 'Press "d" to make a doodle, if you\'re more visual. The more doodles in a compass, the more lag there might be, though.',
        prep: (root) => {
            $('#ic-tutorial-cover').fadeIn();
            root.props.uiActions.closeForm();
            root.showOnly(2);
        }
    },
    {
        header: 'Active users',
        text: 'Each person in your current compass session is listed here, associated with a unique color. This is the color of stickies they make and their chat bubble.',
        prep: (root) => root.showOnly(3)
    },
    {
        header: 'Connection status',
        text: 'When you disconnect from the server, the sidebar will open and you will see a red "Disconnected". If it\'s green you\'re all set.',
        prep: (root) => root.showOnly(4)
    },
    {
        header: 'Reduce',
        text: 'I would appreciate if you could clean up server space by deleting a compass you know you won\'t need again!',
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
        text: 'Send messages to anyone who is online. Messages are cleared when you log out. Swipe down to hide the chat on handheld devices.',
        prep: () => {
            $('#ic-chat').css('bottom', '-265px');
            $('#ic-show-chat').css('z-index', 4);
            $('#ic-show-sidebar').css('z-index', 4);
        }
    },
    {
        header: 'Buttons',
        text: 'If you forget the key bindings "s" for sidebar and "c" for chat, use these buttons to get them back.',
        prep: () => {
            $('#ic-show-chat').css('z-index', 2);
            $('#ic-show-sidebar').css('z-index', 2);
            $('#ic-compact').css('z-index', 4);
        }
    },
    {
        header: 'Compact mode',
        text: 'When things get crowded, use compact mode in the top right corner to give yourself more space. Compact mode only applies to your view, so be careful to not disturb others\' views when you rearrange notes.',
        prep: () => $('#ic-compact').css('z-index', 2)
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
        this.props.compassActions.set(this.compass, MODES.EDIT);
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

    showOnly(x) {
        let opacity;
        let lists = $('.ic-sidebar-list');
        for (let i=0; i<lists.length; i++) {
            opacity = i === x ? 1 : 0.1;
            $(lists[i]).fadeTo('slow', opacity);
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

