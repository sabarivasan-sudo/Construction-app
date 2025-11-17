import mongoose from 'mongoose'

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a role name'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  permissions: {
    projects: { type: Boolean, default: false },
    tasks: { type: Boolean, default: false },
    issues: { type: Boolean, default: false },
    attendance: { type: Boolean, default: false },
    inventory: { type: Boolean, default: false },
    siteTransfer: { type: Boolean, default: false },
    consumption: { type: Boolean, default: false },
    pettyCash: { type: Boolean, default: false },
    resources: { type: Boolean, default: false },
    reports: { type: Boolean, default: false },
    users: { type: Boolean, default: false },
    roles: { type: Boolean, default: false },
    settings: { type: Boolean, default: false }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

export default mongoose.model('Role', roleSchema)

