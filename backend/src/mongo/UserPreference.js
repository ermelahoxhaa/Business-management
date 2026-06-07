import mongoose from 'mongoose'

const userPreferenceSchema = new mongoose.Schema(
  {
    user_id: { type: Number, required: true, unique: true },
    email_notifications: { type: Boolean, default: true },
    task_updates: { type: Boolean, default: true },
    project_updates: { type: Boolean, default: true }
  },
  { timestamps: true, collection: 'user_preferences' }
)

export default mongoose.models.UserPreference ||
  mongoose.model('UserPreference', userPreferenceSchema)
