let socketIO = require('socket.io');

const bindWorkspaceEvents = require('./WorkspaceSocket');
const bindMetricsEvents = require('./MetricsSocket');

module.exports = {
  connect: (server) => {
    const io = socketIO.listen(server);

    io.sockets.on('connection', (socket) => {
      bindWorkspaceEvents(io, socket);
      bindMetricsEvents(io, socket);
    });
  },
};
