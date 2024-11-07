import Phaser from 'phaser';
import GameScreen from './screens/GameScreen';

// Find out more information about the Game Config at:
// https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 800,
    height: 450,
    scene: [GameScreen],
};

const StartGame = (parent, socket) => {
    return new Phaser.Game({
        ...config,
        parent,
        scene: [new GameScreen(socket)], // Pass socket to GameScreen
    });
};

export default StartGame;
