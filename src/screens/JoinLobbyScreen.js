import Phaser from 'phaser';

let socket;
let lobbyList = [];  // To store the list of available lobbies
let lobbiesContainer;  // Container for dynamically created lobby buttons

class JoinLobbyScreen extends Phaser.Scene {
    constructor() {
        super('JoinLobbyScreen');
    }

    init(data) {
        socket = data.socket;
    }

    preload() {
        // Preload any assets if needed
    }

    create() {
        this.add.text(250, 50, 'Available Lobbies', {
            fontSize: '32px',
            fill: '#fff',
        });

        // Create a container to hold the lobby buttons
        lobbiesContainer = this.add.container(250, 100);

        // Request available lobbies from the server
        socket.emit('getAvailableLobbies');

        // Listen for the available lobbies from the server
        socket.on('availableLobbies', (lobbies) => {
            lobbyList = lobbies;
            this.displayLobbies();
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('Disconnected from server.');
        });
    }

    displayLobbies() {
        // Clear existing lobby buttons (if any)
        lobbiesContainer.removeAll(true);

        // Display each available lobby as a button
        lobbyList.forEach((lobbyId, index) => {
            const lobbyButton = this.add.text(0, index * 50, `Lobby ID: ${lobbyId}`, {
                fontSize: '24px',
                fill: '#00ff00',
            }).setInteractive();

            lobbyButton.on('pointerdown', () => {
                console.log(`Joining lobby ${lobbyId}`);
                this.joinLobby(lobbyId);
            });

            lobbiesContainer.add(lobbyButton);
        });
    }

    joinLobby(lobbyId) {
        // Emit the joinLobby event to the server with the selected lobby ID
        socket.emit('joinLobby', lobbyId);

        // Listen for the event where the player joins the lobby
        socket.on('opponentConnected', () => {
            console.log('Joined the lobby successfully.');
            this.scene.start('WaitingScreen', {
                socket: socket,
                isHost: false,
                lobbyId: lobbyId,
            });
        });

        socket.on('lobbyFull', () => {
            console.log('The selected lobby is full.');
            this.displayLobbyFullMessage();
        });
    }

    displayLobbyFullMessage() {
        // Display a message indicating the lobby is full
        const fullMessage = this.add.text(250, 400, 'This lobby is full. Please choose another one.', {
            fontSize: '20px',
            fill: '#ff0000',
        });
        setTimeout(() => {
            fullMessage.destroy();
        }, 3000);  // Remove the message after 3 seconds
    }

    update() {
        // You can add any additional logic here if needed
    }
}

export default JoinLobbyScreen;
