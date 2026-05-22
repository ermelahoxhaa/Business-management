import { io } from 'socket.io-client'
import { getToken } from './auth.js'

let socket = null

export const connectSocket = (onNotification) => {
  const token = getToken()
  if (!token) return null

  if (socket) {
    socket.disconnect()
    socket = null
  }

  socket = io('http://localhost:5000', {
    auth: { token }
  })

  socket.on('notification', (payload) => {
    onNotification?.(payload)
  })

  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
