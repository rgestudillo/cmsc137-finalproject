import React, { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext"; // Import your socket context
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation for accessing location state

const WaitingPage = () => {
    const { socket } = useSocket(); // Get the socket from context
    const navigate = useNavigate(); // For navigation after the game starts
    const location = useLocation(); // Access the location state passed from the previous page

    // Destructure isHost and lobbyId from location.state
    const { isHost, lobbyId } = location.state || {}; // Ensure state exists to prevent errors
    const [waitingText, setWaitingText] = useState(
        isHost ? "Waiting for opponent to join..." : "Joining lobby..."
    );
    const [showPlayButton, setShowPlayButton] = useState(false);
    const [playButtonClicked, setPlayButtonClicked] = useState(false);

    useEffect(() => {
        if (!socket) return;

        // Listen for opponent connection
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

        const onStartGame = () => {
            console.log("Starting game...");
            navigate(`/game/${lobbyId}`); // Navigate to /game/gameId
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
        setPlayButtonClicked(true);
        socket.emit("startGame", lobbyId); // Emit start game event to server
    };

    return (
        <div
            style={{
                textAlign: "center",
                color: "#ffffff",
                backgroundImage: "url('/assets/host-create.png')", // Replace with your image URL
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
                <img src="/assets/WaitingforOpp.gif" alt="Waiting animation" style={{ width: "100%", height: "180%" }} />
            </div>
            <div style={{ marginLeft: "20px", marginRight: "20px", fontSize: "24px", color: "#fff" }}>
                <p style={{ marginTop: "100px", fontSize: "24px", color: "#fff" }}>...</p>
            </div>
            <div style={{ backgroundColor: "#938289", width: "100%" }}>
                {/* Display Lobby ID */}
                <p style={{ fontSize: "20px", color: "#4caf50" }}>
                    Lobby ID: {lobbyId}
                </p>
            </div>
            {/* Play Button */}
            {showPlayButton && !playButtonClicked ? (
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
            ) : (
                <div>
                    <img src="/assets/HostileAttackReaper.gif" alt="Your Gif" style={{ width: "100%", height: "200%" }} />
                </div>
            )}
        </div>
    );
};

export default WaitingPage;
