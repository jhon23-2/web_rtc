import { useEffect, useState } from "react";
import { io } from "socket.io-client";


const EVENTS_SOCKET = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  ERROR: "connect_error"
}

export const useSocket = (serverUrl = "http://localhost:3000") => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)


  useEffect(() => {

    const newSocket = io(serverUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })

    newSocket.on(EVENTS_SOCKET.CONNECT, () => {
      console.log("Socket connected to the server: ", newSocket.id)
      setIsConnected(true)
      setSocket(newSocket)
    })

    newSocket.on(EVENTS_SOCKET.DISCONNECT, () => {
      console.log("Socket disconnected to the server: ", newSocket.id)
      setIsConnected(false)
    })

    newSocket.on(EVENTS_SOCKET.ERROR, (error) => {
      console.log("Socket Error: ", error)
      setError("Socket Connection Error")
    })


    return () => {
      newSocket.close()
    }

  }, [serverUrl])

  return { socket, isConnected, error }
}

