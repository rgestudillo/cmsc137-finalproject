import PropTypes from "prop-types";
import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import StartGame from "./main";
import { EventBus } from "./EventBus";
import { useSocket } from "../context/SocketContext";

// Global variable to track the Phaser.Game instance
let currentGameInstance = null;

export const PhaserGame = forwardRef(function PhaserGame(
    { currentActiveScene, role, navigate }, // Accept navigate callback as a prop
    ref
) {
    const game = useRef();
    const { socket } = useSocket();

    useLayoutEffect(() => {
        // Check and destroy any existing game instance before creating a new one
        if (currentGameInstance) {
            console.log("Destroying existing Phaser instance.");
            currentGameInstance.destroy(true);
            currentGameInstance = null;
        }

        // Create a new game instance if it doesn't exist
        if (game.current === undefined && socket) {
            console.log("Creating a new Phaser instance.");
            currentGameInstance = StartGame(
                "game-container",
                socket,
                role,
                navigate
            );
            game.current = currentGameInstance;

            if (ref !== null) {
                ref.current = { game: game.current, scene: null };
            }
        }

        return () => {
            // Cleanup the Phaser.Game instance when the component unmounts
            if (game.current) {
                console.log("Cleaning up Phaser instance.");
                game.current.destroy(true);
                game.current = undefined;
                currentGameInstance = null;
            }
        };
    }, [ref, socket, role, navigate]);

    useEffect(() => {
        EventBus.on("current-scene-ready", (currentScene) => {
            if (currentActiveScene instanceof Function) {
                currentActiveScene(currentScene);
            }
            if (ref.current) {
                ref.current.scene = currentScene;
            }
        });

        return () => {
            EventBus.removeListener("current-scene-ready");
        };
    }, [currentActiveScene, ref]);

    return <div id="game-container"></div>;
});

PhaserGame.propTypes = {
    currentActiveScene: PropTypes.func,
    role: PropTypes.string.isRequired, // Add role prop validation
    navigate: PropTypes.func.isRequired, // Add navigate prop validation
};
