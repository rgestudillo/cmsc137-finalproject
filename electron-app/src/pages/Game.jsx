import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext"; // Import the useSocket hook
import { PhaserGame } from "../game/PhaserGame";

const Game = ({ currentActiveScene }) => {
    const { gameId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [timer, setTimer] = useState(null); // State to track the timer
    const { socket } = useSocket(); // Access the socket from the context
    const role = location.state?.role || localStorage.getItem("role");

    // Store the role in localStorage when the component mounts
    useEffect(() => {
        if (role) {
            localStorage.setItem("role", role); // Persist the role
        } else {
            navigate("/server-connected"); // Redirect if role is missing
        }
    }, [role, navigate]);

    // Handle game and timer events from the server
    useEffect(() => {
        if (socket) {
            // Listen for timer updates
            socket.on("timerUpdate", (remainingTime) => {
                setTimer(remainingTime); // Update timer
            });

            // Handle cleanup
            return () => {
                socket.off("timerUpdate");
            };
        }
    }, [socket, gameId]);

    // Render the timer
    const currentTimer =
        timer !== null ? `${timer}s` : "Waiting for game to start...";

    return (
        <div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "transparent",
                    color: "#fff",
                    fontFamily: "'Creepster', cursive", // Spooky font
                    padding: "1rem",
                    border: "2px solid red", // Red border for intensity
                    borderRadius: "10px",
                    textShadow:
                        "2px 2px 8px red, 0 0 25px yellow, 0 0 5px darkorange", // Eerie glow effect
                    gap: "2rem",
                    marginTop: "4rem",
                    animation: "pulse 1.5s infinite", // Pulsing animation for the whole container
                }}
            >
                <p
                    style={{
                        margin: 0,
                        fontSize: "1.5rem",
                        color: "orange",
                        animation: "blink 1s infinite",
                    }}
                >
                    <span>{gameId}</span>
                </p>
                <p
                    style={{
                        margin: 0,
                        fontSize: "2rem", // Increase the font size for emphasis
                        color: "red",
                        textShadow: "0 0 20px red, 0 0 30px darkred", // Red glow for the timer
                        animation: "blink 1s infinite", // Flashing effect for urgency
                    }}
                >
                    <span>{currentTimer}</span>
                </p>
                <p
                    style={{
                        margin: 0,
                        fontSize: "1.2rem",
                        color: "limegreen",
                        textShadow: "0 0 10px limegreen, 0 0 20px lime", // Green eerie glow
                    }}
                >
                    <span>{role}</span>
                </p>
            </div>

            {role && (
                <PhaserGame
                    currentActiveScene={currentActiveScene}
                    role={role}
                    navigate={navigate}
                />
            )}
        </div>
    );
};

export default Game;
