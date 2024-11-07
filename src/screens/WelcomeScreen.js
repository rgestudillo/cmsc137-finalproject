import Phaser from 'phaser';
import { io } from 'socket.io-client';
import { serverUrl, serverPort } from '../utils/constants';

let socket;

class WelcomeScreen extends Phaser.Scene {
    constructor() {
        super('WelcomeScreen');
    }

    preload() {
        // Preload any assets (optional)
    }

    create() {
        // Set the background color or image
        this.cameras.main.setBackgroundColor('#282828');

        // Add a title in the center
        const title = this.add.text(this.cameras.main.centerX, 150, 'Welcome to the Game', {
            fontSize: '48px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        // "Create Lobby" button
        const createLobbyButton = this.add.text(this.cameras.main.centerX, 250, 'Create Lobby', {
            fontSize: '32px',
            fill: '#0f0',
        }).setOrigin(0.5).setInteractive();

        createLobbyButton.on('pointerdown', () => {
            socket = io(`http://${serverUrl}:${serverPort}`);
            socket.emit('createLobby'); // Request to create a new lobby
            socket.on('lobbyCreated', (lobbyId) => {
                this.scene.start('WaitingScreen', { socket, isHost: true, lobbyId }); // Pass lobby ID to WaitingScreen
            });
        });

        // "Join Lobby" button (now goes to JoinLobbyScreen)
        const joinLobbyButton = this.add.text(this.cameras.main.centerX, 350, 'Join Lobby', {
            fontSize: '32px',
            fill: '#f00',
        }).setOrigin(0.5).setInteractive();

        joinLobbyButton.on('pointerdown', () => {
            socket = io(`http://${serverUrl}:${serverPort}`);
            this.scene.start('JoinLobbyScreen', { socket }); // Transition to JoinLobbyScreen
        });
    }
}

export default WelcomeScreen;
