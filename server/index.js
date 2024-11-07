const app = require('express')();

const http = require('http').Server(app);

const io = require('socket.io')(http, {
  cors: {
    origin: '*',  // This allows all origins
  },
});

io.on('connection', (socket) => {
  console.log('player connected');

  socket.on('disconnect', () => {
    console.log('player disconnected');
  });

  socket.on('move', ({ x, y }) => {
    socket.broadcast.emit('move', { x, y });
  });
  socket.on('moveEnd', () => {
    socket.broadcast.emit('moveEnd');
  });
});

http.listen(5001, () => {
  console.log('server listening on localhost:5001');
});
