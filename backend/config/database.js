import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/construction_management')
  } catch (error) {
    process.exit(1)
  }
}

export default connectDB

