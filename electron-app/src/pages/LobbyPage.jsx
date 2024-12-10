import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import LobbyItem from "../components/LobbyItem";
import "../pages/serverconnected.css";

const LobbyPage = () => {
    const navigate = useNavigate();
    const [lobbies, setLobbies] = useState([]); // Array of lobby objects
    const [filteredLobbies, setFilteredLobbies] = useState([]); // Filtered array of lobbies
    const [searchQuery, setSearchQuery] = useState(""); // Search query
    const [errorMessage, setErrorMessage] = useState(null);
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        // Request available lobbies from the server
        socket.emit("getAvailableLobbies");

        // Listen for available lobbies with detailed information
        socket.on("availableLobbies", (lobbies) => {
            setLobbies(lobbies);
            setFilteredLobbies(lobbies); // Initialize filtered lobbies
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

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        // Filter lobbies based on the search query
        const filtered = lobbies.filter(
            (lobby) =>
                lobby.lobbyId.toLowerCase().includes(query) ||
                lobby.players.toString().includes(query) // Example: filter by players or lobby ID
        );
        setFilteredLobbies(filtered);
    };

    return (
        <div
            style={{
                textAlign: "center",
                color: "#ffffff",
                backgroundImage: "url('/assets/connect-join.png')", // Replace with your image URL
                backgroundSize: "cover",
                backgroundPosition: "center",
                width: "100vw",
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
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "20px",
                    marginTop: "30px",
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
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "24px",
                    marginBottom: "20px",
                }}
            >
                Available Lobbies
            </h2>
            {/* Search input */}
            <input
                type="text"
                placeholder="Search for a lobby..."
                value={searchQuery}
                onChange={handleSearch}
                style={{
                    marginBottom: "20px",
                    padding: "10px",
                    fontSize: "16px",
                    width: "80%",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.5)",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    color: "#fff",
                }}
            />
            <div
                style={{
                    maxHeight: "50vh",
                    overflowY: "auto",
                    width: "80%",
                    marginBottom: "20px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    padding: "10px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                }}
            >
                {filteredLobbies.length > 0 ? (
                    filteredLobbies.map((lobby, index) => (
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
                        No lobbies available for the current search.
                    </p>
                )}
            </div>
            <div className="button-background connect-server">
                <button className="button-sample" onClick={() => navigate("/server-connected")}>
                    Back to Main
                </button>
            </div>
        </div>
    );
};

export default LobbyPage;
