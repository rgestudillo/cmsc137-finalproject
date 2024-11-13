# Echoed Shadows

A Phaser 3 project template that demonstrates React communication and uses Vite for bundling. This project includes hot-reloading for development, production-ready builds, and a backend server integrated into an Electron app.

## Requirements

- [Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

## Project Structure

- `electron-app/` - Contains both frontend (Phaser 3) and backend (Express server) code.
- `electron-app/server/` - Contains the backend server code for handling API requests and other server-side logic.

## Available Commands

From the `electron-app` directory, you can run the following commands:

| Command               | Description                                             |
|-----------------------|---------------------------------------------------------|
| `npm install`         | Install project dependencies for the frontend.          |
| `npm install` (in `server/`) | Install dependencies for the backend server.    |
| `npm run dev`         | Start the app in development mode with hot-reloading.   |
| `npm run build`       | Build the frontend with production settings.            |
| `npm run build-electron` | Build the frontend and package the Electron app.     |

## Instructions

### Initial Setup

1. **Navigate to the App Directory and Install Dependencies:**
   - From the root directory, navigate to `electron-app` and install the dependencies for both frontend and backend.
     ```bash
     cd electron-app
     npm install
     cd server
     npm install
     cd ..
     ```

2. **Run the Project:**
   - **Development Mode:** Start the development server with hot-reloading:
     ```bash
     npm run dev
     ```
   - **Build for Production:** To build the frontend and package the Electron app for production, use:
     ```bash
     npm run build-electron
     ```

### Writing Code

Edit any files in the `electron-app/src` folder. Vite will automatically recompile and reload the frontend during development.

### Building for Production

When ready for deployment, use the following command to build and package the Electron app:

```bash
npm run build-electron
