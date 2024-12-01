const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: '*',  // Allow all origins
    },
});
const os = require('os');

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
                console.log('lobby is full');
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
            // Assign roles to the players
            const roles = ['ghost', 'player'];
            const randomIndex = Math.floor(Math.random() * roles.length);
            const player1Role = roles[randomIndex];
            const player2Role = roles[1 - randomIndex];

            // Emit roles to the players
            lobbies[lobbyId][0].emit('startGame', { role: player1Role });
            lobbies[lobbyId][1].emit('startGame', { role: player2Role });

            console.log(`Game started in lobby ${lobbyId} with roles: Player 1 - ${player1Role}, Player 2 - ${player2Role}`);
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

    socket.on('move', ({ gameId, x, y, isWalking }) => {
        //console.log(`Server received move event in game ${gameId}:`, x, y, isWalking);
        socket.to(`${gameId}`).emit('move', { x, y, isWalking });
    });

    socket.on('moveEnd', ({ gameId }) => {
        socket.to(`${gameId}`).emit('moveEnd');  // Broadcast only within the specific game lobby
    });

    socket.on('gameOver', ({ gameId }) => {
        console.log(`Game Over event in game ${gameId}`);
        io.to(gameId).emit('gameOver'); // Notify all players in the game
    });

});

http.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://${getLocalIpAddress()}:${port}`);
});
