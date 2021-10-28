require('babel-polyfill');
const router = require('express').Router();

router.get('/get_rooms', async (req, res) => {
  const out = {};
  for (const roomID of Object.keys(req.roomManager.clientsByUsernameByRoomID)) {
    const clients = Object.values(req.roomManager.clientsByUsernameByRoomID[roomID]);
    out[roomID] = clients.map(x => ({
      socketID: x.socket.id,
      userAgent: x.socket.handshake.headers['user-agent'],
      issuedAt: x.socket.handshake.issued,
      username: x.username,
    }));
  }
  return res.send({
    clientsByRoomID: out,
  });
});

module.exports = router;
