import React, { useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { PhaserGame } from "../game/PhaserGame";

const Game = ({ currentActiveScene }) => {
    const { gameId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Retrieve the role from location.state or fallback to localStorage
    const role = location.state?.role || localStorage.getItem("role");

    // Store the role in localStorage when the component mounts
    useEffect(() => {
        if (role) {
            localStorage.setItem("role", role); // Persist the role
        } else {
            navigate("/server-connected"); // Redirect if role is missing
        }
    }, [role, navigate]);

    return (
        <div>
            <h1>Game Screen</h1>
            <p>Game ID: {gameId}</p>
            <p>Your Role: {role}</p>
            {role && (
                <PhaserGame
                    currentActiveScene={currentActiveScene}
                    role={role}
                    navigate={navigate} // Pass navigate for GameOverScreen
                />
            )}
        </div>
    );
};

export default Game;
