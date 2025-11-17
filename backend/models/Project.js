import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a project name'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  // Google Maps coordinates
  locationCoordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  // Budget tracking
  budget: {
    type: Number,
    default: 0
  },
  amountSpent: {
    type: Number,
    default: 0
  },
  // Auto-calculated: budget - amountSpent
  remainingBudget: {
    type: Number,
    default: 0
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  // New fields
  projectType: {
    type: String,
    enum: ['residential', 'commercial', 'renovation', 'road-work', 'interior-work', 'infrastructure', 'other'],
    default: 'residential'
  },
  projectStage: {
    type: String,
    enum: ['planning', 'foundation', 'framing', 'masonry', 'electrical', 'plumbing', 'finishing', 'completed'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  // Client information
  client: {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true }
  },
  // Project documents
  documents: [{
    name: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['drawing', 'boq', 'contract', 'photo', 'other'],
      default: 'other'
    },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  // Team with roles
  team: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['site-engineer', 'supervisor', 'worker', 'accountant', 'designer', 'manager', 'other'],
      default: 'worker'
    }
  }],
  projectManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

// Calculate remaining budget before saving
projectSchema.pre('save', function(next) {
  this.remainingBudget = (this.budget || 0) - (this.amountSpent || 0)
  next()
})

export default mongoose.model('Project', projectSchema)

