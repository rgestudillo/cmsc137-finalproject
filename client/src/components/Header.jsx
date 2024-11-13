// src/components/Header.js
import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1); // Navigates back to the previous page
    };

    return (
        <header
            style={{
                position: "fixed",
                top: 0,
                width: "100%",
                padding: "15px 20px", // Adds more padding for a spacious feel
                backgroundColor: "#2E8B57", // Green background color
                display: "flex",
                alignItems: "center",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Adds a subtle shadow
                zIndex: 1000, // Ensures it stays above other content
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
            </h1>{" "}
            {/* White header text */}
        </header>
    );
};

export default Header;
