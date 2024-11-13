import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext"; // Adjust the import path as needed

function HomePage() {
    const navigate = useNavigate();
    const { setServerUrl } = useSocket(); // Access the setServerUrl function from context
    const [showModal, setShowModal] = useState(false);
    const [serverUrl, setServerUrlInput] = useState(""); // Store the user input for server URL

    // Stop the server and reset serverUrl whenever HomePage loads
    useEffect(() => {
        setServerUrl(null);
        if (window.electron) {
            window.electron.stopServer(); // Stop the server when navigating to HomePage
        }
    }, [setServerUrl]);

    const handleConnectToServer = () => {
        setShowModal(true); // Show the modal when the button is clicked
    };

    const handleModalSubmit = () => {
        setServerUrl(serverUrl); // Update the server URL in the context
        setShowModal(false); // Close the modal
        navigate("/server-connected"); // Navigate to the ServerConnectedPage
    };

    const handleCreateServer = async () => {
        try {
            console.log("window.electron:", window.electron); // Debugging line
            if (window.electron) {
                console.log("Calling startServer function...");
                const serverUrl = await window.electron.startServer(); // Call startServer from preload.js
                setServerUrl(serverUrl);
                setShowModal(false);
                navigate("/server-connected");
            } else {
                console.error("Electron API not available"); // If window.electron is undefined, you’ll see this message
            }
        } catch (error) {
            console.error("Failed to start server:", error);
        }
    };

    return (
        <div
            style={{
                fontFamily: "Arial, sans-serif",
                textAlign: "center",
                padding: "20px",
            }}
        >
            <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>
                Welcome to the Game
            </h1>
            <button
                onClick={handleConnectToServer}
                style={{
                    padding: "10px 20px",
                    fontSize: "16px",
                    cursor: "pointer",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    marginRight: "10px",
                    transition: "background-color 0.3s ease",
                }}
                onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#45a049")
                }
                onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "#4CAF50")
                }
            >
                Connect to Server
            </button>
            <button
                onClick={handleCreateServer}
                style={{
                    padding: "10px 20px",
                    fontSize: "16px",
                    cursor: "pointer",
                    backgroundColor: "#008CBA",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                }}
            >
                Host a Server
            </button>

            {/* Modal for inputting the server URL */}
            {showModal && (
                <div
                    className="modal"
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "20px",
                            borderRadius: "8px",
                            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                            width: "80%", // Adjust the width to fit better
                            maxWidth: "400px", // Max width to avoid too wide
                            textAlign: "center",
                        }}
                    >
                        <h2 style={{ fontSize: "20px", marginBottom: "10px" }}>
                            Enter Server URL
                        </h2>
                        <input
                            type="text"
                            value={serverUrl}
                            onChange={(e) => setServerUrlInput(e.target.value)}
                            placeholder="http://localhost:8080"
                            style={{
                                width: "100%",
                                padding: "10px",
                                marginBottom: "10px",
                                border: "1px solid #ccc",
                                borderRadius: "5px",
                                boxSizing: "border-box", // Ensures padding doesn't cause overflow
                            }}
                        />
                        <div>
                            <button
                                onClick={handleModalSubmit}
                                style={{
                                    padding: "10px 20px",
                                    fontSize: "16px",
                                    cursor: "pointer",
                                    backgroundColor: "#4CAF50",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "5px",
                                    marginRight: "10px",
                                    transition: "background-color 0.3s ease",
                                }}
                                onMouseEnter={(e) =>
                                    (e.target.style.backgroundColor = "#45a049")
                                }
                                onMouseLeave={(e) =>
                                    (e.target.style.backgroundColor = "#4CAF50")
                                }
                            >
                                Connect
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    padding: "10px 20px",
                                    fontSize: "16px",
                                    cursor: "pointer",
                                    backgroundColor: "#f44336",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "5px",
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HomePage;
