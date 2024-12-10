import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import LobbyItem from "../components/LobbyItem";
import "../pages/serverconnected.css";

const LobbyPage = () => {
    const navigate = useNavigate();
    const [lobbies, setLobbies] = useState([]); // Array of lobby objects
    const [errorMessage, setErrorMessage] = useState(null);
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        // Request available lobbies from the server
        socket.emit("getAvailableLobbies");

        // Listen for available lobbies with detailed information
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
<<<<<<< HEAD
            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "20px", marginTop: "30px" }}>
=======
            <p
                style={{
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: "20px",
                    marginBottom: "10px",
                }}
            >
>>>>>>> edc87dc6f7c35df54f71a30b482052c562410cc4
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

<<<<<<< HEAD
            <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "24px", marginBottom: "20px" }}>
=======
            <h2
                style={{
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: "24px",
                    marginBottom: "20px",
                }}
            >
>>>>>>> edc87dc6f7c35df54f71a30b482052c562410cc4
                Available Lobbies
            </h2>

            <div style={{ marginBottom: "20px" }}>
                {lobbies.length > 0 ? (
<<<<<<< HEAD
                    lobbies.map((lobbyId, index) => (
                        <div key={index} style={{ marginBottom: "10px" }}>
                            <button
                                onClick={() => handleJoinLobby(lobbyId)}
                                style={{
                                    fontFamily: "'Poppins', sans-serif",
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
                        <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "18px", color: "#22c744", }}>
=======
                    lobbies.map((lobby, index) => (
                        <LobbyItem
                            key={index}
                            lobbyId={lobby.lobbyId}
                            players={lobby.players} // Pass the number of players
                            gameStarted={lobby.gameStarted}
                            lobbyCreated={lobby.lobbyCreated}
                            onJoin={handleJoinLobby}
                        />
                    ))
                ) : (
                    <p
                        style={{
                            fontFamily: "Arial, Helvetica, sans-serif",
                            fontSize: "18px",
                        }}
                    >
>>>>>>> edc87dc6f7c35df54f71a30b482052c562410cc4
                        No lobbies available at the moment.
                    </p>
                )}
            </div>
<<<<<<< HEAD
                <div className="button-background connect-server" onClick={() => navigate("/")}>
                    <button className="button-sample"onClick={() => navigate("/server-connected")}>
                        Back to Main
                    </button>
=======
            <div className="button-background connect-server">
                <button
                    className="button-sample"
                    onClick={() => navigate("/server-connected")}
                    style={{
                        fontSize: "20px",
                        color: "#fff",
                        border: "none",
                        padding: "10px 20px",
                        cursor: "pointer",
                    }}
                >
                    Back to Main
                </button>
>>>>>>> edc87dc6f7c35df54f71a30b482052c562410cc4
            </div>
        </div>
    );
};

export default LobbyPage;
