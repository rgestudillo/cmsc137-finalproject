const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http, {
    cors: {
        origin: "*", // Allow all origins
    },
});
const os = require("os");

// Import the Lobby class
const Lobby = require("./models/Lobby");

let lobbies = {}; // Object to track active lobbies

// Function to generate a unique lobby ID
function generateLobbyId() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let lobbyId = "";
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
            if (iface.family === "IPv4" && !iface.internal) {
                return iface.address;
            }
        }
    }
    return "localhost";
}

// Use the PORT from the environment variables or fallback to 5001
const port = process.env.PORT || 5001;

io.on("connection", (socket) => {
    console.log("player connected");

    socket.on("ping", (callback) => {
        callback();
    });

    // Create a new lobby
    socket.on("createLobby", () => {
        const lobbyId = generateLobbyId();
        const lobby = new Lobby(lobbyId, socket); // Create a new lobby instance

        lobbies[lobbyId] = lobby; // Save the lobby in the lobbies object
        socket.join(lobbyId); // Join the player to the lobby room
        socket.emit("lobbyCreated", lobbyId); // Emit the lobby ID to the player
        console.log(`Lobby created: ${lobbyId}`);
    });

    // Join an existing lobby
    socket.on("joinLobby", (lobbyId) => {
        const lobby = lobbies[lobbyId];

        if (lobby) {
            if (lobby.addPlayer(socket)) {
                socket.join(lobbyId); // Join the player to the lobby room
                socket.emit("opponentConnected"); // Notify the player they are connected
                lobby.players[0].emit("opponentConnected"); // Notify the other player
                console.log(`Player joined lobby ${lobbyId}`);
            } else {
                console.log("lobby is full");
                socket.emit("lobbyFull"); // Notify the player that the lobby is full
            }
        } else {
            console.log("lobby not found");
            socket.emit("lobbyNotFound"); // Emit error if the lobby doesn't exist
        }
    });

    // Handle leaveAllLobbies event
    socket.on("leaveAllLobbies", () => {
        // Loop through all lobbies and remove this player from each one
        for (const lobbyId in lobbies) {
            const lobby = lobbies[lobbyId];
            if (lobby.players.includes(socket)) {
                lobby.removePlayer(socket); // Remove the player from the lobby
                socket.leave(lobbyId); // Leave the room
                console.log(`Player left lobby ${lobbyId}`);

                // Notify the other players in the lobby that the player has left
                lobby.players.forEach((playerSocket) => {
                    if (playerSocket !== socket) {
                        playerSocket.emit("playerLeft", {
                            message: `Player ${socket.id} has left the lobby`,
                        });
                    }
                });

                // Notify the player who left the lobby
                socket.emit("leftLobby", {
                    message: `You have left the lobby ${lobbyId}`,
                });

                // If the lobby is empty, remove it
                if (lobby.players.length === 0) {
                    delete lobbies[lobbyId]; // Delete the lobby if no players remain
                    console.log(`Lobby ${lobbyId} removed as it's empty`);
                }
            }
        }
    });

    socket.on("leaveLobby", (lobbyId) => {
        const lobby = lobbies[lobbyId];
        if (lobby) {
            lobby.removePlayer(socket); // Remove the player from the lobby
            socket.leave(lobbyId); // Ensure the socket leaves the room
            console.log(`Player left lobby ${lobbyId}`);

            if (lobby.players.length === 0) {
                delete lobbies[lobbyId]; // Delete lobby if it's empty
                console.log(`Lobby ${lobbyId} removed as it's empty`);
            } else {
                // Notify remaining players about the updated state
                lobby.players.forEach((playerSocket) =>
                    playerSocket.emit("playerLeft", {
                        remainingPlayers: lobby.players.length,
                    })
                );
            }
        }
    });

    // Send list of available lobbies with detailed info
    socket.on("getAvailableLobbies", () => {
        const availableLobbies = Object.keys(lobbies)
            .filter((lobbyId) => lobbies[lobbyId].isAvailable()) // Check if the lobby is available
            .map((lobbyId) => {
                const lobby = lobbies[lobbyId];
                return {
                    lobbyId: lobby.lobbyId,
                    players: lobby.players.length, // Number of players in the lobby
                    gameStarted: lobby.gameStarted,
                    lobbyCreated: lobby.lobbyCreated, // Lobby creation timestamp
                };
            });

        socket.emit("availableLobbies", availableLobbies); // Send back the detailed lobby info
    });

    socket.on("startGame", (lobbyId) => {
        const lobby = lobbies[lobbyId];
        if (lobby && lobby.players.length === 2) {
            const roles = lobby.startGame();
            if (roles) {
                console.log(`Game started in lobby ${lobbyId} with roles: Player 1 - ${roles.player1Role}, Player 2 - ${roles.player2Role}`);
                const gameDuration = 120; // Timer duration in seconds
                let remainingTime = gameDuration;

                // Emit timer to all players
                io.to(lobbyId).emit("timerUpdate", remainingTime);

                // Countdown logic
                const interval = setInterval(() => {
                    if (remainingTime > 0) {
                        remainingTime--;
                        io.to(lobbyId).emit("timerUpdate", remainingTime);
                    } else {
                        clearInterval(interval);
                        io.to(lobbyId).emit("gameOver", { gameId: lobbyId, winner: 'ghost' });
                        console.log(`Game over in lobby ${lobbyId}`);
                    }
                }, 1000);
            }
        } else {
            socket.emit("error", { message: "Cannot start game. Not enough players or lobby not found." });
        }
    });



    // Handle player disconnect
    socket.on("disconnect", () => {
        for (const lobbyId in lobbies) {
            const index = lobbies[lobbyId].players.indexOf(socket);
            if (index > -1) {
                lobbies[lobbyId].players.splice(index, 1);
                socket.leave(lobbyId); // Leave the room
                console.log(`Player disconnected from lobby ${lobbyId}`);

                if (lobbies[lobbyId].players.length === 0) {
                    delete lobbies[lobbyId];
                    console.log(`Lobby ${lobbyId} removed as it's empty`);
                }
                break;
            }
        }
    });

    socket.on("move", ({ gameId, x, y, isWalking, isHidden }) => {
        socket.to(gameId).emit("move", { x, y, isWalking, isHidden });
    });

    socket.on("moveEnd", ({ gameId }) => {
        socket.to(gameId).emit("moveEnd");
    });

    socket.on("gameOver", ({ gameId, winner }) => {
        console.log(`Game Over event in game ${gameId}, Winner: ${winner}`);

        // Notify all players in the game about the game over event and the winner
        io.to(gameId).emit("gameOver", { winner });

        // After notifying players, remove the lobby from the lobbies object
        for (const lobbyId in lobbies) {
            if (lobbyId === gameId) {
                delete lobbies[lobbyId]; // Delete the lobby from the lobbies object
                console.log(`Lobby ${lobbyId} removed after game over`);
                break; // Stop the loop once the lobby is deleted
            }
        }
    });
});

http.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on http://${getLocalIpAddress()}:${port}`);
});
