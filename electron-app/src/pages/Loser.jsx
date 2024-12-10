// src/pages/WinnerPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoserPage = () => {
    const [isClicked, setIsClicked] = useState(false);
    const navigate = useNavigate();

    // Handle button click
    const handleButtonClick = () => {
        setIsClicked(true);
        setTimeout(() => {
            navigate("/server-connected");
        }, 1000); // Slight delay before navigation to enhance the horror effect
    };

    return (
        <div style={styles.container}>
            {/* Spooky GIF as background */}
            <div style={styles.background}></div>
            <div style={styles.overlay}></div>

            {/* Button with spooky effect */}
            <button onClick={handleButtonClick} style={styles.button}>
                {isClicked ? "Returning..." : "Return to Server"}
            </button>
        </div>
    );
};

// Styles for a horror-themed Winner Page
const styles = {
    container: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column", // Arrange the button below the GIF
        overflow: "hidden",
        zIndex: 9999,
    },
    background: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundImage: "url('/assets/gameover/lose-screen.gif')",
        backgroundSize: "cover", // Make sure the GIF covers the entire background
        backgroundPosition: "center", // Center the GIF
        opacity: 0.8, // Optional: makes the GIF slightly transparent to let the overlay show
        zIndex: -1, // Ensure it's behind the content
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.7)", // Darker overlay for more horror
        zIndex: 0,
    },
    button: {
        position: "absolute",
        bottom: "20px", // Button placed at the bottom
        padding: "15px 25px",
        fontSize: "1.6rem",
        color: "#fff",
        backgroundColor: "#FF0000",
        border: "3px solid #FF0000",
        cursor: "pointer",
        transition: "all 0.3s ease-in-out",
        textShadow: "2px 2px 8px rgba(255, 0, 0, 1)",
        boxShadow: "0 0 15px 8px rgba(255, 0, 0, 0.8)",
        fontFamily: "'Creepster', cursive",
        letterSpacing: "2px",
        zIndex: 1, // Ensure the button is above the overlay
    },
};

export default LoserPage;
