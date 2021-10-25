const socketIO = require('socket.io');

const WorkspaceSocket = require('./WorkspaceSocket');

module.exports = {
  connect: (server, roomManager) => {
    const io = socketIO.listen(server);
    io.set('transports', ['websocket']);

    io.sockets.on('connection', (socket) => {
      return new WorkspaceSocket(io, socket, roomManager);
    });

    return io;
  },
};
