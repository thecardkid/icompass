require('babel-polyfill');
const _ = require('underscore');

const mailer = require('./mailer').getInstance();
const { HOST, STICKY_COLORS } = require('./constants');
const { DefaultLogger, Logger } = require('./logger');
const Compass = require('../models/compass');

// TODO properly implement catch for all async event handlers.
// TODO standardize logs

// Represents a client connection to the server.
class WorkspaceSocket {
  constructor(io, socket, roomManager) {
    this.io = io;
    this.socket = socket;
    this.roomManager = roomManager;
    this.logger = DefaultLogger;

    this.socket.on('disconnect', this.onDisconnect.bind(this));
    this.socket.on('reconnected', this.onReconnect.bind(this));
    this.socket.on('logout', this.onLogout.bind(this));
    this.socket.on('send feedback', this.sendFeedback.bind(this));
    this.socket.on('send mail', this.sendMail.bind(this));
    this.socket.on('auto send mail', this.autoSendMail.bind(this));
    this.socket.on('send mail bookmarks', this.sendMailBookmarks.bind(this));

    this.socket.on('create compass', this.createCompass.bind(this));
    this.socket.on('create copy of compass', this.createCompassCopy.bind(this));
    this.socket.on('automated create compass', this.automatedCreateCompass.bind(this));
    this.socket.on('find compass edit', this.findCompassEdit.bind(this));
    this.socket.on('set center', this.setCenter.bind(this));
    this.socket.on('set center position', this.setCenterPosition.bind(this));
    this.socket.on('delete compass', this.deleteCompass.bind(this));

    this.socket.on('new note', this.createNote.bind(this));
    this.socket.on('update note', this.updateNote.bind(this));
    this.socket.on('delete note', this.deleteNote.bind(this));
    this.socket.on('+1 note', this.plusOneNote.bind(this));
    this.socket.on('bulk update notes', this.bulkUpdateNotes.bind(this));
    this.socket.on('bulk drag notes', this.bulkDragNotes.bind(this));
    this.socket.on('bulk delete notes', this.bulkDeleteNotes.bind(this));
  }

  getUserColor() {
    return this.frontendUserColor;
  }

  setUserColor(color) {
    this.frontendUserColor = color;
  }

  joinRoom({ code, username, compassId, isReconnecting }) {
    this.roomID = code;
    this.username = username;
    this.compassId = compassId;
    this.logger = new Logger(`room=${this.roomID} user=${this.username}`);

    try {
      // This is the effective call to socket-io.
      this.socket.join(this.roomID);
      // This is for reporting purposes.
      this.roomManager.joinRoom(code, this, isReconnecting);
    } catch (ex) {
      this.socket.emit(ex.message);
    }
  }

  broadcast(event, ...args) {
    this.io.sockets.in(this.roomID).emit(event, ...args);
  }

  onDisconnect(reason) {
    if (this.roomID && this.username) {
      this.roomManager.leaveRoom(this.roomID, this.username);
      this.logger.info(`disconnected reason: "${reason}"`);
      this.broadcast('user left', {
        users: this.roomManager.getRoomState(this.roomID),
      });
    }
  }

  async onReconnect({ code, compassId, username }) {
    if (!code) {
      this.socket.emit('workspace not found');
      this.logger.error('failed to reconnect: invalid code provided');
      return;
    }
    const compass = await Compass.findByEditCode(code);
    if (compass === null) {
      // workspace was probably deleted, but user hasn't navigated away from the page.
      this.socket.emit('workspace not found');
      return;
    }

    this.compass = compass;
    this.joinRoom({ code, compassId, username, isReconnecting: true });
    this.logger.info('reconnected');

    this.broadcast('user joined', {
      users: this.roomManager.getRoomState(code),
      joined: this.username,
    });
  }

  onLogout() {
    this.onDisconnect('log out');
  }

  sendFeedback({ email, note }) {
    mailer.sendMessage({
      subject: 'iCompass Feedback',
      toEmail: 'hieumaster95@gmail.com',
      text: note + `\n\nFrom: ${email || 'No email specified'}` ,
      cb: (status) => this.socket.emit('feedback status', status),
    });
  }

  sendMail(data) {
    const text = 'Access your compass via this link ' +
      `${HOST}/compass/edit/${data.editCode}/${data.username}`;

    mailer.sendMessage({
      subject: `Your iCompass workspace "${data.topic}"`,
      text,
      toEmail: data.email,
      cb: (status) => {
        this.socket.emit('mail status', status);
      }
    });
  }

  autoSendMail(data) {
    const text = `
Access your compass via this link ${HOST}/compass/edit/${data.editCode}/${data.username}.


You received this email because you asked iCompass to automatically send you the link to a workspace
whenever you create one. To stop receiving these automatic emails, please go to this link:
${HOST}/disable-auto-email.
`;

    mailer.sendMessage({
      subject: `Your iCompass workspace "${data.topic}"`,
      text,
      toEmail: data.email,
      cb: (status) => this.socket.emit('auto mail status', status),
    });
  }

  sendMailBookmarks(data) {
    let text = 'Below are your iCompass bookmarks:\n\n';

    _.each(data.bookmarks, ({ center, href }) => text += `${center}: ${HOST}${href}\n\n`);

    mailer.sendMessage({
      subject: 'Your iCompass bookmarks',
      text,
      toEmail: data.email,
      cb: (status) => this.socket.emit('mail status', status),
    });
  }

