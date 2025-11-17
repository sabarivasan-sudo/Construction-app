import mongoose from 'mongoose'

const pettyCashSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['expense', 'income'],
    required: true
  },
  category: {
    type: String,
    enum: ['transport', 'food', 'supplies', 'miscellaneous', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  receiptNumber: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

export default mongoose.model('PettyCash', pettyCashSchema)

