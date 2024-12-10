import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext"; // Import the socket context
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './header.css';

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
            </div>
        </header>
    );
};

export default Header;
