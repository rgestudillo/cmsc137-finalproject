import { app, BrowserWindow, ipcMain } from 'electron';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { spawn } from 'child_process';
import getPort from 'get-port';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let serverProcess;

// Function to get the local IP address
function getLocalIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// Function to start the backend server
async function startServer() {
    const backendPort = await getPort({ port: [3001, 3002, 3003] });
    const ipAddress = getLocalIpAddress();
    console.log(`Starting backend server on ${ipAddress}:${backendPort}`);

    serverProcess = spawn('node', [path.join(__dirname, '../server/index.js')], {
        stdio: 'inherit',
        env: { ...process.env, PORT: backendPort, NODE_ENV: process.env.NODE_ENV || 'development' }
    });

    serverProcess.on('error', (err) => {
        console.error("Failed to start server:", err);
    });

    return `${ipAddress}:${backendPort}`; // Return the full URL with IP address
}

// Create the Electron window and handle loading URLs
async function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            preload: path.join(__dirname, 'preload.js'),
        },
    });
    if (process.env.NODE_ENV === 'development') {
        console.log("Running in development mode");

        win.loadURL('http://localhost:8080').catch(err => {
            console.error("Failed to load Vite server:", err);
        });
        win.webContents.openDevTools();
    } else {
        console.log("Running in production mode");

        const expressPort = await getPort({ port: [3000, 3004, 3005] });
        console.log(`Starting frontend Express server on port ${expressPort}`);

        const expressApp = express();
        expressApp.use(express.static(path.join(__dirname, 'dist')));

        const expressServer = expressApp.listen(expressPort, '0.0.0.0', () => {
            console.log(`Frontend server is running on http://localhost:${expressPort}`);

            win.loadURL(`http://localhost:${expressPort}`).catch(err => {
                console.error("Error loading production build:", err);
            });
        });

        app.on('before-quit', () => {
            expressServer.close();
            if (serverProcess) serverProcess.kill();
        });
    }
}

app.whenReady().then(createWindow);

function stopServer() {
    if (serverProcess) {
        serverProcess.kill();
        serverProcess = null;
        console.log("Server stopped.");
    }
}

// IPC communication for starting/stopping the server
ipcMain.handle('start-server', async () => {
    console.log("Starting backend server...");
    const backendUrl = await startServer(); // Start the backend server with the IP address
    return `http://${backendUrl}`; // Return the server URL with IP
});

ipcMain.handle('stop-server', () => {
    stopServer();
});

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
