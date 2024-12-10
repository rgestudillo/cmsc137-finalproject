// WelcomePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import "./serverconnected.css";

const ServerConnectedPage = () => {
    const { socket, serverUrl } = useSocket();
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
                fontFamily: "'Press Start 2P', cursive",
                textAlign: "center",
                color: "#ffffff",
                backgroundImage: "url('./assets/host-create.png')", // Replace with your image URL
                backgroundSize: "cover", // Makes sure the image covers the entire div
                backgroundPosition: "center", // Centers the image
                width: "100vw", // Changed from 100vh to 100vw for full width
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <div>
                <img
                    src="/assets/eyesanimation.gif"
                    alt="Eyes Animation"
                    style={{
                        width: "50%",
                        height: "auto",
                        marginBottom: "10px",
                    }} // Reduced margin
                />
            </div>
            <div className="button-sectionjoin">
                <div
                    className="button-background create-server"
                    onClick={handleCreateLobby}
                >
                    <button className="button-sample">Create Lobby</button>
                </div>
                <div
                    className="button-background connect-server"
                    onClick={handleJoinLobby}
                >
                    <button className="button-sample">Join Lobby</button>
                </div>
            </div>
        </div>
    );
};

export default ServerConnectedPage;
