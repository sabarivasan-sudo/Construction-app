import mongoose from 'mongoose'

const siteTransferSchema = new mongoose.Schema({
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  fromSite: {
    type: String,
    required: true,
    trim: true
  },
  toSite: {
    type: String,
    required: true,
    trim: true
  },
  transferDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  vehicleNumber: {
    type: String,
    trim: true
  },
  driverName: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-transit', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  },
  transferredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

export default mongoose.model('SiteTransfer', siteTransferSchema)

