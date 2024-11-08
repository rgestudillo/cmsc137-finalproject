# CMSC 137 Final Project

A Phaser 3 project template with ES6 support via [Babel 7](https://babeljs.io/) and [Webpack 4](https://webpack.js.org/), which includes hot-reloading for development and production-ready builds. It also integrates with a backend server and allows for dynamic server configuration using environment variables.

This template is updated for Phaser 3.50.0 and above.

## Requirements

- [Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

## Project Structure

- `client/` - Contains the Phaser 3 frontend code.
- `server/` - Contains the backend server code.

## Configuration

1. In the `client/.env` file, the server URL is defined as follows:
    ```javascript
      VITE_SERVER_URL='localhost'
      VITE_SERVER_PORT=5001
    ```

## Available Commands

From the root directory, navigate into `client/` or `server/` to run the following commands:

| Command                   | Description                                                    |
|---------------------------|----------------------------------------------------------------|
| `npm install`             | Install project dependencies for both `client` and `server`.   |
| `npm start` (in `server`) | Start the backend server.                                      |
| `npm run dev` (in `client`)| Start the frontend with hot-reloading.                        |
| `npm run build` (in `client`) | Builds frontend code with production settings.            |

## Instructions

### Initial Setup

1. **Install Dependencies:**
   - From the root directory, install the dependencies for both the client and server.
     ```bash
     cd client
     npm install
     cd ../server
     npm install
     ```

2. **Run the Project:**
   - **Frontend:** In the `client` directory, start the development server:
     ```bash
     npm run dev
     ```
   - **Backend:** In the `server` directory, start the backend server:
     ```bash
     npm start
     ```

   - The frontend will be available at `http://localhost:8080` (default for Webpack), and the backend at `http://localhost:3000` (or whatever IP you set in `.env`).

### Writing Code

Edit any files in the `client/src` folder, and Webpack will automatically recompile and reload the frontend server.

### Building for Production

When ready for deployment, build the frontend by running:

```bash
cd client
npm run build
