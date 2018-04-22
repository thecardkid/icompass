let UserManager = require('./UserManager');
let MailerSingleton = require('./Mailer');
let { HOST } = require('./constants');
const Compass = require('../models/compass');
let logger = require('./logger');

let Manager = new UserManager();
let Mail = MailerSingleton.getInstance();

class WorkspaceSocket {
  constructor(session) {
    this.io = session.getIo();
    this.socket = session.getSocket();
    this.session = session;

    this.socket.on('disconnect', this.onDisconnect.bind(this));
    this.socket.on('reconnected', this.onReconnect.bind(this));
    this.socket.on('logout', this.onLogout.bind(this));
    this.socket.on('send mail', this.sendMail.bind(this));

    this.socket.on('create compass', this.createCompass.bind(this));
    this.socket.on('find compass', this.findCompass.bind(this));
    this.socket.on('find compass edit', this.findCompassEdit.bind(this));
    this.socket.on('find compass view', this.findCompassView.bind(this));
    this.socket.on('set center', this.setCenter.bind(this));
    this.socket.on('delete compass', this.deleteCompass.bind(this));

    this.socket.on('new note', this.createNote.bind(this));
    this.socket.on('update note', this.updateNote.bind(this));
    this.socket.on('delete note', this.deleteNote.bind(this));
    this.socket.on('bulk update notes', this.bulkUpdateNotes.bind(this));
    this.socket.on('bulk delete notes', this.bulkDeleteNotes.bind(this));
  }

  joinRoom(data) {
    this.room = data.code;
    this.username = data.username;
    this.compassId = data.compassId;
    this.socket.join(this.room);
  }

  broadcast(event, ...args) {
    this.io.sockets.in(this.room).emit(event, ...args);
  }

  onDisconnect(reason) {
    if (this.username) {
      logger.info(`${this.username} left room ${this.room} because "${reason}"`);
      let m = Manager.removeUser(this.room, this.username);
      this.broadcast('user left', { users: m, left: this.username });
    }
  }

  onReconnect(data) {
    if (data.sessionId) {
      this.session.restoreSessionId(data.sessionId);
    } else {
      this.session.newSessionId();
    }
    this.joinRoom(data);
    logger.info(this.username, 'rejoined room', this.room);

    let o = Manager.addUser(this.room, this.username, data.color);
    this.broadcast('user joined', { users: o.manager, joined: this.username });
  }

  onLogout() {
    this.onDisconnect('log out');
  }

  logMetric(stmt) {
    const sessionId = this.session.getSessionId() || 'unknown';
    logger.metric(`Session ${sessionId} - ${stmt}`);
  }

  sendMail(data) {
    const text = 'Access your compass via this link ' +
      `${HOST}compass/edit/${data.editCode}/${data.username}`;

    Mail.sendMessage(text, data.email, (status) => {
      this.logMetric('Sent email reminder');
      this.socket.emit('mail status', status);
    });
  }

  createCompass(data) {
    Compass.makeCompass(data.topic, (compass) => {
      logger.debug('Created compass with topic', data.topic, compass._id);
      this.socket.emit('compass ready', {
        success: !!compass,
        topic: data.topic,
        code: compass.editCode,
      });
    });
  }

  setCenter(data) {
    Compass.setCenter(data.id, data.center, (compass) => {
      logger.debug(`Set center to ${data.center} for compass ${data.id}`);
      if (!!compass) {
        this.socket.emit('center set', data.center);
      }
    });
  }

  findCompass(data) {
    Compass.findCode(data.code,(compass, viewOnly) => {
      this.socket.emit('compass ready', {
        success: !!compass,
        code: data.code,
        viewOnly: viewOnly,
      });
    });
  }

  findCompassEdit(data) {
    Compass.findByEditCode(data.code, (compass) => {
      if (compass !== null) {
        logger.debug('Found compass for editing', compass._id);
        let o = Manager.addUser(data.code, data.username);
        data.username = o.newUser;
        data.compassId = compass._id.toString();
        this.joinRoom(data);
        logger.info(this.username, 'joined room', this.room);
        this.broadcast('user joined', { users: o.manager, joined: this.username });
      }

      this.socket.emit('compass found', {
        compass: compass,
        username: this.username || data.username,
        viewOnly: false,
      });
    });
  }

  findCompassView(data) {
    Compass.findByViewCode(data.code, (compass) => {
      if (compass !== null) logger.info('request to view compass successful', compass._id);
      this.socket.emit('compass found', {
        compass: compass,
        username: data.username,
        viewOnly: true,
      });
    });
  }

  deleteCompass(id) {
    if (this.compassId !== id) return;

    Compass.remove({ _id: id }, (err) => {
      if (err) return logger.error(err);

      logger.info(this.username, 'deleted compass', id);
      this.broadcast('compass deleted');
    });
  }

  createNote(note) {
    Compass.addNote(this.compassId, note, (compass) => {
      const id = compass.notes.slice(-1).pop()._id;
      logger.info(this.username, 'created a note', id, 'in compass', this.compassId);
      this.broadcast('update notes', compass.notes);
    });
  }

  updateNote(updatedNote) {
    Compass.updateNote(this.compassId, updatedNote, (c) => {
      logger.info(this.username, 'updated a note', updatedNote._id, 'in compass', this.compassId);
      this.broadcast('update notes', c.notes);
    });
  }

  deleteNote(id) {
    Compass.deleteNote(this.compassId, id, (notes, deletedIdx) => {
      logger.info(this.username, 'deleted note', id, 'in compass', this.compassId);
      this.broadcast('update notes', notes);
      this.broadcast('deleted notes', deletedIdx);
    });
  }

  bulkUpdateNotes(ids, transformation) {
    Compass.bulkUpdateNotes(this.compassId, ids, transformation, (c) => {
      logger.info(this.username, 'bulk edited notes', ids, 'in compass', this.compassId);
      this.broadcast('update notes', c.notes);
    });
  }

  bulkDeleteNotes(ids) {
    Compass.deleteNotes(this.compassId, ids, (notes, deletedIdx) => {
      logger.info(this.username, 'deleted notes', ids, 'in compass', this.compassId);
      this.broadcast('update notes', notes);
      this.broadcast('deleted notes', deletedIdx);
    });
  }
}

const bindWorkspaceEvents = (io, socket) => {
  return new WorkspaceSocket(io, socket);
};

module.exports = bindWorkspaceEvents;
