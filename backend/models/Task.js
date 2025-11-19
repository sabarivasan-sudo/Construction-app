import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a task title'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['issue', 'work-item', 'material-needed', 'inspection', 'site-problem'],
    default: 'work-item'
  },
  location: {
    type: String,
    trim: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'blocked', 'completed'],
    default: 'not-started'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  dueDate: {
    type: Date
  },
  startDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  estimatedDuration: {
    value: { type: Number },
    unit: { type: String, enum: ['hours', 'days'], default: 'days' }
  },
  watchers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [{
    type: String,
    validate: {
      validator: function(v) {
        if (!v || typeof v !== 'string') return false
        // Allow standard tags or custom tags starting with "other:"
        const standardTags = ['plumbing', 'electrical', 'masonry', 'interior', 'finishing', 'foundation', 'roofing', 'other']
        return standardTags.includes(v) || v.startsWith('other:')
      },
      message: 'Tag must be a standard tag or a custom tag starting with "other:"'
    }
  }],
  attachments: [{
    name: { type: String, required: true },
    type: { type: String, enum: ['image', 'pdf', 'document', 'other'], default: 'other' },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  subtasks: [{
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date }
  }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

export default mongoose.model('Task', taskSchema)

