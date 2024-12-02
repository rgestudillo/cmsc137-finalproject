const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: '*',  // Allow all origins
    },
});
const os = require('os');

// Import the Lobby class
const Lobby = require('./models/Lobby');

let lobbies = {};  // Object to track active lobbies

// Function to generate a unique lobby ID
function generateLobbyId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let lobbyId = '';
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        lobbyId += characters.charAt(randomIndex);
    }
    return lobbyId;
}

// Function to get the local IP address
function getLocalIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// Use the PORT from the environment variables or fallback to 5001
const port = process.env.PORT || 5001;

io.on('connection', (socket) => {
    console.log('player connected');

    socket.on("ping", (callback) => {
        callback();
    });

    // Create a new lobby
    socket.on('createLobby', () => {
        const lobbyId = generateLobbyId();
        const lobby = new Lobby(lobbyId, socket); // Create a new lobby instance

        lobbies[lobbyId] = lobby;  // Save the lobby in the lobbies object
        socket.join(lobbyId);       // Join the player to the lobby room
        socket.emit('lobbyCreated', lobbyId);  // Emit the lobby ID to the player
        console.log(`Lobby created: ${lobbyId}`);
    });

    // Join an existing lobby
    socket.on('joinLobby', (lobbyId) => {
        const lobby = lobbies[lobbyId];

        if (lobby) {
            if (lobby.addPlayer(socket)) {
                socket.join(lobbyId);  // Join the player to the lobby room
                socket.emit('opponentConnected');  // Notify the player they are connected
                lobby.players[0].emit('opponentConnected');  // Notify the other player
                console.log(`Player joined lobby ${lobbyId}`);
            } else {
                console.log('lobby is full');
                socket.emit('lobbyFull');  // Notify the player that the lobby is full
            }
        } else {
            console.log('lobby not found');
            socket.emit('lobbyNotFound');  // Emit error if the lobby doesn't exist
        }
    });

    // Send list of available lobbies with detailed info
    socket.on('getAvailableLobbies', () => {
        const availableLobbies = Object.keys(lobbies)
            .filter(lobbyId => lobbies[lobbyId].isAvailable())  // Check if the lobby is available
            .map(lobbyId => {
                const lobby = lobbies[lobbyId];
                return {
                    lobbyId: lobby.lobbyId,
                    players: lobby.players.length, // Number of players in the lobby
                    gameStarted: lobby.gameStarted,
                    lobbyCreated: lobby.lobbyCreated, // Lobby creation timestamp
                };
            });

        socket.emit('availableLobbies', availableLobbies);  // Send back the detailed lobby info
    });


    // Start the game in a lobby
    socket.on('startGame', (lobbyId) => {
        const lobby = lobbies[lobbyId];
        if (lobby && lobby.players.length === 2) {
            const roles = lobby.startGame();
            if (roles) {
                console.log(`Game started in lobby ${lobbyId} with roles: Player 1 - ${roles.player1Role}, Player 2 - ${roles.player2Role}`);
            }
        }
    });

    // Handle player disconnect
    socket.on('disconnect', () => {
        for (const lobbyId in lobbies) {
            const index = lobbies[lobbyId].players.indexOf(socket);
            if (index > -1) {
                lobbies[lobbyId].players.splice(index, 1);
                socket.leave(lobbyId);  // Leave the room
                console.log(`Player disconnected from lobby ${lobbyId}`);

                if (lobbies[lobbyId].players.length === 0) {
                    delete lobbies[lobbyId];
                    console.log(`Lobby ${lobbyId} removed as it's empty`);
                }
                break;
            }
        }
    });

    socket.on('move', ({ gameId, x, y, isWalking }) => {
        socket.to(gameId).emit('move', { x, y, isWalking });
    });

    socket.on('moveEnd', ({ gameId }) => {
        socket.to(gameId).emit('moveEnd');
    });

    socket.on('gameOver', ({ gameId }) => {
        console.log(`Game Over event in game ${gameId}`);
        io.to(gameId).emit('gameOver'); // Notify all players in the game
    });
});

http.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://${getLocalIpAddress()}:${port}`);
});
