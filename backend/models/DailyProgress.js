import mongoose from 'mongoose'

const dailyProgressSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  progressPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  description: {
    type: String,
    trim: true
  },
  workCompleted: {
    type: String,
    trim: true
  },
  workPlanned: {
    type: String,
    trim: true
  },
  issues: {
    type: String,
    trim: true
  },
  weather: {
    type: String,
    enum: ['sunny', 'cloudy', 'rainy', 'windy', 'other'],
    default: 'sunny'
  },
  labourCount: {
    type: Number,
    default: 0
  },
  machineryUsed: [{
    type: String,
    trim: true
  }],
  materialsUsed: [{
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material'
    },
    quantity: {
      type: Number,
      default: 0
    }
  }],
  // PDF and Image attachments
  attachments: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['pdf', 'image'],
      default: 'pdf'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    size: {
      type: Number // in bytes
    }
  }],
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'approved', 'rejected'],
    default: 'submitted'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

// Index for efficient queries - one progress entry per project per day
dailyProgressSchema.index({ project: 1, date: 1 }, { unique: true })
dailyProgressSchema.index({ date: -1 })
dailyProgressSchema.index({ recordedBy: 1, date: -1 })

export default mongoose.model('DailyProgress', dailyProgressSchema)

