import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['task', 'issue', 'material', 'attendance', 'transfer', 'consumption', 'petty-cash', 'project', 'user'],
    required: true
  },
  action: {
    type: String,
    enum: ['created', 'updated', 'deleted', 'completed', 'resolved', 'transferred', 'consumed'],
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  entityType: {
    type: String,
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

// Index for efficient queries
activitySchema.index({ createdAt: -1 })
activitySchema.index({ project: 1, createdAt: -1 })

export default mongoose.model('Activity', activitySchema)

