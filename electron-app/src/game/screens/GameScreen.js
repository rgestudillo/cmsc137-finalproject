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
const maxHearingRange = 700;

const spawnPositions = {
    ghost: [
        { x: -1000, y: -100 },
        { x: -400, y: -580 },
        { x: 760, y: 450 },
        { x: 520, y: -400 }
    ],
    player: [
        { x: -400, y: 410 },
        { x: 820, y: -560 },
        { x: -380, y: -150 },
        { x: 110, y: 440 }
    ]
};


var otherPlayerisHidingFlag = false;

class MyGame extends Phaser.Scene {
    constructor({ socket, role, navigateCallback }) {
        super("MyGame");
        this.socket = socket; // Store the socket
        this.role = role; // Store the role
        this.gameId = window.location.pathname.split("/")[2]; // Extract gameId from URL
        this.navigateCallback = navigateCallback;
    }

    preload() {
        console.log("MyGame scene preloaded");
        console.log("socket is: ", this.socket);

        this.load.image('ship', '/assets/mansion.png');
        this.load.spritesheet('player', '/assets/player.png', {
            frameWidth: PLAYER_SPRITE_WIDTH,
            frameHeight: PLAYER_SPRITE_HEIGHT,
        });
        this.load.spritesheet('otherPlayer', '/assets/ghost.png', {
            frameWidth: GHOST_SPRITE_WIDTH,
            frameHeight: GHOST_SPRITE_HEIGHT,
        });
        this.load.audio('humanwalk', '/assets/walk.wav'); //
        this.load.audio('ghostwalk', '/assets/ghostwalk.wav'); //
        this.load.audio('cabinetSound', '/assets/cabinetSound.wav');
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
        this.socket.on('gameOver', ({ winner }) => this.showGameOverScreen(winner));

        // Add sound effects
        if (this.role === 'player') {
            player.footsteps = this.sound.add('humanwalk', { loop: true, volume: 0.5 });
            otherPlayer.footsteps = this.sound.add('ghostwalk', { loop: true, volume: 1, pan: 0 });
            player.hideSound = this.sound.add('cabinetSound', { loop: false, volume: 0.5 });

        }
        else {
            player.footsteps = this.sound.add('ghostwalk', { loop: true, volume: 0.5 });
            otherPlayer.footsteps = this.sound.add('humanwalk', { loop: true, volume: 1, pan: 0 });
            otherPlayer.hideSound = this.sound.add('cabinetSound', { loop: false, volume: 1 });
        }


        player.isWalking = false;


        // Mask the screen black
        this.createScreenMask();

        // Clean up resources when scene shuts down
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanupScene());

