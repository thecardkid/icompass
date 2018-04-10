let socketIO = require('socket.io');

const bindWorkspaceEvents = require('./WorkspaceSocket');

module.exports = {
  connect: (server) => {
    const io = socketIO.listen(server);

    io.sockets.on('connection', (socket) => {
      bindWorkspaceEvents(io, socket);
    });
  },
};
