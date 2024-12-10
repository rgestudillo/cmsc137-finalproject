import Phaser from "phaser";
import GameScreen from "./screens/GameScreen";

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
};

const StartGame = (parent, socket, role, navigateCallback) => {
    return new Phaser.Game({
        ...config,
        parent,
        scene: [
            new GameScreen({ socket, role, navigateCallback }), // Pass socket and role to GameScreen

        ],
    });
};

export default StartGame;
