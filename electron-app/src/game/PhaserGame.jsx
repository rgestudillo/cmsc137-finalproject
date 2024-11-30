import PropTypes from "prop-types";
import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import StartGame from "./main";
import { EventBus } from "./EventBus";
import { useSocket } from "../context/SocketContext";

export const PhaserGame = forwardRef(function PhaserGame(
    { currentActiveScene, role }, // Accept role as a prop
    ref
) {
    const game = useRef();
    const { socket } = useSocket();

    useLayoutEffect(() => {
        if (game.current === undefined && socket) {
            // Pass socket and role to StartGame
            game.current = StartGame("game-container", socket, role);

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
    }, [ref, socket, role]); // Added role dependency here

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

PhaserGame.propTypes = {
    currentActiveScene: PropTypes.func,
    role: PropTypes.string.isRequired, // Add role prop validation
};
