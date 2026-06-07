import mongoose from 'mongoose'

const userPresenceSchema = new mongoose.Schema(
  {
    user_id: { type: Number, required: true, unique: true },
    status: { type: String, default: 'offline' },
    last_seen_at: { type: Date, default: Date.now }
  },
  { timestamps: true, collection: 'user_presence' }
)

export default mongoose.models.UserPresence ||
  mongoose.model('UserPresence', userPresenceSchema)
