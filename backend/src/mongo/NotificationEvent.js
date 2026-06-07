import mongoose from 'mongoose'

const notificationEventSchema = new mongoose.Schema(
  {
    notification_id: { type: Number, required: true },
    user_id: { type: Number, required: true },
    event_type: { type: String, required: true },
    channel: { type: String, default: 'socket' },
    title: { type: String },
    message: { type: String }
  },
  { timestamps: true, collection: 'notification_events' }
)

export default mongoose.models.NotificationEvent ||
  mongoose.model('NotificationEvent', notificationEventSchema)
