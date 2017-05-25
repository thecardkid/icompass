import { combineReducers } from 'redux';

import notes from './notes';
import compass from './compass';
import users from './users';
import chat from './chat';
import ui from './ui';

const rootReducer = combineReducers({
    notes,
    compass,
    users,
    chat,
    ui
});

export default rootReducer;

