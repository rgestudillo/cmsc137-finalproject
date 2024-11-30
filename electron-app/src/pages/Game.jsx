import React from "react";
import { PhaserGame } from "../game/PhaserGame";
import { useParams, useLocation } from "react-router-dom";

const Game = ({ currentActiveScene }) => {
    const { gameId } = useParams();
    const location = useLocation();

    // Retrieve the role from state
    const { role } = location.state || {};

    return (
        <div>
            <h1>Game Screen</h1>
            <p>Game ID: {gameId}</p>
            <p>Your Role: {role}</p> {/* Display the role */}
            <PhaserGame
                currentActiveScene={currentActiveScene}
                role={role}
            />{" "}
            {/* Pass role to PhaserGame */}
        </div>
    );
};

export default Game;
