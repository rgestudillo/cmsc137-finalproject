import React, { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext"; // Import your socket context
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation for accessing location state
import "./waitingpage.css";

const WaitingPage = () => {
    const { socket } = useSocket(); // Get the socket from context
    const navigate = useNavigate(); // For navigation after the game starts
    const location = useLocation(); // Access the location state passed from the previous page

    const { isHost, lobbyId } = location.state || {}; // Ensure state exists to prevent errors
    const [waitingText, setWaitingText] = useState(
        isHost ? "..." : "Joining lobby..."
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
            setWaitingText(isHost ? "..." : "Reconnecting...");
            setShowPlayButton(false);
        };

        const onStartGame = ({ role }) => {
            setRole(role); // Set the role received from the server
            setShowModal(true); // Show the modal
            setTimeout(() => {
                setShowModal(false); // Hide the modal after 7 seconds
                navigate(`/game/${lobbyId}`, { state: { role } }); // Navigate to the game page with role
            }, 7000);
        };

        const onPlayerLeft = (data) => {
            console.log(data.message); // Log the message (Player left)
            onDisconnect(); // Call onDisconnect when a player leaves
        };

        // Add socket event listeners
        socket.on("opponentConnected", onOpponentConnected);
        socket.on("disconnect", onDisconnect);
        socket.on("startGame", onStartGame);
        socket.on("playerLeft", onPlayerLeft);

        // Clean up socket listeners on component unmount
        return () => {
            socket.off("opponentConnected", onOpponentConnected);
            socket.off("disconnect", onDisconnect);
            socket.off("startGame", onStartGame);
            socket.off("playerLeft", onPlayerLeft);
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
                <img
                    src="/assets/WaitingforOpp.gif"
                    alt="Waiting animation"
                    style={{ width: "100%", height: "180%" }}
                />
            </div>
            <div
                style={{
                    marginLeft: "20px",
                    marginRight: "20px",
                    fontSize: "24px",
                    color: "#fff",
                }}
            >
                <p
                    style={{
                        marginTop: "100px",
                        fontSize: "24px",
                        color: "#fff",
                    }}
                >
                    {waitingText}
                </p>
            </div>
            <div style={{ backgroundColor: "#938289", width: "100%" }}>
                {/* Display Lobby ID */}
                <p style={{ fontSize: "20px", color: "#1eff27" }}>
                    Lobby ID: {lobbyId}
                </p>
            </div>
            {/* Play Button */}
            {showPlayButton ? (
                <div
                    className="play-background"
                    onClick={handlePlayButtonClick}
                >
                    <button className="play-button">Enter Chambers</button>
                </div>
            ) : (
                <div>
                    <img
                        src="/assets/HostileAttackReaper.gif"
                        alt="Your Gif"
                        style={{ width: "100%", height: "200%" }}
                    />
                </div>
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
                        backgroundColor: "rgba(0, 0, 0, 1)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        zIndex: 1000,
                    }}
                >
                    {/* Conditional Modal Content Based on Role */}
                    {role === "player" && (
                        <img
                            src="/assets/human-role.gif" // Replace with your survivor GIF or image
                            alt="Survivor"
                        />
                    )}
                    {role === "ghost" && (
                        <img
                            src="/assets/ghost-role.gif" // Replace with your ghost GIF or image
                            alt="Ghost"
                        />
                    )}
                </div> //div above if-else
            )}
        </div> //main div
    );
};

export default WaitingPage;
