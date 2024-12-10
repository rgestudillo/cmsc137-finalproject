import { useRef, useState } from "react";
import {
    BrowserRouter as Router,
    Route,
    Routes,
    useLocation,
} from "react-router-dom";
import Phaser from "phaser";
import { PhaserGame } from "./game/PhaserGame";
import HomePage from "./pages/HomePage";
import WaitingPage from "./pages/WaitingPage";
import LobbyPage from "./pages/LobbyPage";
import ServerConnectedPage from "./pages/ServerConnectedPage";
import Game from "./pages/Game";
import Header from "./components/Header";

function App() {
    const phaserRef = useRef();
    const [canMoveSprite, setCanMoveSprite] = useState(false);

    const currentScene = (scene) => {
        setCanMoveSprite(scene.scene.key !== "MainMenu");
    };

    return (
        <Router>
            <AppContent currentScene={currentScene} />
        </Router>
    );
}

function AppContent({ currentScene }) {
    const location = useLocation();

    return (
        <div id="app">
            <Header />

            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route
                    path="/server-connected"
                    element={<ServerConnectedPage />}
                />
                <Route path="/join-lobby" element={<LobbyPage />} />
                <Route path="/waiting" element={<WaitingPage />} />
                <Route
                    path="/game/:gameId"
                    element={<Game currentActiveScene={currentScene} />}
                />
            </Routes>
        </div>
    );
}

export default App;
