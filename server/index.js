const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  cors: {
    origin: '*',  // Allow all origins
  },
});

let lobbies = {}; // Object to track lobbies

// Function to generate a random 6-character string
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
    const lobbyId = generateLobbyId(); // Generate a random 6-character lobby ID
    lobbies[lobbyId] = [socket]; // Create a new lobby with the current player as the host
    socket.emit('lobbyCreated', lobbyId); // Send the lobby ID back to the host
    console.log(`Lobby created: ${lobbyId}`);
  });

  socket.on('joinLobby', (lobbyId) => {
    if (lobbies[lobbyId] && lobbies[lobbyId].length < 2) {
      lobbies[lobbyId].push(socket); // Add the player to the lobby
      socket.emit('opponentConnected'); // Notify the joining player
      lobbies[lobbyId][0].emit('opponentConnected'); // Notify the host
      console.log(`Player joined lobby ${lobbyId}`);
    } else {
      socket.emit('lobbyFull'); // Notify player if lobby is full
    }
  });

  // Send list of available lobbies
  socket.on('getAvailableLobbies', () => {
    const availableLobbies = Object.keys(lobbies).filter(lobbyId => lobbies[lobbyId].length < 2);
    socket.emit('availableLobbies', availableLobbies);  // Send back the available lobbies
  });

  socket.on('startGame', (lobbyId) => {
    // Emit the 'startGame' event to both players in the lobby
    if (lobbies[lobbyId] && lobbies[lobbyId].length === 2) {
      lobbies[lobbyId].forEach(playerSocket => {
        playerSocket.emit('startGame'); // Notify both players to start the game
      });
      console.log(`Game started in lobby ${lobbyId}`);
    }
  });

  socket.on('disconnect', () => {
    // Remove player from lobby
    for (const lobbyId in lobbies) {
      const index = lobbies[lobbyId].indexOf(socket);
      if (index > -1) {
        lobbies[lobbyId].splice(index, 1);
        console.log(`Player disconnected from lobby ${lobbyId}`);

        // If both players disconnected, delete the lobby
        if (lobbies[lobbyId].length === 0) {
          delete lobbies[lobbyId]; // Remove empty lobby
          console.log(`Lobby ${lobbyId} removed as it's empty`);
        }
        break; // Break once the player is found and removed
      }
    }
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
