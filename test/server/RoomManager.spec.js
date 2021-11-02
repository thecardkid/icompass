import { expect } from 'chai';

import RoomManager from '../../backend/lib/RoomManager';

const roomID = '1a2b3c4d';
const TEST_WORKSPACE_SOCKET = {};
const username = 'jerry';
let manager;

function expectJoinRoomToThrow(code, username) {
  const fn = manager.joinRoom.bind(manager, code, username, TEST_WORKSPACE_SOCKET);
  expect(fn).to.throw();
}

describe('user manager', () => {

  beforeEach(() => {
    manager = new RoomManager();
  });

  afterEach(() => {
    manager = null;
  });

  it('getRoomState', () => {
    const m = manager.getRoomState(roomID);
    expect(m).to.be.null;
  });

  it('joinRoom', () => {
    manager.joinRoom(roomID, username, TEST_WORKSPACE_SOCKET);
    const m = manager.getRoomState(roomID);
    expect(m.usernames).to.have.members([username]);
  });

  it('joinRoom: data validation', () => {
    manager.joinRoom(roomID, username, TEST_WORKSPACE_SOCKET);
    expectJoinRoomToThrow(roomID, username, {});
    expectJoinRoomToThrow(roomID, 'notallchars2', {});
    expectJoinRoomToThrow(roomID, '', {});
  });

  it('leaveRoom', () => {
    manager.joinRoom(roomID, username, TEST_WORKSPACE_SOCKET);
    manager.joinRoom(roomID, 'user', {});
    manager.leaveRoom(roomID, 'user');
    let m = manager.getRoomState(roomID);
    expect(m.usernames).to.not.have.members(['user']);

    // Room state should be null after last user leaves.
    manager.leaveRoom(roomID, username);
    m = manager.getRoomState(roomID);
    expect(m).to.be.null;
  });
});

