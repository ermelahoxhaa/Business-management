import { Server } from 'socket.io'
import { verifyAccessToken } from '../utils/tokens.js'

let ioInstance = null

export const initSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
      credentials: true
    }
  })

  ioInstance.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      if (!token) return next(new Error('Authentication required'))
      socket.user = verifyAccessToken(token)
      return next()
    } catch {
      return next(new Error('Invalid token'))
    }
  })

  ioInstance.on('connection', (socket) => {
    socket.join(`user:${socket.user.id}`)
  })

  return ioInstance
}

export const getIo = () => ioInstance

export const emitToUser = (userId, event, payload) => {
  if (!ioInstance) return
  ioInstance.to(`user:${userId}`).emit(event, payload)
}
