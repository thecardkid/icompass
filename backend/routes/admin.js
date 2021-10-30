require('babel-polyfill');
const router = require('express').Router();

router.get('/get_rooms', async (req, res) => {
  const out = {};
  for (const roomID of Object.keys(req.roomManager.roomByID)) {
    const room = req.roomManager.roomByID[roomID];
    out[roomID] = Object.values(room.clientsByUsername).map(x => ({
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
