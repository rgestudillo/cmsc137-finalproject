import Phaser from 'phaser';
import {
    PLAYER_SPRITE_HEIGHT,
    PLAYER_SPRITE_WIDTH,
    PLAYER_HEIGHT,
    PLAYER_WIDTH,
    PLAYER_START_X,
    PLAYER_START_Y,

    GHOST_SPRITE_HEIGHT,
    GHOST_SPRITE_WIDTH,
    GHOST_START_X,
    GHOST_START_Y,
    GHOST_WIDTH,
    GHOST_HEIGHT
} from '../utils/constants';
import { movePlayer } from '../utils/movement';
import { animateMovement } from '../utils/animation';

const player = {};
const otherPlayer = {};
let pressedKeys = [];

class MyGame extends Phaser.Scene {
    constructor({ socket, role }) {
        super("MyGame");
        this.socket = socket; // Store the socket
        this.role = role; // Store the role
        this.gameId = window.location.pathname.split("/")[2]; // Extract gameId from URL
    }

    preload() {
        console.log("MyGame scene preloaded");
        console.log("socket is: ", this.socket);

        this.load.image('ship', '/assets/ship.png');
        this.load.spritesheet('player', '/assets/player.png', {
            frameWidth: PLAYER_SPRITE_WIDTH,
            frameHeight: PLAYER_SPRITE_HEIGHT,
        });
        this.load.spritesheet('otherPlayer', '/assets/ghost.png', {
            frameWidth: GHOST_SPRITE_WIDTH,
            frameHeight: GHOST_SPRITE_HEIGHT,
        });
        this.load.audio('footsteps', '/assets/walk.wav'); // Replace with your actual file path

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

        player.footsteps = this.sound.add('footsteps', {
            loop: true,  // Loop the audio so it plays continuously while moving
            volume: 0.5, // Adjust volume as needed
        });
        otherPlayer.footsteps = this.sound.add('footsteps', {
            loop: true,
            volume: 0.5, // Base volume
            pan: 0,      // Center pan (adjust dynamically later)
        });
    }

    showInvalidGameMessage(message) {
        const text = this.add.text(400, 225, message, {
            font: '32px Arial',
            fill: '#ff0000',
        }).setOrigin(0.5);
    }

    setupGame() {
        console.log("My role is: ", this.role);

        const ship = this.add.image(0, 0, 'ship');

        // Configure the player's sprite based on their role
        if (this.role === 'player') {
            player.sprite = this.add.sprite(PLAYER_START_X, PLAYER_START_Y, 'player');
            player.sprite.displayHeight = PLAYER_HEIGHT;
            player.sprite.displayWidth = PLAYER_WIDTH;

            otherPlayer.sprite = this.add.sprite(
                PLAYER_START_X,
                PLAYER_START_Y,
                'otherPlayer'
            );
            otherPlayer.sprite.displayHeight = GHOST_HEIGHT;
            otherPlayer.sprite.displayWidth = GHOST_WIDTH;

            // Create animation for the player
            this.anims.create({
                key: 'running',
                frames: this.anims.generateFrameNumbers('player'),
                frameRate: 24,
                repeat: -1,
            });

        } else if (this.role === 'ghost') {
            player.sprite = this.add.sprite(PLAYER_START_X, PLAYER_START_Y, 'otherPlayer');
            player.sprite.displayHeight = GHOST_HEIGHT;
            player.sprite.displayWidth = GHOST_WIDTH;

            otherPlayer.sprite = this.add.sprite(
                PLAYER_START_X,
                PLAYER_START_Y,
                'player'
            );
            otherPlayer.sprite.displayHeight = PLAYER_HEIGHT;
            otherPlayer.sprite.displayWidth = PLAYER_WIDTH;

            // Create animation for the ghost
            this.anims.create({
                key: 'running',
                frames: this.anims.generateFrameNumbers('otherPlayer'),
                frameRate: 24,
                repeat: -1,
            });
        }

        // Input handling
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

            // Start playing footsteps if not already playing
            if (!otherPlayer.footsteps.isPlaying) {
                otherPlayer.footsteps.play();
            }
        });

        // Handle moveEnd event
        this.socket.on('moveEnd', () => {
            console.log('Received moveEnd');
            otherPlayer.moving = false;

            // Stop playing footsteps
            if (otherPlayer.footsteps.isPlaying) {
                otherPlayer.footsteps.stop();
            }
        });

        this.hearingRange = this.add.graphics({ lineStyle: { width: 2, color: 0x00ff00, alpha: 1 } });
        this.hearingRange.setDepth(10); // Ensure the circle is rendered above other lower-depth objects
    }


    update() {
        // Ensure player.sprite is defined before accessing its properties
        if (player.sprite) {

            // temporary radius
            const playerPosition = { x: player.sprite.x, y: player.sprite.y };
            const maxHearingRange = 300; // Your hearing range
            this.hearingRange.clear();
            this.hearingRange.strokeCircle(playerPosition.x, playerPosition.y, maxHearingRange);


            // Update camera position to follow the player sprite
            this.scene.scene.cameras.main.centerOn(player.sprite.x, player.sprite.y);

            const playerMoved = movePlayer(pressedKeys, player.sprite);

            if (playerMoved) {
                if (!player.movedLastFrame) {
                    player.footsteps.play(); // Play the audio when the player starts moving
                }
                this.socket.emit('move', { gameId: this.gameId, x: player.sprite.x, y: player.sprite.y });
                player.movedLastFrame = true;
            } else {
                if (player.movedLastFrame) {
                    player.footsteps.stop();
                    this.socket.emit('moveEnd', { gameId: this.gameId });
                }
                player.movedLastFrame = false;
            }

            // Call animateMovement only if player.sprite and anims are initialized
            if (player.sprite.anims) {
                animateMovement(pressedKeys, player.sprite);
            }
        }

        // Ensure otherPlayer.sprite is defined before accessing its properties
        if (otherPlayer.sprite) {
            // Animate other player
            if (otherPlayer.moving && otherPlayer.sprite.anims && !otherPlayer.sprite.anims.isPlaying) {
                otherPlayer.sprite.play('running');
            } else if (!otherPlayer.moving && otherPlayer.sprite.anims && otherPlayer.sprite.anims.isPlaying) {
                otherPlayer.sprite.stop('running');
            }
        }

        if (player.sprite && otherPlayer.sprite) {
            const playerPosition = { x: player.sprite.x, y: player.sprite.y };
            const otherPlayerPosition = { x: otherPlayer.sprite.x, y: otherPlayer.sprite.y };

            // Calculate distance between player and other player
            const dx = otherPlayerPosition.x - playerPosition.x;
            const dy = otherPlayerPosition.y - playerPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Define maximum hearing range and adjust volume accordingly
            const maxHearingRange = 300; // Adjust this value to your game's scale
            const volume = Phaser.Math.Clamp(1 - distance / maxHearingRange, 0, 1);

            // Calculate pan (-1 for full left, 1 for full right, 0 for center)
            const pan = Phaser.Math.Clamp(dx / maxHearingRange, -1, 1);

            // Update the footsteps audio properties
            otherPlayer.footsteps.setVolume(volume);
            otherPlayer.footsteps.setPan(pan);

            // Play footsteps if other player is moving
            if (otherPlayer.moving && !otherPlayer.footsteps.isPlaying) {
                otherPlayer.footsteps.play();
            } else if (!otherPlayer.moving && otherPlayer.footsteps.isPlaying) {
                otherPlayer.footsteps.stop();
            }
        }
    }


}

export default MyGame;
