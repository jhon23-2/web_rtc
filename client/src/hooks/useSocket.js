import { useEffect, useState } from "react"
import { io } from "socket.io-client"


const SOCKET_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  ERROR: "connect_error"
}

export const useSocket = (serverUrl = "http://localhost:3001") => {

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
