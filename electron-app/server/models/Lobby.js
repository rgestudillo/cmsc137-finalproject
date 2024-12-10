class Lobby {
    constructor(lobbyId, creatorSocket) {
        this.lobbyId = lobbyId;
        this.players = [creatorSocket]; // Start with the creator
        this.gameStarted = false;
        this.lobbyCreated = Date.now();
        this.startTime = null;
    }

    // Add a player to the lobby
    addPlayer(socket) {
        if (this.players.length < 2) {
            this.players.push(socket);
            return true;
        }
        return false; // Lobby is full
    }

    // Remove a player from the lobby
    removePlayer(socket) {
        this.players = this.players.filter(
            (playerSocket) => playerSocket.id !== socket.id
        );
    }

    // Start the game and assign roles to players
    startGame() {
        if (this.players.length === 2) {
            const roles = ["ghost", "player"];
            const randomIndex = Math.floor(Math.random() * roles.length);
            const player1Role = roles[randomIndex];
            const player2Role = roles[1 - randomIndex];

            // Set game start status and time
            this.gameStarted = true;
            this.startTime = new Date().toISOString();

            // Emit start game event with assigned roles
            this.players[0].emit("startGame", { role: player1Role });
            this.players[1].emit("startGame", { role: player2Role });

            return { player1Role, player2Role };
        }
        return null; // Cannot start game with less than 2 players
    }

    // Check if the lobby is available (not full, not started, and sockets are active)
    isAvailable() {
        const allPlayersConnected = this.players.every(
            (playerSocket) => playerSocket.connected
        );
        return this.players.length > 0 && allPlayersConnected;
    }
}

module.exports = Lobby;
