let socketIO = require('socket.io');

const bindWorkspaceEvents = require('./socket-workspace');

module.exports = {
  connect: (server) => {
    const io = socketIO.listen(server);

    io.sockets.on('connection', (socket) => {
      bindWorkspaceEvents(io, socket);
    });
  },
};
