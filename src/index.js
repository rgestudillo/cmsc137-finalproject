import Phaser from 'phaser';

import WelcomeScreen from './screens/WelcomeScreen';
import WaitingScreen from './screens/WaitingScreen';
import JoinLobbyScreen from './screens/JoinLobbyScreen';
import GameScreen from './screens/GameScreen';

const config = {
  type: Phaser.AUTO,
  parent: 'cmsc-137',
  width: 800,
  height: 450,
  scene: [WelcomeScreen, JoinLobbyScreen, WaitingScreen, GameScreen],
};

const game = new Phaser.Game(config);
