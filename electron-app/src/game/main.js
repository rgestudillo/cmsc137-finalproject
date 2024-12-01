import Phaser from "phaser";
import GameScreen from "./screens/GameScreen";
import GameOverScreen from "./screens/GameOverScreen";

const config = {
    type: Phaser.AUTO,
    parent: "game-container",
    width: 1920,
    height: 1080,
    scale: {
        mode: Phaser.Scale.FIT, // Ensures the game scales proportionally
        autoCenter: Phaser.Scale.CENTER_BOTH, // Centers the game in the container
    },
}

const StartGame = (parent, socket, role, navigateCallback) => {
    return new Phaser.Game({
        ...config,
        parent,
        scene: [
            new GameScreen({ socket, role }), // Pass socket and role to GameScreen
            new GameOverScreen(navigateCallback), // Pass navigateCallback to GameOverScreen
        ],
    });
};

export default StartGame;
