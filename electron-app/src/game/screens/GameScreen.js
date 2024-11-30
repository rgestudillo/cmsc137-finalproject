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

let player = {};
let otherPlayer = {};
let pressedKeys = [];
const maxHearingRange = 300;
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

        // Reset game state
        player = {};
        otherPlayer = {};
        pressedKeys = [];

        // Emit joinLobby event with gameId
        this.socket.emit('joinLobby', this.gameId);

        // Remove existing listeners to prevent duplication
        this.cleanupSocketListeners();

        // Handle server events
        this.socket.on('lobbyFull', () => this.setupGame());
        this.socket.on('lobbyNotFound', () => this.showInvalidGameMessage('Game not found'));
        this.socket.on('opponentConnected', () => this.setupGame());
        this.socket.on('gameOver', () => this.showGameOverScreen());

        // Add sound effects
        player.footsteps = this.sound.add('footsteps', { loop: true, volume: 0.5 });
        otherPlayer.footsteps = this.sound.add('footsteps', { loop: true, volume: 0.5, pan: 0 });

        // Mask the screen black
        this.createScreenMask();

        // Clean up resources when scene shuts down
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanupScene());
    }

    createScreenMask() {
        // Create a graphics object for the mask
        this.blackMaskGraphics = this.make.graphics({
            fillStyle: { color: 0x000000 }, // Black fill
        }, false);

        // Fill the mask graphics with a black circle
        const centerX = this.cameras.main.width / 2;  // Center of the screen
        const centerY = this.cameras.main.height / 2; // Center of the screen
        const radius = 100; // Radius of the circle

        this.blackMaskGraphics.fillCircle(centerX, centerY, radius);

        // Create the mask from the graphics object
        this.blackMask = this.blackMaskGraphics.createGeometryMask();

        // Apply the mask to the camera
        this.cameras.main.setMask(this.blackMask);

        console.log("Screen masked with a circle");
    }


    cleanupSocketListeners() {
        this.socket.off('lobbyFull');
        this.socket.off('lobbyNotFound');
        this.socket.off('opponentConnected');
        this.socket.off('gameOver');
    }

    cleanupScene() {
        console.log("Cleaning up scene and socket listeners.");
        this.cleanupSocketListeners();
        if (this.hearingRange) this.hearingRange.destroy();
        if (player.sprite) player.sprite.destroy();
        if (otherPlayer.sprite) otherPlayer.sprite.destroy();
    }

    showInvalidGameMessage(message) {
        this.add.text(400, 225, message, {
            font: '32px Arial',
            fill: '#ff0000',
        }).setOrigin(0.5);
    }

    setupGame() {
        if (!this.scene || !this.sys.isActive()) {
            console.warn("Attempted to setup game in an inactive or non-existent scene.");
            return;
        }

        // Game setup logic continues here...
        console.log("Setting up the game...");
        console.log("My role is: ", this.role);

        const ship = this.add.image(0, 0, 'ship');

        // Dynamic animation keys
        const playerAnimationKey = this.role === 'player' ? 'player-running' : 'ghost-running';
        const otherPlayerAnimationKey = this.role === 'player' ? 'ghost-running' : 'player-running';

        // Setup player and other player sprites
        if (this.role === 'player') {
            player.sprite = this.createSprite(PLAYER_START_X, PLAYER_START_Y, 'player', PLAYER_WIDTH, PLAYER_HEIGHT);
            otherPlayer.sprite = this.createSprite(GHOST_START_X, GHOST_START_Y, 'otherPlayer', GHOST_WIDTH, GHOST_HEIGHT);
        } else {
            player.sprite = this.createSprite(GHOST_START_X, GHOST_START_Y, 'otherPlayer', GHOST_WIDTH, GHOST_HEIGHT);
            otherPlayer.sprite = this.createSprite(PLAYER_START_X, PLAYER_START_Y, 'player', PLAYER_WIDTH, PLAYER_HEIGHT);
        }

        // Create animations safely
        this.createAnimation(playerAnimationKey, player.sprite.texture.key);
        this.createAnimation(otherPlayerAnimationKey, otherPlayer.sprite.texture.key);

        // Input handling
        this.setupInput();

        // Graphics for hearing range
        this.hearingRange = this.add.graphics({ lineStyle: { width: 2, color: 0x00ff00, alpha: 1 } });
        this.hearingRange.setDepth(10);

        // Handle move events from the server
        this.socket.on('move', ({ x, y }) => this.handleMoveEvent(x, y));
        this.socket.on('moveEnd', () => this.handleMoveEnd());
    }

    createSprite(x, y, texture, width, height) {
        const sprite = this.add.sprite(x, y, texture);
        sprite.displayWidth = width;
        sprite.displayHeight = height;
        return sprite;
    }

    createAnimation(key, textureKey) {
        if (!this.anims.exists(key)) {
            this.anims.create({
                key,
                frames: this.anims.generateFrameNumbers(textureKey),
                frameRate: 24,
                repeat: -1,
            });
        }
    }

    setupInput() {
        this.input.keyboard.on('keydown', (e) => {
            if (!pressedKeys.includes(e.code)) {
                pressedKeys.push(e.code);
            }
        });

        this.input.keyboard.on('keyup', (e) => {
            pressedKeys = pressedKeys.filter((key) => key !== e.code);
        });
    }

    handleMoveEvent(x, y) {
        if (otherPlayer.sprite) {
            otherPlayer.sprite.flipX = otherPlayer.sprite.x > x;
            otherPlayer.sprite.setPosition(x, y);
            otherPlayer.moving = true;

            if (!otherPlayer.footsteps.isPlaying) {
                otherPlayer.footsteps.play();
            }
        }
    }

    handleMoveEnd() {
        if (otherPlayer.sprite) {
            otherPlayer.moving = false;

            if (otherPlayer.footsteps.isPlaying) {
                otherPlayer.footsteps.stop();
            }
        }
    }

    showGameOverScreen() {
        this.scene.stop();
        this.scene.start('GameOverScreen');
    }

    update() {
        if (player.sprite) {
            const playerAnimationKey = this.role === 'player' ? 'player-running' : 'ghost-running';

            // Center camera on player
            this.cameras.main.centerOn(player.sprite.x, player.sprite.y);


            // Update fog of war mask
            this.updateFogOfWar(player.sprite.x, player.sprite.y);

            // Handle player movement
            const playerMoved = movePlayer(pressedKeys, player.sprite, this.role);;

            if (playerMoved) {
                if (!player.movedLastFrame) player.footsteps.play();
                this.socket.emit('move', { gameId: this.gameId, x: player.sprite.x, y: player.sprite.y });
                player.movedLastFrame = true;
                animateMovement(pressedKeys, player.sprite, playerAnimationKey);
            } else {
                if (player.movedLastFrame) player.footsteps.stop();
                this.socket.emit('moveEnd', { gameId: this.gameId });
                player.movedLastFrame = false;

                // Stop the walking animation when not moving
                if (player.sprite.anims && player.sprite.anims.isPlaying) {
                    player.sprite.stop();
                }
            }

            this.updatePlayerAudioAndVisualization();
        }

        if (otherPlayer.sprite) {
            const otherPlayerAnimationKey = this.role === 'player' ? 'ghost-running' : 'player-running';
            if (otherPlayer.moving && !otherPlayer.sprite.anims?.isPlaying) {
                otherPlayer.sprite.play(otherPlayerAnimationKey);
            } else if (!otherPlayer.moving && otherPlayer.sprite.anims?.isPlaying) {
                otherPlayer.sprite.stop(otherPlayerAnimationKey);
            }
        }

        // Handle ghost attack logic
        if (this.role === 'ghost' && Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('SPACE'))) {
            this.handleGhostAttack();
        }
    }

    // Visualize the player's hearing range
    updateHearingRange() {
        if (this.hearingRange && player.sprite) {
            this.hearingRange.clear();
            this.hearingRange.lineStyle(2, 0x00ff00, 0.5); // Green circle with 50% opacity
            this.hearingRange.strokeCircle(player.sprite.x, player.sprite.y, maxHearingRange);
        }
    }

    // Update audio and visualization
    updatePlayerAudioAndVisualization() {

        if (player.sprite && otherPlayer.sprite) {
            const playerPosition = { x: player.sprite.x, y: player.sprite.y };
            const otherPlayerPosition = { x: otherPlayer.sprite.x, y: otherPlayer.sprite.y };

            // Calculate distance between player and other player
            const dx = otherPlayerPosition.x - playerPosition.x;
            const dy = otherPlayerPosition.y - playerPosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Calculate volume and pan based on distance and position
            const volume = Phaser.Math.Clamp(1 - distance / maxHearingRange, 0, 1);
            const pan = Phaser.Math.Clamp(dx / maxHearingRange, -1, 1);

            // Update the footsteps audio properties
            otherPlayer.footsteps.setVolume(volume);
            otherPlayer.footsteps.setPan(pan);

            // Play or stop footsteps based on movement
            if (otherPlayer.moving && !otherPlayer.footsteps.isPlaying) {
                otherPlayer.footsteps.play();
            } else if (!otherPlayer.moving && otherPlayer.footsteps.isPlaying) {
                otherPlayer.footsteps.stop();
            }
        }

        // Call updateHearingRange to update the visual
        this.updateHearingRange();
    }

    handleGhostAttack() {
        if (player.sprite && otherPlayer.sprite) {
            const dx = otherPlayer.sprite.x - player.sprite.x;
            const dy = otherPlayer.sprite.y - player.sprite.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= 20) {
                this.socket.emit('gameOver', { gameId: this.gameId });
            }
        }
    }

    updateFogOfWar(playerX, playerY) {
        if (this.fogMaskGraphics) {
            this.fogMaskGraphics.clear();
            this.fogMaskGraphics.fillCircle(playerX, playerY, 100); // 100 radius visibility
        }
    }
}

export default MyGame;