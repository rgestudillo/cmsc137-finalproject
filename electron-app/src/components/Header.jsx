import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSocket } from "../context/SocketContext"; // Import the socket context
import { IoArrowBack, IoHome } from "react-icons/io5"; // Import home and back icons
import { MdVolumeUp, MdVolumeOff } from "react-icons/md"; // Volume icons

const Header = () => {
    const [latency, setLatency] = useState(null); // Store latency locally
    const [isMuted, setIsMuted] = useState(false); // Track audio mute state
    const { socket, serverUrl } = useSocket();
    const navigate = useNavigate();
    const location = useLocation(); // Get current location

    // Handle go back to the previous route
    const handleGoBack = () => {
        console.log("handle go back");
        socket.emit("leaveAllLobbies", () => {
            console.log("Left all lobbies");
        });
        navigate("/server-connected");
    };

    // Handle navigate to home ("/")
    const handleGoHome = () => {
        navigate("/");
    };

    // Set up ping to track latency
    useEffect(() => {
        if (location.pathname === "/") {
            setLatency(null); // Set latency to null for the root path
            return;
        }

        if (socket) {
            // Emit ping at regular intervals when socket is available
            const pingInterval = setInterval(() => {
                const start = Date.now();
                socket.emit("ping", () => {
                    const duration = Date.now() - start;
                    setLatency(duration); // Update latency locally
                });
            }, 3000);

            // Cleanup on unmount
            return () => clearInterval(pingInterval);
        }
    }, [socket, location.pathname]);

    // Define navigation configuration
    const navConfig = {
        "/server-connected": {
            icon: <IoHome size={24} />, // Home icon
            onClick: handleGoHome,
            label: "Connecting",
        },
        "/": {
            icon: null, // No icon on root
            onClick: null,
            label: "Not Connected",
        },
        "*": {
            icon: <IoArrowBack size={24} />, // Back icon
            onClick: handleGoBack,
            label: "Leave",
        },
    };

    const isGameRoute = location.pathname.startsWith("/game/");
    // Get the button config based on the current path
    const getButtonConfig = () => {
        const path = location.pathname;
        if (navConfig[path]) {
            return navConfig[path];
        }
        return navConfig["*"]; // Default to the "Leave" button for all other routes
    };

    const buttonConfig = getButtonConfig();

    return (
        <header
            style={{
                position: "fixed",
                top: 0,
                width: "100%",
                padding: "15px 20px",
                backgroundColor: "transparent",
                display: "flex",
                alignItems: "center",
                zIndex: 1000,
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)", // Light shadow for better visibility
            }}
        >
            {buttonConfig.icon && (
                <button
                    onClick={buttonConfig.onClick}
                    style={{
                        padding: "0",
                        cursor: "pointer",
                        backgroundColor: "transparent", // No background color
                        color: "white", // Use the current color of the parent
                        border: "none", // Remove borders
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: "10px",
                    }}
                >
                    {buttonConfig.icon} {/* Icon */}
                </button>
            )}
            {!isGameRoute && (
                <div
                    style={{
                        color: "white",
                        fontSize: "1rem",
                        textAlign: "center",
                        flex: 1, // Occupy the central space
                    }}
                >
                    {serverUrl || ""}
                    <audio
                        src="/assets/gameMusic.wav"
                        autoPlay
                        loop
                        controls={false}
                        muted={isMuted} // Mute based on the isMuted state
                    />
                </div>
            )}
            {!isGameRoute && (
                <div
                    style={{
                        color: "white",
                        marginLeft: "auto",
                        fontSize: "1rem",
                        marginRight: "20px",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    {latency !== null ? `${latency}ms` : buttonConfig.label}{" "}
                    {/* Display latency or label */}
                    {/* Mute button with icon */}
                    <button
                        onClick={() => setIsMuted(!isMuted)} // Toggle mute state
                        style={{
                            marginLeft: "10px",
                            cursor: "pointer",
                            background: "transparent",
                            border: "none",
                            color: "white",
                            transition: "transform 0.2s", // Smooth hover animation
                        }}
                        title={isMuted ? "Unmute Music" : "Mute Music"} // Tooltip for better UX
                    >
                        {isMuted ? (
                            <MdVolumeOff size={24} /> // Mute icon
                        ) : (
                            <MdVolumeUp size={24} /> // Unmute icon
                        )}
                    </button>
                </div>
            )}
        </header>
    );
};

export default Header;
