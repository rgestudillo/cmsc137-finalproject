import React from "react";
import { PhaserGame } from "../game/PhaserGame";
import { useParams } from "react-router-dom";
const Game = ({ currentActiveScene }) => {
    const { gameId } = useParams();
    return (
        <div>
            <h1>Game Screen</h1>
            <p>Game ID: {gameId}</p>
            <PhaserGame currentActiveScene={currentActiveScene} />
        </div>
    );
};

export default Game;
