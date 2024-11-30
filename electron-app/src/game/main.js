import Phaser from "phaser";
import GameScreen from "./screens/GameScreen";
import GameOverScreen from "./screens/GameOverScreen";

const config = {
    type: Phaser.AUTO,
    parent: "game-container",
    width: 800,
    height: 450,
};

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
