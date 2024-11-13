import React, { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [serverUrl, setServerUrl] = useState(null); // Store the server URL

    useEffect(() => {
        if (serverUrl) {
            // Initialize socket connection when serverUrl is set
            const newSocket = io(serverUrl);
            setSocket(newSocket);

            // Clean up socket on unmount or when serverUrl changes
            return () => newSocket.close();
        }
    }, [serverUrl]);

    // Connects the socket to the given server URL
    const connectSocket = (url) => {
        setServerUrl(url);
    };

    return (
        <SocketContext.Provider
            value={{ socket, serverUrl, setServerUrl, connectSocket }}
        >
            {children}
        </SocketContext.Provider>
    );
};
