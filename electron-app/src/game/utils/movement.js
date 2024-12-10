import { PLAYER_SPEED, GHOST_SPEED, SHIP_HEIGHT, SHIP_WIDTH } from './constants';
import { mapBounds } from './mapBounds';

const isWithinMovementBoundaries = (x, y) => {
    // Convert coordinates to integers to align with map grid
    const roundedX = Math.floor(x);
    const roundedY = Math.floor(y);

    // Check if within bounds
    return !mapBounds[roundedY] ? true : !mapBounds[roundedY].includes(roundedX);
};

export const movePlayer = (keys, player, role) => {

    player.isWalking = false;
    if (keys.includes('ShiftLeft')) {
        player.isWalking = true;
    }
    let playerMoved = false;
    const speed = role === 'ghost' ? GHOST_SPEED : PLAYER_SPEED; // Determine speed based on role
    const finalSpeed = player.isWalking ? speed / 2 : speed; // Halve the speed if walking

    const absPlayerX = player.x + SHIP_WIDTH / 2;
    const absPlayerY = player.y + SHIP_HEIGHT / 2 + 20;

    if (
        keys.includes('KeyW') &&
        isWithinMovementBoundaries(absPlayerX, absPlayerY - finalSpeed)
    ) {
        playerMoved = true;
        player.y -= finalSpeed;
    }
    if (
        keys.includes('KeyS') &&
        isWithinMovementBoundaries(absPlayerX, absPlayerY + finalSpeed)
    ) {
        playerMoved = true;
        player.y += finalSpeed;
    }
    if (
        keys.includes('KeyA') &&
        isWithinMovementBoundaries(absPlayerX - finalSpeed, absPlayerY)
    ) {
        playerMoved = true;
        player.x -= finalSpeed;
        player.flipX = true;
    }
    if (
        keys.includes('KeyD') &&
        isWithinMovementBoundaries(absPlayerX + finalSpeed, absPlayerY)
    ) {
        playerMoved = true;
        player.x += finalSpeed;
        player.flipX = false;
    }

    return playerMoved;
};
