import Phaser from 'phaser';
import {
    PLAYER_SPRITE_HEIGHT,
    PLAYER_SPRITE_WIDTH,
    PLAYER_HEIGHT,
    PLAYER_WIDTH,
    PLAYER_START_X,
    PLAYER_START_Y,
} from '../utils/constants';
import { movePlayer } from '../utils/movement';
import { animateMovement } from '../utils/animation';

const player = {};
const otherPlayer = {};
let pressedKeys = [];

class MyGame extends Phaser.Scene {
    constructor(socket) {
        super('MyGame');
        this.socket = socket;  // Store the socket
        this.gameId = window.location.pathname.split('/')[2]; // Extract gameId from URL
    }

    preload() {
        console.log("MyGame scene preloaded");
        console.log("socket is: ", this.socket);

        this.load.image('ship', '/assets/ship.png');
        this.load.spritesheet('player', '/assets/player.png', {
            frameWidth: PLAYER_SPRITE_WIDTH,
            frameHeight: PLAYER_SPRITE_HEIGHT,
        });
        this.load.spritesheet('otherPlayer', '/assets/player.png', {
            frameWidth: PLAYER_SPRITE_WIDTH,
            frameHeight: PLAYER_SPRITE_HEIGHT,
        });
    }

    create() {
        console.log("MyGame scene created", this.gameId.toString());

        // Emit joinLobby event with gameId
        this.socket.emit('joinLobby', this.gameId);


        this.socket.on('lobbyFull', () => {
            this.setupGame();
        });

        // Show error message and do not proceed with setup if game not found
        this.socket.on('lobbyNotFound', () => {
            this.showInvalidGameMessage('Game not found');
        });

        // Proceed with game setup only if lobby is valid
        this.socket.on('opponentConnected', () => {
            this.setupGame();
        });
    }

    showInvalidGameMessage(message) {
        const text = this.add.text(400, 225, message, {
            font: '32px Arial',
            fill: '#ff0000',
        }).setOrigin(0.5);
    }

    setupGame() {
        const ship = this.add.image(0, 0, 'ship');
        player.sprite = this.add.sprite(PLAYER_START_X, PLAYER_START_Y, 'player');
        player.sprite.displayHeight = PLAYER_HEIGHT;
        player.sprite.displayWidth = PLAYER_WIDTH;
        otherPlayer.sprite = this.add.sprite(
            PLAYER_START_X,
            PLAYER_START_Y,
            'otherPlayer',
        );
        otherPlayer.sprite.displayHeight = PLAYER_HEIGHT;
        otherPlayer.sprite.displayWidth = PLAYER_WIDTH;

        this.anims.create({
            key: 'running',
            frames: this.anims.generateFrameNumbers('player'),
            frameRate: 24,
            repeat: -1,
        });

        this.input.keyboard.on('keydown', (e) => {
            if (!pressedKeys.includes(e.code)) {
                pressedKeys.push(e.code);
            }
        });
        this.input.keyboard.on('keyup', (e) => {
            pressedKeys = pressedKeys.filter((key) => key !== e.code);
        });

        // Handle move event
        this.socket.on('move', ({ x, y }) => {
            console.log('Received move');
            if (otherPlayer.sprite.x > x) {
                otherPlayer.sprite.flipX = true;
            } else if (otherPlayer.sprite.x < x) {
                otherPlayer.sprite.flipX = false;
            }
            otherPlayer.sprite.x = x;
            otherPlayer.sprite.y = y;
            otherPlayer.moving = true;
        });

        // Handle moveEnd event
        this.socket.on('moveEnd', () => {
            console.log('Received moveEnd');
            otherPlayer.moving = false;
        });
    }

    update() {
        // Ensure player.sprite is defined before accessing its properties
        if (player.sprite) {
            // Update camera position to follow the player sprite
            this.scene.scene.cameras.main.centerOn(player.sprite.x, player.sprite.y);

            const playerMoved = movePlayer(pressedKeys, player.sprite);

            if (playerMoved) {
                this.socket.emit('move', { gameId: this.gameId, x: player.sprite.x, y: player.sprite.y });
                player.movedLastFrame = true;
            } else {
                if (player.movedLastFrame) {
                    this.socket.emit('moveEnd', { gameId: this.gameId });
                }
                player.movedLastFrame = false;
            }

            animateMovement(pressedKeys, player.sprite);
        }

        // Ensure otherPlayer.sprite is defined before accessing its properties
        if (otherPlayer.sprite) {
            // Animate other player
            if (otherPlayer.moving && !otherPlayer.sprite.anims.isPlaying) {
                otherPlayer.sprite.play('running');
            } else if (!otherPlayer.moving && otherPlayer.sprite.anims.isPlaying) {
                otherPlayer.sprite.stop('running');
            }
        }
    }

}

export default MyGame;
