import mongoose from 'mongoose'

const resourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a resource name'],
    trim: true
  },
  type: {
    type: String,
    enum: ['labour', 'machinery', 'subcontractor'],
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 0
  },
  unit: {
    type: String,
    trim: true
  },
  cost: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['available', 'in-use', 'maintenance', 'unavailable'],
    default: 'available'
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

export default mongoose.model('Resource', resourceSchema)

