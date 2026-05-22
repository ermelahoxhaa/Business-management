import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema(
  {
    user_id: { type: Number, required: true },
    action: { type: String, required: true },
    entity_type: { type: String, required: true },
    entity_id: { type: Number },
    message: { type: String, required: true }
  },
  { timestamps: true, collection: 'activities' }
)

export default mongoose.models.Activity || mongoose.model('Activity', activitySchema)
