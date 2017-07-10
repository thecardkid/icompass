import { combineReducers } from 'redux';

import notes from './notes';
import compass from './compass';
import users from './users';
import chat from './chat';
import ui from './ui';
import workspace from './workspace';

const rootReducer = combineReducers({
    notes,
    compass,
    users,
    chat,
    ui,
    workspace
});

export default rootReducer;

