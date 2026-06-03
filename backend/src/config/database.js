import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { Sequelize } from 'sequelize'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true })

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  String(process.env.DB_PASSWORD ?? ''),
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false
  }
)

export default sequelize
