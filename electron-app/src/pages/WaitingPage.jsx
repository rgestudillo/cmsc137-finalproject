import React, { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext"; // Import your socket context
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation for accessing location state

const WaitingPage = () => {
    const { socket } = useSocket(); // Get the socket from context
    const navigate = useNavigate(); // For navigation after the game starts
    const location = useLocation(); // Access the location state passed from the previous page

    const { isHost, lobbyId } = location.state || {}; // Ensure state exists to prevent errors
    const [waitingText, setWaitingText] = useState(
        isHost ? "Waiting for opponent to join..." : "Joining lobby..."
    );
    const [showPlayButton, setShowPlayButton] = useState(false);
    const [role, setRole] = useState(""); // To store the assigned role
    const [showModal, setShowModal] = useState(false); // To control modal visibility

    useEffect(() => {
        if (!socket) return;

        const onOpponentConnected = () => {
            setWaitingText("Opponent found!");
            setShowPlayButton(true);
        };

        const onDisconnect = () => {
            setWaitingText(
                isHost ? "Waiting for opponent to join..." : "Reconnecting..."
            );
            setShowPlayButton(false);
        };

        const onStartGame = ({ role }) => {
            setRole(role); // Set the role received from the server
            setShowModal(true); // Show the modal
            setTimeout(() => {
                setShowModal(false); // Hide the modal after 5 seconds
                navigate(`/game/${lobbyId}`, { state: { role } }); // Navigate to the game page with role
            }, 5000);
        };

        // Add socket event listeners
        socket.on("opponentConnected", onOpponentConnected);
        socket.on("disconnect", onDisconnect);
        socket.on("startGame", onStartGame);

        // Clean up socket listeners on component unmount
        return () => {
            socket.off("opponentConnected", onOpponentConnected);
            socket.off("disconnect", onDisconnect);
            socket.off("startGame", onStartGame);
        };
    }, [socket, isHost, navigate]);

    const handlePlayButtonClick = () => {
        socket.emit("startGame", lobbyId); // Emit start game event to server
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
                Waiting for Opponent
            </h1>

            <p style={{ fontSize: "24px", color: "#fff" }}>{waitingText}</p>

            {/* Display Lobby ID */}
            <p style={{ fontSize: "20px", color: "#fff" }}>
                Lobby ID: {lobbyId}
            </p>

            {/* Play Button */}
            {showPlayButton && (
                <button
                    style={{
                        fontSize: "32px",
                        color: "#0f0",
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                        marginTop: "20px",
                    }}
                    onClick={handlePlayButtonClick}
                >
                    Play
                </button>
            )}

            {/* Modal for displaying the role */}
            {showModal && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        zIndex: 1000,
                    }}
                >
                    <h2 style={{ fontSize: "36px" }}>Your role is:</h2>
                    <p style={{ fontSize: "48px", marginTop: "20px" }}>
                        {role}
                    </p>
                </div>
            )}
        </div>
    );
};

export default WaitingPage;
