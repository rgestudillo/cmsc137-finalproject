const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  cors: {
    origin: '*',  // Allow all origins
  },
});

let lobbies = {}; // Object to track lobbies

function generateLobbyId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let lobbyId = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    lobbyId += characters.charAt(randomIndex);
  }
  return lobbyId;
}

io.on('connection', (socket) => {
  console.log('player connected');
  socket.on('createLobby', () => {
    const lobbyId = generateLobbyId();
    lobbies[lobbyId] = [socket];
    socket.join(lobbyId);  // Join socket to room with lobbyId
    socket.emit('lobbyCreated', lobbyId);
    console.log(`Lobby created: ${lobbyId}`);
  });

  socket.on('joinLobby', (lobbyId) => {
    if (lobbies[lobbyId]) {
      if (lobbies[lobbyId].length < 2) {
        lobbies[lobbyId].push(socket);
        socket.join(lobbyId);  // Join socket to room with lobbyId
        socket.emit('opponentConnected');
        lobbies[lobbyId][0].emit('opponentConnected');
        console.log(`Player joined lobby ${lobbyId}`);
      } else {
        console.log('lobby is full', lobbies[lobbyId]);
        socket.emit('lobbyFull');  // Emit error if the lobby is full
      }
    } else {
      console.log('lobby not found');
      socket.emit('lobbyNotFound');  // Emit error if the lobby doesn't exist
    }
  });

  // Send list of available lobbies
  socket.on('getAvailableLobbies', () => {
    const availableLobbies = Object.keys(lobbies).filter(lobbyId => lobbies[lobbyId].length < 2);
    socket.emit('availableLobbies', availableLobbies);  // Send back the available lobbies
  });

  socket.on('startGame', (lobbyId) => {
    if (lobbies[lobbyId] && lobbies[lobbyId].length === 2) {

      io.to(lobbyId).emit('startGame');  // Emit to both players in the lobby
      console.log(`Game started in lobby ${lobbyId}`);
    }
  });

  socket.on('disconnect', () => {
    for (const lobbyId in lobbies) {
      const index = lobbies[lobbyId].indexOf(socket);
      if (index > -1) {
        lobbies[lobbyId].splice(index, 1);
        socket.leave(lobbyId);  // Leave the room
        console.log(`Player disconnected from lobby ${lobbyId}`);

        if (lobbies[lobbyId].length === 0) {
          delete lobbies[lobbyId];
          console.log(`Lobby ${lobbyId} removed as it's empty`);
        }
        break;
      }
    }
  });

  socket.on('move', ({ gameId, x, y }) => {
    console.log(`Server received move event in game ${gameId}:`, x, y);
    socket.to(`${gameId}`).emit('move', { x, y });
  });

  socket.on('moveEnd', ({ gameId }) => {
    socket.to(`${gameId}`).emit('moveEnd');  // Broadcast only within the specific game lobby
  });
});

http.listen(5001, () => {
  console.log('server listening on localhost:5001');
});
