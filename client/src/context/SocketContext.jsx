// SocketContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { serverUrl, serverPort } from "../game/utils/constants";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    // Connect socket when the component mounts
    useEffect(() => {
        const newSocket = io(`http://${serverUrl}:${serverPort}`);
        setSocket(newSocket);

        // Clean up on unmount
        return () => newSocket.close();
    }, []); // Empty dependency array means this effect runs only once when the component mounts

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};