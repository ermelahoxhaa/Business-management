import mongoose from 'mongoose'
import { spawn } from 'child_process'
import { exec } from 'child_process'
import { promisify } from 'util'
import net from 'net'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const execAsync = promisify(exec)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const backendRoot = path.resolve(__dirname, '../..')
const devDbPath = path.join(backendRoot, '.mongo-data')
const devLogDir = path.join(backendRoot, 'logs')
const devLogPath = path.join(devLogDir, 'mongod.log')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const isMongoRunning = () =>
  new Promise((resolve) => {
    const socket = new net.Socket()
    socket.setTimeout(800)
    socket.once('connect', () => {
      socket.destroy()
      resolve(true)
    })
    socket.once('error', () => resolve(false))
    socket.once('timeout', () => {
      socket.destroy()
      resolve(false)
    })
    socket.connect(27017, '127.0.0.1')
  })

const findMongod = () => {
  if (process.env.MONGOD_PATH && fs.existsSync(process.env.MONGOD_PATH)) {
    return process.env.MONGOD_PATH
  }
  const base = 'C:\\Program Files\\MongoDB\\Server'
  if (!fs.existsSync(base)) return null
  const versions = fs.readdirSync(base).sort().reverse()
  for (const version of versions) {
    const exe = `${base}\\${version}\\bin\\mongod.exe`
    if (fs.existsSync(exe)) return exe
  }
  return null
}

let startAttempted = false

const startLocalMongod = async () => {
  const mongodExe = findMongod()
  if (!mongodExe) return false

  fs.mkdirSync(devDbPath, { recursive: true })
  fs.mkdirSync(devLogDir, { recursive: true })

  spawn(
    mongodExe,
    [
      '--dbpath', devDbPath,
      '--logpath', devLogPath,
      '--bind_ip', '127.0.0.1',
      '--port', '27017',
      '--logappend'
    ],
    { detached: true, stdio: 'ignore', windowsHide: true }
  ).unref()

  for (let i = 0; i < 20; i++) {
    await sleep(1000)
    if (await isMongoRunning()) return true
  }
  return false
}

const ensureLocalMongo = async () => {
  if (await isMongoRunning()) return true

  if (startAttempted) {
    for (let i = 0; i < 8; i++) {
      await sleep(500)
      if (await isMongoRunning()) return true
    }
    return false
  }
  startAttempted = true

  try {
    await execAsync('net start MongoDB', { windowsHide: true })
    for (let i = 0; i < 8; i++) {
      await sleep(1000)
      if (await isMongoRunning()) return true
    }
  } catch {
    
  }

  return startLocalMongod()
}

const connectMongo = async () => {
  try {
    await ensureLocalMongo()
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected')
  } catch (error) {
    console.error('MongoDB error:', error)
  }
}

export default connectMongo
