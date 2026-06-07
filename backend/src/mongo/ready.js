import mongoose from 'mongoose'

export const isDbReady = () => mongoose.connection.readyState === 1
