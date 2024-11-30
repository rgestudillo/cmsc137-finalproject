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

        this.socket.on('lobbyNotFound', () => {
            this.showInvalidGameMessage('Game not found');
        });

        this.socket.on('opponentConnected', () => {
            this.setupGame();
        });

        player.footsteps = this.sound.add('footsteps', {
            loop: true,
            volume: 0.5,
        });
        otherPlayer.footsteps = this.sound.add('footsteps', {
            loop: true,
            volume: 0.5,
            pan: 0,
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

        // Dynamic animation keys
        const playerAnimationKey = this.role === 'player' ? 'player-running' : 'ghost-running';
        const otherPlayerAnimationKey = this.role === 'player' ? 'ghost-running' : 'player-running';

        if (this.role === 'player') {
            player.sprite = this.add.sprite(PLAYER_START_X, PLAYER_START_Y, 'player');
            player.sprite.displayHeight = PLAYER_HEIGHT;
            player.sprite.displayWidth = PLAYER_WIDTH;

            otherPlayer.sprite = this.add.sprite(GHOST_START_X, GHOST_START_Y, 'otherPlayer');
            otherPlayer.sprite.displayHeight = GHOST_HEIGHT;
            otherPlayer.sprite.displayWidth = GHOST_WIDTH;
        } else if (this.role === 'ghost') {
            player.sprite = this.add.sprite(GHOST_START_X, GHOST_START_Y, 'otherPlayer');
            player.sprite.displayHeight = GHOST_HEIGHT;
            player.sprite.displayWidth = GHOST_WIDTH;

            otherPlayer.sprite = this.add.sprite(PLAYER_START_X, PLAYER_START_Y, 'player');
            otherPlayer.sprite.displayHeight = PLAYER_HEIGHT;
            otherPlayer.sprite.displayWidth = PLAYER_WIDTH;
        }

        // Create animations for player and other player
        this.anims.create({
            key: playerAnimationKey,
            frames: this.anims.generateFrameNumbers(player.sprite.texture.key),
            frameRate: 24,
            repeat: -1,
        });

        this.anims.create({
            key: otherPlayerAnimationKey,
            frames: this.anims.generateFrameNumbers(otherPlayer.sprite.texture.key),
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

            if (!otherPlayer.footsteps.isPlaying) {
                otherPlayer.footsteps.play();
            }
        });

        this.socket.on('moveEnd', () => {
            console.log('Received moveEnd');
            otherPlayer.moving = false;

            if (otherPlayer.footsteps.isPlaying) {
                otherPlayer.footsteps.stop();
            }
        });

        this.hearingRange = this.add.graphics({ lineStyle: { width: 2, color: 0x00ff00, alpha: 1 } });
        this.hearingRange.setDepth(10);
    }

    update() {
        if (player.sprite) {
            const playerAnimationKey = this.role === 'player' ? 'player-running' : 'ghost-running';

            this.scene.scene.cameras.main.centerOn(player.sprite.x, player.sprite.y);

            const playerMoved = movePlayer(pressedKeys, player.sprite);

            if (playerMoved) {
                if (!player.movedLastFrame) {
                    player.footsteps.play();
                }
                this.socket.emit('move', { gameId: this.gameId, x: player.sprite.x, y: player.sprite.y });
                player.movedLastFrame = true;

                animateMovement(pressedKeys, player.sprite, playerAnimationKey);
            } else {
                if (player.movedLastFrame) {
                    player.footsteps.stop();
                    this.socket.emit('moveEnd', { gameId: this.gameId });
                }
                player.movedLastFrame = false;

                player.sprite.stop(playerAnimationKey);
            }

            const maxHearingRange = 300;
            this.hearingRange.clear();
            this.hearingRange.strokeCircle(player.sprite.x, player.sprite.y, maxHearingRange);
        }

        if (otherPlayer.sprite) {
            const otherPlayerAnimationKey = this.role === 'player' ? 'ghost-running' : 'player-running';

            if (otherPlayer.moving) {
                if (otherPlayer.sprite.anims && !otherPlayer.sprite.anims.isPlaying) {
                    otherPlayer.sprite.play(otherPlayerAnimationKey);
                }
            } else {
                if (otherPlayer.sprite.anims && otherPlayer.sprite.anims.isPlaying) {
                    otherPlayer.sprite.stop(otherPlayerAnimationKey);
                }
            }
        }
    }
}

export default MyGame;
