import dotenv from 'dotenv'
import connectDB from '../config/database.js'
import User from '../models/User.js'
import Project from '../models/Project.js'
import Material from '../models/Material.js'

dotenv.config()

const seedData = async () => {
  try {
    await connectDB()

    // Don't clear users - only clear demo data if needed
    // Uncomment below if you want to reset everything
    // await User.deleteMany({})
    await Project.deleteMany({})
    await Material.deleteMany({})

    // Create demo users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@demo.com',
      password: '123456',
      role: 'admin'
    })

    const manager = await User.create({
      name: 'Manager User',
      email: 'manager@demo.com',
      password: '123456',
      role: 'manager'
    })

    const employee = await User.create({
      name: 'Employee User',
      email: 'employee@demo.com',
      password: '123456',
      role: 'employee'
    })

    // Create projects
    const project1 = await Project.create({
      name: 'Building A',
      location: 'Site A',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      budget: 5000000,
      progress: 75,
      status: 'active',
      projectManager: manager._id,
      createdBy: admin._id
    })

    const project2 = await Project.create({
      name: 'Building B',
      location: 'Site B',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2025-01-31'),
      budget: 8000000,
      progress: 45,
      status: 'active',
      projectManager: manager._id,
      createdBy: admin._id
    })

    // Create materials
    await Material.create([
      { name: 'Cement', category: 'cement', unit: 'bag', currentStock: 85, capacity: 100 },
      { name: 'Steel', category: 'steel', unit: 'ton', currentStock: 60, capacity: 100 },
      { name: 'Bricks', category: 'bricks', unit: 'piece', currentStock: 90, capacity: 100 },
      { name: 'Sand', category: 'sand', unit: 'cubic-meter', currentStock: 75, capacity: 100 },
      { name: 'Gravel', category: 'gravel', unit: 'cubic-meter', currentStock: 55, capacity: 100 }
    ])

    process.exit(0)
  } catch (error) {
    process.exit(1)
  }
}

seedData()

