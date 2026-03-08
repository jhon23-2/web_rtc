import { useEffect, useState } from "react"
import { io } from "socket.io-client"


const SOCKET_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  ERROR: "connect_error"
}

// Auto-detect server URL: use env variable, or same origin in production, or localhost in dev
const getServerUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  // In production, use the same origin (same domain)
  if (import.meta.env.PROD) {
    return window.location.origin;
  }
  // In development, default to localhost
  return "http://localhost:5000";
};

export const useSocket = (serverUrl = getServerUrl()) => {

  const [socket, setSocket] = useState(null)
  const [socketError, setSocketError] = useState(null)
  const [socketIsConnected, setSocketIsConnected] = useState(false)


  useEffect(() => {
    const newSocket = io(serverUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      reconnectionDelayMax: 5000,
      transports: ["websocket", "polling"],
      allowUpgrades: true
    })

    newSocket.on(SOCKET_EVENTS.CONNECT, () => {
      console.log("Client Socket Connected ", newSocket.id)
      setSocket(newSocket)
      setSocketIsConnected(true)
    })

    newSocket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log("Client Socket Disconncted ", newSocket.id)
      setSocket(null)
      setSocketIsConnected(false)
    })

    newSocket.on(SOCKET_EVENTS.ERROR, () => {
      console.log("Client Socket Error ", newSocket.id)
      setSocket(null)
      setSocketIsConnected(false)
      setSocketError("Error Socket Connection")
    })

    return () => {
      newSocket.close()
    }

  }, [serverUrl])


  return {
    socket,
    socketError,
    socketIsConnected
  }
}
