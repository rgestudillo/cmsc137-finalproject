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
import WinnerPage from "./pages/Winner";
import LoserPage from "./pages/Loser";
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

    // Check if the current route matches the game route pattern
    const isGameRoute = location.pathname.startsWith("/game/");

    return (
        <div id="app">
            <Header />
            {/* Only render the audio if we're not on a game route */}
            {!isGameRoute && (
                <audio
                    src="/assets/gameMusic.wav"
                    autoPlay
                    loop
                    controls={false}
                />
            )}
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
                <Route path="/winner" element={<WinnerPage />} />
                <Route path="/loser" element={<LoserPage />} />
            </Routes>
        </div>
    );
}

export default App;
