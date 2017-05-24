import { combineReducers } from 'redux';

import notes from './notes';
import compass from './compass';
import users from './users';

const rootReducer = combineReducers({
    notes,
    compass,
    users
});

export default rootReducer;

