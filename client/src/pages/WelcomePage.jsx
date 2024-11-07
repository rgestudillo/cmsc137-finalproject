// WelcomePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";

const WelcomePage = () => {
    const { socket, connectSocket } = useSocket();
    const navigate = useNavigate();

    // Handle "Create Lobby" button click
    const handleCreateLobby = () => {
        socket.emit("createLobby"); // Request to create a new lobby

        // Listen for lobby creation confirmation
        socket.on("lobbyCreated", (lobbyId) => {
            navigate("/waiting", {
                state: { isHost: true, lobbyId }, // Only pass serializable state
            });
        });
    };

    // Handle "Join Lobby" button click
    const handleJoinLobby = () => {
        navigate("/join-lobby", { state: {} }); // Navigate to join lobby screen
    };

    return (
        <div
            style={{
                textAlign: "center",
                color: "#ffffff",
                backgroundColor: "#282828",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <h1 style={{ fontSize: "48px", marginBottom: "20px" }}>
                Welcome to the Game
            </h1>

            <button
                style={{
                    fontSize: "32px",
                    color: "#0f0",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    marginBottom: "20px",
                }}
                onClick={handleCreateLobby}
            >
                Create Lobby
            </button>

            <button
                style={{
                    fontSize: "32px",
                    color: "#f00",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                }}
                onClick={handleJoinLobby}
            >
                Join Lobby
            </button>
        </div>
    );
};

export default WelcomePage;
