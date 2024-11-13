import PropTypes from "prop-types";
import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import StartGame from "./main";
import { EventBus } from "./EventBus";
import { useSocket } from "../context/SocketContext";

export const PhaserGame = forwardRef(function PhaserGame(
    { currentActiveScene },
    ref
) {
    const game = useRef();
    const { socket } = useSocket();

    console.log("phaser socket is: ", socket);

    // Create the game inside a useLayoutEffect hook to avoid the game being created outside the DOM
    useLayoutEffect(() => {
        if (game.current === undefined && socket) {
            // Ensure socket is available
            game.current = StartGame("game-container", socket); // Pass socket to StartGame function

            if (ref !== null) {
                ref.current = { game: game.current, scene: null };
            }
        }

        return () => {
            if (game.current) {
                game.current.destroy(true);
                game.current = undefined;
            }
        };
    }, [ref, socket]); // Added socket dependency here

    useEffect(() => {
        EventBus.on("current-scene-ready", (currentScene) => {
            if (currentActiveScene instanceof Function) {
                currentActiveScene(currentScene);
            }
            ref.current.scene = currentScene;
        });

        return () => {
            EventBus.removeListener("current-scene-ready");
        };
    }, [currentActiveScene, ref]);

    return <div id="game-container"></div>;
});

// Props definitions
PhaserGame.propTypes = {
    currentActiveScene: PropTypes.func,
};
