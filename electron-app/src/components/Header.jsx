import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext"; // Import the socket context

const Header = () => {
    const [latency, setLatency] = useState(null); // Store latency locally
    const { socket } = useSocket(); // Access socket from context
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1); // Navigates back to the previous page
    };

    useEffect(() => {
        if (socket) {
            // Emit ping at regular intervals when socket is available
            const pingInterval = setInterval(() => {
                const start = Date.now();
                socket.emit("ping", () => {
                    const duration = Date.now() - start;
                    setLatency(duration); // Update latency locally
                    console.log("Ping duration is:", duration);
                });
            }, 1000); // Ping every 1 second

            // Cleanup on unmount
            return () => clearInterval(pingInterval);
        }
    }, [socket]);

    return (
        <header
            style={{
                position: "fixed",
                top: 0,
                width: "100%",
                padding: "15px 20px",
                backgroundColor: "#2E8B57", // Green background color
                display: "flex",
                alignItems: "center",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                zIndex: 1000,
            }}
        >
            <button
                onClick={handleGoBack}
                style={{
                    padding: "10px 20px",
                    cursor: "pointer",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    marginRight: "15px",
                    marginLeft: "15px",
                }}
            >
                Back
            </button>
            <h1 style={{ margin: 0, color: "white", fontSize: "1.5rem" }}>
                Echoed Shadows
            </h1>
            {/* Display latency in the header */}
            <div
                style={{
                    color: "white",
                    marginLeft: "auto",
                    fontSize: "1rem",
                    marginRight: "20px",
                }}
            >
                {latency !== null
                    ? `Latency: ${latency}ms`
                    : "Waiting for latency..."}
            </div>
        </header>
    );
};

export default Header;
