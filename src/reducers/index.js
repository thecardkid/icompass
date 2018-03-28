import { combineReducers } from 'redux';

import chat from './chat';
import compass from './compass';
import notes from './notes';
import ui from './ui';
import users from './users';
import workspace from './workspace';

const rootReducer = combineReducers({
  notes,
  compass,
  users,
  chat,
  ui,
  workspace,
});

export default rootReducer;

