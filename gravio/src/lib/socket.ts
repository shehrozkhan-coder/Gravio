import { io, Socket } from "socket.io-client"

let socket: Socket | null

export const getSocket = () => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER as string)

    socket.on("connect", () => {
      // Debug: socket connected
      console.log("📡 Socket connected:", socket?.id)
    })

    socket.on("disconnect", () => {
      console.log("📡 Socket disconnected")
    })
  }
  return socket
}