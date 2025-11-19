import mongoose from 'mongoose'

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an issue title'],
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['safety-issue', 'defect', 'workmanship-issue', 'material-quality', 'plumbing', 'electrical', 'structural', 'other'],
    default: 'defect'
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
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  severity: {
    type: String,
    enum: ['minor', 'moderate', 'major', 'critical'],
    default: 'moderate'
  },
  status: {
    type: String,
    enum: ['open', 'in-review', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  watchers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resolvedDate: {
    type: Date
  },
  resolution: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    validate: {
      validator: function(v) {
        if (!v || typeof v !== 'string') return false
        // Allow standard tags or custom tags starting with "other:"
        const standardTags = ['plumbing', 'electrical', 'structural', 'material-quality', 'other']
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
  subIssues: [{
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date }
  }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
})

export default mongoose.model('Issue', issueSchema)

