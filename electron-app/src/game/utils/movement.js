import { PLAYER_SPEED, GHOST_SPEED, SHIP_HEIGHT, SHIP_WIDTH } from './constants';
import { mapBounds } from './mapBounds';

const isWithinMovementBoundaries = (x, y) => {
    return !mapBounds[y] ? true : !mapBounds[y].includes(x);
};

export const movePlayer = (keys, player, role) => {
    let playerMoved = false;
    const speed = role === 'ghost' ? GHOST_SPEED : PLAYER_SPEED; // Determine speed based on role
    const absPlayerX = player.x + SHIP_WIDTH / 2;
    const absPlayerY = player.y + SHIP_HEIGHT / 2 + 20;

    if (
        keys.includes('ArrowUp') &&
        isWithinMovementBoundaries(absPlayerX, absPlayerY - speed)
    ) {
        playerMoved = true;
        player.y -= speed;
    }
    if (
        keys.includes('ArrowDown') &&
        isWithinMovementBoundaries(absPlayerX, absPlayerY + speed)
    ) {
        playerMoved = true;
        player.y += speed;
    }
    if (
        keys.includes('ArrowLeft') &&
        isWithinMovementBoundaries(absPlayerX - speed, absPlayerY)
    ) {
        playerMoved = true;
        player.x -= speed;
        player.flipX = true;
    }
    if (
        keys.includes('ArrowRight') &&
        isWithinMovementBoundaries(absPlayerX + speed, absPlayerY)
    ) {
        playerMoved = true;
        player.x += speed;
        player.flipX = false;
    }

    return playerMoved;
};