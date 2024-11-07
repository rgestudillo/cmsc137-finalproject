import Phaser from 'phaser';

let socket;
let isHost;
let waitingText;
let lobbyIdText;  // To display the lobby ID
let playButton;    // Store the reference to the play button

class WaitingScreen extends Phaser.Scene {
    constructor() {
        super('WaitingScreen');
    }

    init(data) {
        socket = data.socket;
        isHost = data.isHost;
        this.lobbyId = data.lobbyId;  // Assuming the lobby ID is passed into the scene
    }

    preload() {
        // Preload any assets if needed
    }

    create() {
        // Create the initial waiting text
        waitingText = this.add.text(250, 150, isHost ? 'Waiting for opponent to join...' : 'Joining lobby...', {
            fontSize: '24px',
            fill: '#fff',
        });

        // Display the Lobby ID on the screen
        lobbyIdText = this.add.text(250, 200, `Lobby ID: ${this.lobbyId}`, {
            fontSize: '20px',
            fill: '#fff',
        });

        // If host, listen for player to join
        if (isHost) {
            socket.on('opponentConnected', () => {
                console.log('Opponent connected!');
                waitingText.setText('Opponent found!');
                this.showPlayButton();
            });
        }

        // If joining, listen for opponent connection
        else {
            socket.on('opponentConnected', () => {
                console.log('Opponent connected!');
                waitingText.setText('Opponent found!');
                this.showPlayButton();
            });
        }

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('Disconnected from server.');
            waitingText.setText(isHost ? 'Waiting for opponent to join...' : 'Reconnecting...');
            this.hidePlayButton();
        });

        // Listen for the 'startGame' event from the host
        socket.on('startGame', () => {
            console.log('Starting game...');
            this.scene.start('MyGame');  // Transition to the game scene
        });
    }

    showPlayButton() {
        if (!playButton) {  // Only create the play button once
            playButton = this.add.text(350, 300, 'Play', {
                fontSize: '32px',
                fill: '#00ff00',
            }).setInteractive();

            playButton.on('pointerdown', () => {
                console.log('Host clicked play.');
                this.emitStartGameEvent();
            });
        }
    }

    hidePlayButton() {
        if (playButton) {
            playButton.destroy();  // Remove Play button
            playButton = null;     // Reset the button reference
        }
    }

    emitStartGameEvent() {
        // Emit the start game event to the server
        socket.emit('startGame', this.lobbyId);
    }

    update() {
        // You can add any additional logic here if needed
    }
}

export default WaitingScreen;