  // TODO make this an API call.
  async createCompass(data) {
    try {
      const compass = await Compass.makeCompass(data.topic);
      this.logger.info('Created compass with topic', data.topic, compass._id);
      this.socket.emit('compass ready', {
        success: !!compass,
        topic: data.topic,
        code: compass.editCode,
      });
    } catch (ex) {
      this.logger.error('Error creating compass: ', JSON.stringify(data), ex);
    }
  }

  async createCompassCopy(data) {
    try {
      const compass = await Compass.findByEditCode(data.originalWorkspaceEditCode);
      const copy = await Compass.makeCompassCopy(compass);
      this.socket.emit('copy of compass ready', {
        success: !!copy,
        editCode: copy.editCode,
      });
    } catch (ex) {
      this.logger.error('Error creating copy of compass: ', JSON.stringify(data), ex);
    }
  }

  async automatedCreateCompass(data) {
    // Copy-pasted from above
    try {
      const compass = await Compass.makeCompass(data.topic);
      this.logger.debug('Automation created compass with topic', data.topic, compass._id);
      this.socket.emit('automated compass ready', {
        success: !!compass,
        topic: data.topic,
        code: compass.editCode,
      });
    } catch (ex) {
      this.logger.error('Error automate creating compass: ', JSON.stringify(data), ex);
    }
  }

  async setCenter(data) {
    try {
      this.compass = await this.compass.setCenter(data.center);
      if (!!this.compass) {
        this.socket.emit('center set', data.center);
      }
    } catch (ex) {
      this.logger.error('Error setting center: ', JSON.stringify(data), ex);
    }
  }

  async setCenterPosition({ x, y }) {
    try {
      this.compass = await this.compass.setCenterPosition(x, y);
      if (!!this.compass) {
        this.broadcast('center position set', x, y);
      }
    } catch (ex) {
      this.logger.error(ex);
    }
  }

  async findCompassEdit({ code, username }) {
    try {
      const compass = await Compass.findByEditCode(code);
      if (compass !== null) {
        this.joinRoom({ code, username, isReconnecting: false });
        this.logger.info('joined room');
        this.broadcast('user joined', {
          users: this.roomManager.getRoomState(code),
          joined: this.username,
        });
      }
      this.compass = compass;
      this.socket.emit('compass found', {
        compass: compass,
        username: this.username,
        viewOnly: false,
      });
    } catch (ex) {
      this.logger.error(`Error find compass edit: code=${code} username=${username}`, ex);
    }
  }

  // TODO make API request
  deleteCompass(id) {
    const expectedID = this.compass._id.toString();
    if (expectedID !== id) {
      this.logger.warn(`Attempted to delete compass id=${id}, but socket's compass id is ${expectedID}`);
      return;
    }

    Compass.remove({ _id: id }, (err) => {
      if (err) {
        this.logger.error(`Error deleting compass id=${id}:`, err);
      }

      this.logger.info(`Deleted compass id=${id}`);
      this.broadcast('compass deleted');
    });
  }

  async createNote(note) {
    try {
      this.compass = await this.compass.addNote(note);
      this.broadcast('update notes', this.compass.notes);
    } catch (ex) {
      this.logger.error('Error creating note: ', JSON.stringify(note), ex);
    }
  }

  async updateNote(updatedNote) {
    try {
      this.compass = await this.compass.updateNote(updatedNote);
      this.broadcast('update notes', this.compass.notes);
    } catch (ex) {
      this.logger.error('Error updating note: ', JSON.stringify(updatedNote), ex);
    }
  }

  async deleteNote(id) {
    try {
      const { compass, deletedIdx } = await this.compass.deleteNote(id);
      this.compass = compass;
      this.broadcast('update notes', compass.notes);
      this.broadcast('deleted notes', deletedIdx);
    } catch (ex) {
      this.logger.error('Error deleting note: ', id, ex);
    }
  }

  async plusOneNote(id) {
    try {
      this.compass = await this.compass.plusOneNote(id);
      this.broadcast('update notes', this.compass.notes);
    } catch (ex) {
      this.logger.error('Error upvoting note: ', id, ex);
    }
  }

  async bulkUpdateNotes(ids, transformation) {
    try {
      if (transformation.color == null) return;

      if (!_.contains(STICKY_COLORS, transformation.color)) return;

      this.compass = await this.compass.bulkUpdateNotes(ids, transformation);
      this.broadcast('update notes', this.compass.notes);
    } catch (ex) {
      this.logger.error('Error bulk updating notes: ', JSON.stringify({ ids, transformation }), ex);
    }
  }

  async bulkDragNotes(ids, { dx, dy }) {
    try {
      this.compass = await this.compass.bulkDragNotes(ids, { dx, dy });
      this.broadcast('update notes', this.compass.notes);
    } catch (ex) {
      this.logger.error('Error bulk dragging notes: ', JSON.stringify({ ids, dx, dy }), ex);
    }
  }

  async bulkDeleteNotes(ids) {
    try {
      const { compass, deletedIdx } = await this.compass.deleteNotes(ids);
      this.compass = compass;
      this.broadcast('update notes', this.compass.notes);
      this.broadcast('deleted notes', deletedIdx);
    } catch (ex) {
      this.logger.error('Error bulk deleting notes: ', ids, ex);
    }
  }
}

module.exports = WorkspaceSocket;
