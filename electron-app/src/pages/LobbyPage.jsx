import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import "../pages/serverconnected.css";

const LobbyPage = () => {
    const navigate = useNavigate();
    const [lobbies, setLobbies] = useState([]);
    const [errorMessage, setErrorMessage] = useState(null);
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        // Request available lobbies from the server
        socket.emit("getAvailableLobbies");

        // Listen for available lobbies
        socket.on("availableLobbies", (lobbies) => {
            setLobbies(lobbies);
        });

        // Handle disconnection
        socket.on("disconnect", () => {
            console.log("Disconnected from server.");
        });

        // Handle lobby full
        socket.on("lobbyFull", () => {
            setErrorMessage("This lobby is full. Please choose another one.");
            setTimeout(() => setErrorMessage(null), 3000); // Reset after 3 seconds
        });

        // Clean up listeners on unmount
        return () => {
            socket.off("availableLobbies");
            socket.off("disconnect");
            socket.off("lobbyFull");
        };
    }, [socket]);

    const handleJoinLobby = (lobbyId) => {
        // Emit the joinLobby event to the server
        socket.emit("joinLobby", lobbyId);

        // Listen for the event where the player joins the lobby
        socket.on("opponentConnected", () => {
            console.log(`Joined the lobby ${lobbyId} successfully.`);
            navigate("/waiting", { state: { isHost: false, lobbyId } });
        });
    };
    return (
        <div
            style={{
                textAlign: "center",
                color: "#ffffff",
                backgroundImage: "url('/assets/connect-join.png')", // Replace with your image URL
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
                    src="/assets/lobbypage.gif"
                    alt="Eyes Animation"
                    style={{
                        width: "100%",
                        height: "170%",
                        marginBottom: "10px",
                    }}
                />
            </div>
            <p
                style={{
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: "20px",
                    marginBottom: "10px",
                }}
            >
                All players are waiting to start the game.
            </p>
            {errorMessage && (
                <p
                    style={{
                        color: "#ff0000",
                        fontSize: "18px",
                        marginBottom: "20px",
                    }}
                >
                    {errorMessage}
                </p>
            )}

            <h2
                style={{
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: "24px",
                    marginBottom: "20px",
                }}
            >
                Available Lobbies
            </h2>

            <div style={{ marginBottom: "20px" }}>
                {lobbies.length > 0 ? (
                    lobbies.map((lobbyId, index) => (
                        <div key={index} style={{ marginBottom: "10px" }}>
                            <button
                                onClick={() => handleJoinLobby(lobbyId)}
                                style={{
                                    fontFamily: "Arial, Helvetica, sans-serif",
                                    fontSize: "18px",
                                    color: "#fff",
                                    backgroundColor: "#00ff00",
                                    border: "none",
                                    padding: "10px 20px",
                                    cursor: "pointer",
                                    marginRight: "10px",
                                }}
                            >
                                Join Lobby {lobbyId}
                            </button>
                        </div>
                    ))
                ) : (
                    <p
                        style={{
                            fontFamily: "Arial, Helvetica, sans-serif",
                            fontSize: "18px",
                        }}
                    >
                        No lobbies available at the moment.
                    </p>
                )}
            </div>
            <div className="button-background connect-server">
                <button
                    className="button-sample"
                    onClick={() => navigate("/server-connected")}
                    style={{
                        fontSize: "20px",
                        color: "#fff",
                        backgroundColor: "#ff5722",
                        border: "none",
                        padding: "10px 20px",
                        cursor: "pointer",
                    }}
                >
                    Back to Main
                </button>
            </div>
        </div>
    );
};

export default LobbyPage;
