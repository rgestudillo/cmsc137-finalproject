import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import "../pages/homepage.css";

function HomePage() {
    const navigate = useNavigate();
    const { setServerUrl } = useSocket();
    const [showModal, setShowModal] = useState(false);
    const [serverUrl, setServerUrlInput] = useState("");

    useEffect(() => {
        setServerUrl(null);
        if (window.electron) {
            window.electron.stopServer();
        }
    }, [setServerUrl]);

    const handleConnectToServer = () => {
        setShowModal(true);
    };

    const handleModalSubmit = () => {
        setServerUrl(serverUrl);
        setShowModal(false);
        navigate("/server-connected");
    };

    const handleCreateServer = async () => {
        try {
            if (window.electron) {
                const serverUrl = await window.electron.startServer();
                setServerUrl(serverUrl);
                setShowModal(false);
                navigate("/server-connected");
            } else {
                console.error("Electron API not available");
            }
        } catch (error) {
            console.error("Failed to start server:", error);
        }
    };

    return (
        <div className="homepage-container">
            <div className="header-image-container">
                <img
                    src="/assets/EchoedChambers.gif"
                    alt="Echoed Chambers"
                    className="header-image"
                />
            </div>

            <div className="button-section">
                <div className="button-background">
                    <img
                        src="/assets/buttondesign.png"
                        alt="Button Design"
                        className="button-background-image"
                    />
                    <button
                        onClick={handleConnectToServer}
                        className="button-sample"
                    >
                        Connect to Server
                    </button>
                </div>
                <button onClick={handleCreateServer} className="host-button">
                    Host a Server
                </button>
            </div>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Enter Server URL</h2>
                        <input
                            type="text"
                            value={serverUrl}
                            onChange={(e) => setServerUrlInput(e.target.value)}
                            placeholder="http://localhost:8080"
                            className="modal-input"
                        />
                        <div className="modal-buttons">
                            <button
                                onClick={handleModalSubmit}
                                className="modal-connect-button"
                            >
                                Connect
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="modal-cancel-button"
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
