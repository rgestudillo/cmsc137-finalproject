export const animateMovement = (keys, player, animationKey) => {
    const runningKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (
        keys.some((key) => runningKeys.includes(key)) &&
        !player.anims.isPlaying
    ) {
        player.play(animationKey); // Use the passed animation key
    } else if (
        !keys.some((key) => runningKeys.includes(key)) &&
        player.anims.isPlaying
    ) {
        player.stop(animationKey); // Use the passed animation key
    }
};