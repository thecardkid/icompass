import { expect } from 'chai';

import RoomManager from '../../backend/lib/RoomManager';

class MockWorkspaceSocket {
  constructor(username) {
    this.username = username;
  }

  setUserColor(color) {
    this.color = color;
  }

  getUserColor() {
    return this.color;
  }
}

const roomID = '1a2b3c4d';
const TEST_WORKSPACE_SOCKET = new MockWorkspaceSocket('jerry');
let manager;

function expectJoinRoomToThrow(code) {
  const fn = manager.joinRoom.bind(manager, code, TEST_WORKSPACE_SOCKET);
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
    manager.joinRoom(roomID, TEST_WORKSPACE_SOCKET);
    const m = manager.getRoomState(roomID);
    expect(m.usernameToColor).to.have.keys(TEST_WORKSPACE_SOCKET.username);
  });

  it('joinRoom: data validation', () => {
    manager.joinRoom(roomID, TEST_WORKSPACE_SOCKET);
    expectJoinRoomToThrow(roomID, new MockWorkspaceSocket(TEST_WORKSPACE_SOCKET.username));
    expectJoinRoomToThrow(roomID, new MockWorkspaceSocket('notallchars2'));
    expectJoinRoomToThrow(roomID, new MockWorkspaceSocket(''));
  });

  it('leaveRoom', () => {
    manager.joinRoom(roomID, TEST_WORKSPACE_SOCKET);
    manager.joinRoom(roomID, new MockWorkspaceSocket('user'));
    manager.leaveRoom(roomID, 'user');
    let m = manager.getRoomState(roomID);
    expect(m.usernameToColor).to.not.have.keys('user');

    // Room state should be null after last user leaves.
    manager.leaveRoom(roomID, TEST_WORKSPACE_SOCKET.username);
    m = manager.getRoomState(roomID);
    expect(m).to.be.null;
  });
});

