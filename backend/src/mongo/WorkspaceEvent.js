import mongoose from 'mongoose'

const workspaceEventSchema = new mongoose.Schema(
  {
    user_id: { type: Number, required: true },
    action: { type: String, required: true },
    entity_type: { type: String, required: true },
    entity_id: { type: Number },
    message: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true, collection: 'workspace_events' }
)

export default mongoose.models.WorkspaceEvent ||
  mongoose.model('WorkspaceEvent', workspaceEventSchema)
