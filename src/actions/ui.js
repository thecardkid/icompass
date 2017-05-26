export const showNewNote = (event) => {
    return {
        type: 'showNewNote',
        event
    };
};

export const showEdit = (note) => {
    if (note.doodle) return;
    return {
        type: 'showEdit',
        note
    };
};

export const showDoodle = () => {
    return {
        type: 'showDoodle'
    };
};

export const closeForm = () => {
    return {
        type: 'closeForm'
    };
};

export const focusOnNote = (idx) => {
    return {
        type: 'focusOnNote',
        idx
    };
};

export const toggleCompactMode = () => {
    return {
        type: 'toggleCompactMode'
    };
};

export const toggleAbout = () => {
    return {
        type: 'toggleAbout'
    };
};

export const toggleChat = () => {
    return {
        type: 'toggleChat'
    };
};

export const setChatVisible = (value) => {
    return {
        type: 'setChat',
        value
    };
};

export const toggleSidebar = () => {
    return {
        type: 'toggleSidebar'
    };
};

export const setSidebarVisible = (value) => {
    return {
        type: 'setSidebar',
        value
    };
};

export const toggleFeedback = () => {
    return {
        type: 'toggleFeedback'
    };
};

export const resize = (e) => {
    return {
        type: 'resize',
        screenWidth: e.target.innerWidth,
        screenHeight: e.target.innerHeight
    };
};

export const setScreenSize = (vw, vh) => {
    return {
        type: 'resize',
        screenWidth: vw,
        screenHeight: vh
    };
};

export const reset = () => {
    return {
        type: 'resetUI'
    };
};

