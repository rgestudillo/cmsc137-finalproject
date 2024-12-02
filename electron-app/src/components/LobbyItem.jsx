import React from "react";

const LobbyItem = ({ lobbyId, players, gameStarted, lobbyCreated, onJoin }) => {
    const createdAt = new Date(lobbyCreated).toLocaleString();
    const isFull = players === 2;
    const isGameStarted = gameStarted;
    const isWaitingForPlayers = !isFull && !isGameStarted;

    const handleClick = () => {
        if (isWaitingForPlayers) {
            onJoin(lobbyId);
        }
    };

    // Determine the styles based on the lobby status
    let backgroundColor = "#333";
    let cursor = "pointer";
    let color = "#fff";

    if (isGameStarted) {
        backgroundColor = "#6c757d"; // Gray for game started
        cursor = "not-allowed"; // Disabled pointer
    } else if (isFull) {
        backgroundColor = "#d9534f"; // Red for full lobby
        cursor = "not-allowed"; // Disabled pointer
    } else if (isWaitingForPlayers) {
        backgroundColor = "#28a745"; // Green for waiting for players
    }

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px",
                marginBottom: "10px",
                backgroundColor: backgroundColor,
                color: color,
                cursor: cursor,
                borderRadius: "5px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                transition: "background-color 0.3s",
            }}
            onClick={handleClick}
        >
            <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0 }}>{lobbyId}</h3>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: "14px" }}>
                    {isGameStarted
                        ? "Playing"
                        : isFull
                        ? "Lobby Full"
                        : "Waiting for Players"}
                </p>
            </div>
            <div style={{ flex: 1, textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: "14px" }}>{createdAt}</p>
            </div>
        </div>
    );
};

export default LobbyItem;
