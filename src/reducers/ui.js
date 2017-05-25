const defaultState = {
    newNote: false,
    editNote: false,
    doodleNote: false,
    focusedNote: -1,
    compact: false,
    showAbout: false,
    showChat: true,
    showSidebar: true,
    showFeedback: false,
    vw: 0,
    vh: 0
};

export default (state = defaultState, action) => {
    switch(action.type) {
        case 'showNewNote':
            return {...state,
                editNote: false, doodleNote: false,
                newNote: true
            };
        case 'showEdit':
            return {...state,
                newNote: false, doodleNote: false,
                editNote: action.note
            };
        case 'showDoodle':
            return {...state,
                newNote: false, editNote: false,
                doodleNote: true
            };
        case 'closeForm':
            return {...state,
                newNote: false, editNote: false, doodleNote: false
            };
        case 'focusOnNote':
            return {...state, focusedNote: action.idx};
        case 'toggleCompactMode':
            return {...state, compact: !state.compact};
        case 'toggleAbout':
            return {...state, showAbout: !state.showAbout};
        case 'toggleChat':
            return {...state, showChat: !state.showChat};
        case 'toggleSidebar':
            return {...state, showSidebar: !state.showSidebar};
        case 'toggleFeedback':
            return {...state, showFeedback: !state.showFeedback};
        case 'resize':
            return {...state,
                vw: action.screenWidth,
                vh: action.screenHeight
            };
        default:
            return state;
    }
};

