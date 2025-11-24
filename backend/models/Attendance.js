import mongoose from 'mongoose'

const attendanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date
  },
  workHours: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'on-leave', 'half-day'],
    default: 'present'
  },
  overtime: {
    type: Number,
    default: 0 // in hours
  },
  lateArrival: {
    type: Boolean,
    default: false
  },
  earlyLeave: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true
  },
  photo: {
    type: String // Base64 encoded image
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  locationName: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

// Index for efficient queries
attendanceSchema.index({ user: 1, date: 1 }, { unique: true })

export default mongoose.model('Attendance', attendanceSchema)

