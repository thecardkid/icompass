import notes from './notes';
import compass from './compass';
import { combineReducers } from 'redux';

const rootReducer = combineReducers({
    notes,
    compass
});

export default rootReducer;

