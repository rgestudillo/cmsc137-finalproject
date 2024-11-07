import Phaser from 'phaser';

import WelcomeScreen from './WelcomeScreen';
import WaitingScreen from './WaitingScreen';
import JoinLobbyScreen from './JoinLobbyScreen';
import MyGame from './Game';

const config = {
  type: Phaser.AUTO,
  parent: 'cmsc-137',
  width: 800,
  height: 450,
  scene: [WelcomeScreen, JoinLobbyScreen, WaitingScreen, MyGame],
};

const game = new Phaser.Game(config);