        this.cameras.main.setZoom(3); // Zoom level (1 = default, >1 = zoom in, <1 = zoom out)

    }


    createScreenMask() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = 350; // Adjust as needed

        // Create a canvas texture
        const gradientTextureKey = 'gradientMask';
        const gradientTexture = this.textures.createCanvas(gradientTextureKey, width, height);
        const ctx = gradientTexture.getContext();

        // Create a radial gradient
        // The first circle (0 radius) is at the center and the second circle (radius) is at the fade-out boundary
        const radialGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);

        // White (fully opaque) at the center, transparent at the edges.
        // White areas will reveal the camera, transparent areas will hide it.
        radialGradient.addColorStop(0, 'rgba(255,255,255,1)');
        radialGradient.addColorStop(1, 'rgba(255,255,255,0)');

        // Fill the canvas with the gradient
        ctx.fillStyle = radialGradient;
        ctx.fillRect(0, 0, width, height);

        // Refresh the texture so Phaser can use it
        gradientTexture.refresh();

        // Create a sprite using the gradient texture
        const gradientSprite = this.add.image(0, 0, gradientTextureKey).setOrigin(0);

        // Create a bitmap mask from the gradient sprite
        const bitmapMask = gradientSprite.createBitmapMask();

        // Apply the bitmap mask to the camera
        this.cameras.main.setMask(bitmapMask);

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

        // Define a minimum distance apart (in pixels)
        const minDistance = 200;

        // Get two random spawn positions
        const { player: playerPos, ghost: otherPlayerPos } = this.getRandomSpawnPosition();

        // Setup player and other player sprites with these random positions
        if (this.role === 'player') {
            player.sprite = this.createSprite(playerPos.x, playerPos.y, 'player', PLAYER_WIDTH, PLAYER_HEIGHT);
            otherPlayer.sprite = this.createSprite(otherPlayerPos.x, otherPlayerPos.y, 'otherPlayer', GHOST_WIDTH, GHOST_HEIGHT);
        } else {
            player.sprite = this.createSprite(otherPlayerPos.x, otherPlayerPos.y, 'otherPlayer', GHOST_WIDTH, GHOST_HEIGHT);
            otherPlayer.sprite = this.createSprite(playerPos.x, playerPos.y, 'player', PLAYER_WIDTH, PLAYER_HEIGHT);
        }
        // Create animations safely
        this.createAnimation(playerAnimationKey, player.sprite.texture.key);
        this.createAnimation(otherPlayerAnimationKey, otherPlayer.sprite.texture.key);

        // Input handling
        this.setupInput();
        player.sprite.isHidden = false;
        // Graphics for hearing range
        this.hearingRange = this.add.graphics({ lineStyle: { width: 2, color: 0x00ff00, alpha: 1 } });
        this.hearingRange.setDepth(10);

        // Handle move events from the server
        this.socket.on('move', ({ x, y, isWalking, isHidden }) => this.handleMoveEvent(x, y, isWalking, isHidden));
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
                frameRate: 12,
                repeat: -1,
            });
        }
    }

    getRandomSpawnPosition() {
        // Ensure the role is defined and gameId is set
        if (!this.gameId || !this.role) {
            console.error("Game ID or Role is missing");
            return null; // return null or a default value
        }
        // Simple hash function to turn gameId into a pseudo-random number
        const hash = (str) => {
            let hashValue = 0;
            for (let i = 0; i < str.length; i++) {
                hashValue = (hashValue << 5) - hashValue + str.charCodeAt(i);
                hashValue |= 0; // Convert to 32-bit integer
            }
            return hashValue;
        };

        // Generate a pseudo-random seed based on the gameId
        const randomSeed = hash(this.gameId);

        // Use modulo to ensure the result stays within the bounds of the array length
        const randomPlayerIndex = Math.abs(randomSeed) % spawnPositions['player'].length;


        // Get the positions using the indexes
        const playerPosition = spawnPositions['player'][randomPlayerIndex];
        const ghostPosition = spawnPositions['ghost'][randomPlayerIndex];


        // Log the selected positions (optional)
        console.log("Random Player Position:", playerPosition);
        console.log("Random Ghost Position:", ghostPosition);

        // Return both player and ghost positions in a single object
        return {
            player: playerPosition,
            ghost: ghostPosition
        };
    }

    handleHiding() {
        if (!player.sprite) return;

        // Array of cabinet coordinates
        const cabinetLocations = [
            { x: -991, y: -580 },
            { x: -391, y: -613 },

        ];

        let playerCanHide = false;

        // Check each cabinet location
        for (const cabinet of cabinetLocations) {
            const dx = cabinet.x - player.sprite.x;
            const dy = cabinet.y - player.sprite.y;
            const distanceToCabinet = Math.sqrt(dx * dx + dy * dy);

            // Check if player is within 20 units of this cabinet
            if (distanceToCabinet <= 10) {
                playerCanHide = true;
                break; // No need to check other cabinets once we know the player can hide
            }
        }

        // If player is close enough to at least one cabinet
        if (playerCanHide) {
            player.sprite.isHidden = !player.sprite.isHidden; // Toggle hiding state

            if (player.sprite.isHidden) {
                player.hideSound.play();
                player.sprite.setVisible(false);
            } else {
                player.hideSound.play();
                player.sprite.setVisible(true);
            }
        }
    }



    setupInput() {
        const gKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);

        gKey.on('down', () => {
            if (this.role == 'player') {
                this.handleHiding(); // Call the hiding function on 'G' key press
            }
            else {
                this.handleGhostAttack();
            }
        });

        // Existing movement input handling
        this.input.keyboard.on('keydown', (e) => {
            if (!pressedKeys.includes(e.code)) {
                pressedKeys.push(e.code);
            }
        });

        this.input.keyboard.on('keyup', (e) => {
            pressedKeys = pressedKeys.filter((key) => key !== e.code);
        });
    }


    handleMoveEvent(x, y, isWalking, isHidden) {
        if (otherPlayer.sprite) {
            // console.log("is walking in movement is: ", isWalking)
            // if(isWalking){
            //     otherPlayer.sprite.isWalking = true;
            // }else{
            //     otherPlayer.sprite.isWalking = false;
            // }

            if (otherPlayer.sprite.x > x) {
                otherPlayer.sprite.flipX = true;
            } else if (otherPlayer.sprite.x < x) {
                otherPlayer.sprite.flipX = false;
            }

            otherPlayer.sprite.x = x;
            otherPlayer.sprite.y = y;
            otherPlayer.moving = true;

            if (isWalking) {
                if (otherPlayer.footsteps.isPlaying) {
                    otherPlayer.footsteps.stop();
                }
            } else if (!otherPlayer.footsteps.isPlaying) {
                otherPlayer.footsteps.play();
            }

            if (isHidden == true) {
                if (otherPlayerisHidingFlag == false) {
                    otherPlayer.hideSound.play();
                    otherPlayerisHidingFlag = true;
                }
                otherPlayer.sprite.setVisible(false);
            } else if (isHidden == false) {
                if (otherPlayerisHidingFlag == true) {
                    otherPlayer.hideSound.play();
                    otherPlayerisHidingFlag = false;
                }
                otherPlayer.sprite.setVisible(true);
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

    showGameOverScreen(winner) {
        // Call navigateCallback to navigate to the WinnerPage React component
        if (this.navigateCallback) {

            console.log("winner is: ", winner);
            console.log("role is: ", this.role);

            if (this.role == winner) {
                this.navigateCallback("/winner");
            } else {
                this.navigateCallback("/loser");
            }


        }
    }
    update() {
        if (player.sprite) {
            if (player.sprite.isHidden) {
                this.socket.emit('move', { gameId: this.gameId, x: player.sprite.x, y: player.sprite.y, isWalking: player.sprite.isWalking, isHidden: player.sprite.isHidden });
                this.socket.emit('moveEnd', { gameId: this.gameId });
                return; // Skip update logic if the player is hidden
            }

            const playerAnimationKey = this.role === 'player' ? 'player-running' : 'ghost-running';

            // Center camera on player
            this.cameras.main.centerOn(player.sprite.x, player.sprite.y);

            // Handle player movement
            const playerMoved = movePlayer(pressedKeys, player.sprite, this.role);


            if (playerMoved) {
                if (player.sprite.isWalking) {
                    if (player.footsteps.isPlaying) {
                        player.footsteps.stop();
                    }
                } else if (!player.footsteps.isPlaying) {
                    player.footsteps.play();
                }

                this.socket.emit('move', { gameId: this.gameId, x: player.sprite.x, y: player.sprite.y, isWalking: player.sprite.isWalking, isHidden: player.sprite.isHidden });
                player.movedLastFrame = true;
                animateMovement(pressedKeys, player.sprite, playerAnimationKey);
            } else {
                player.footsteps.stop();
                this.socket.emit('moveEnd', { gameId: this.gameId });
                player.movedLastFrame = false;

                // Stop the walking animation when not moving
                if (player.sprite.anims && player.sprite.anims.isPlaying) {
                    player.sprite.stop();
                }
            }
            console.log(`Player Coordinates - X: ${player.sprite.x}, Y: ${player.sprite.y}`);
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
            if (this.role == 'ghost') {
                otherPlayer.hideSound.setVolume(volume);
                otherPlayer.hideSound.setPan(pan);
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
                this.socket.emit('gameOver', { gameId: this.gameId, winner: 'ghost' });
            }
        }
    }
}

export default MyGame;