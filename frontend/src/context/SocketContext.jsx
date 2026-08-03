import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../services/api";

const SocketContext = createContext({
  socket: null,
  onlineUsers: []
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const token = localStorage.getItem("token");

    const newSocket = io(API_BASE_URL, {
      transports: ["websocket", "polling"],
      auth: { token }
    });

    newSocket.emit("registerUser", userId);

    newSocket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
