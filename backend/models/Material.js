import mongoose from 'mongoose'

const materialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a material name'],
    trim: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['cement', 'steel', 'bricks', 'sand', 'gravel', 'other'],
    required: true
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'ton', 'bag', 'cubic-meter', 'piece', 'other']
  },
  currentStock: {
    type: Number,
    default: 0,
    min: 0
  },
  capacity: {
    type: Number,
    default: 100,
    min: 0
  },
  minThreshold: {
    type: Number,
    default: 10,
    min: 0
  },
  pricePerUnit: {
    type: Number,
    default: 0
  },
  supplier: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

export default mongoose.model('Material', materialSchema)

