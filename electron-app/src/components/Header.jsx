import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSocket } from "../context/SocketContext"; // Import the socket context
<<<<<<< HEAD
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './header.css';

=======
import { IoArrowBack } from "react-icons/io5";
>>>>>>> edc87dc6f7c35df54f71a30b482052c562410cc4
const Header = () => {
    const [latency, setLatency] = useState(null); // Store latency locally
    const { socket } = useSocket(); // Access socket from context
    const navigate = useNavigate();
    const location = useLocation(); // Get current location

    const handleGoBack = () => {
        navigate(-1); // Navigates back to the previous page
    };

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
                    console.log("Ping duration is:", duration);
                });
            }, 1000); // Ping every 1 second

            // Cleanup on unmount
            return () => clearInterval(pingInterval);
        }
    }, [socket, location.pathname]);

    return (
<<<<<<< HEAD
        <header className="header">
            <button
                onClick={handleGoBack}
                className="back-button"
            >
                <FontAwesomeIcon icon={faArrowLeft} /> {/* Icon */}
            </button>
            
            {/* Display latency in the header */}
            <div className="latency">
                {latency !== null
                    ? `Latency: ${latency}ms`
                    : "Waiting for latency..."}
=======
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
            }}
        >
            {location.pathname !== "/" && (
                <button
                    onClick={handleGoBack}
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
                    <IoArrowBack size={24} /> {/* Icon only */}
                </button>
            )}
            <div
                style={{
                    color: "white",
                    marginLeft: "auto",
                    fontSize: "1rem",
                    marginRight: "20px",
                }}
            >
                {latency !== null ? `${latency}ms` : "Not Connected"}
>>>>>>> edc87dc6f7c35df54f71a30b482052c562410cc4
            </div>
        </header>
    );
};

export default Header;
