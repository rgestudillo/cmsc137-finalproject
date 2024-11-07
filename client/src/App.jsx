import { useRef, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Use Routes instead of Switch
import Phaser from "phaser";
import { PhaserGame } from "./game/PhaserGame";

import WaitingPage from "./pages/WaitingPage";
import LobbyPage from "./pages/LobbyPage";
import WelcomePage from "./pages/WelcomePage";
import Game from "./pages/Game";

function App() {
    const phaserRef = useRef();
    const [canMoveSprite, setCanMoveSprite] = useState(false);

    // Event emitted from the PhaserGame component
    const currentScene = (scene) => {
        setCanMoveSprite(scene.scene.key !== "MainMenu");
    };

    return (
        <Router>
            <div id="app">
                <Routes>
                    <Route path="/" element={<WelcomePage />} />
                    <Route path="/join-lobby" element={<LobbyPage />} />
                    <Route path="/waiting" element={<WaitingPage />} />
                    <Route
                        path="/game/:gameId"
                        element={<Game currentActiveScene={currentScene} />}
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
