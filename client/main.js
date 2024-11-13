import { app, BrowserWindow } from 'electron';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { spawn } from 'child_process';
import getPort from 'get-port';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let serverProcess; // Variable to hold the server process

async function startServer() {
    // Get an available port for the backend server
    const backendPort = await getPort({ port: [3001, 3002, 3003] });
    console.log(`Starting backend server on port ${backendPort}`);

    serverProcess = spawn('node', [path.join(__dirname, '../server/index.js')], {
        stdio: 'inherit',
        env: { ...process.env, PORT: backendPort, NODE_ENV: process.env.NODE_ENV || 'development' }
    });

    serverProcess.on('error', (err) => {
        console.error("Failed to start server:", err);
    });

    return backendPort;
}

async function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    if (process.env.NODE_ENV === 'development') {
        console.log("Running in development mode");

        // Start backend server and get assigned port
        await startServer();

        // Load the Vite dev server in development
        win.loadURL('http://localhost:8080').catch(err => {
            console.error("Failed to load Vite server:", err);
        });
        win.webContents.openDevTools(); // Open DevTools for debugging

    } else {
        console.log("Running in production mode");

        // Start backend server and get assigned port
        const backendPort = await startServer();

        // Get an available port for the Express frontend server
        const expressPort = await getPort({ port: [3000, 3004, 3005] });
        console.log(`Starting frontend Express server on port ${expressPort}`);

        const expressApp = express();
        expressApp.use(express.static(path.join(__dirname, 'dist')));

        const expressServer = expressApp.listen(expressPort, '0.0.0.0', () => {
            console.log(`Frontend server is running on http://localhost:${expressPort}`);

            // Load the app from the Express server
            win.loadURL(`http://localhost:${expressPort}`).catch(err => {
                console.error("Error loading production build:", err);
            });
        });

        // Clean up Express and backend server on app quit
        app.on('before-quit', () => {
            expressServer.close();
            if (serverProcess) serverProcess.kill();
        });
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
