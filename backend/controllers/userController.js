import User from '../models/User.js'
import Activity from '../models/Activity.js'

export const getUsers = async (req, res) => {
  try {
    const { role, isActive } = req.query
    const filter = {}

    if (role) filter.role = role
    if (isActive !== undefined) filter.isActive = isActive === 'true'

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      count: users.length,
      data: users
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateUser = async (req, res) => {
  try {
    // Don't allow password update through this route
    const { password, ...updateData } = req.body

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, department } = req.body

    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'employee',
      phone,
      department
    })

    await Activity.create({
      type: 'user',
      action: 'created',
      message: `User ${user.name} created by ${req.user.name}`,
      entityId: user._id,
      entityType: 'User',
      user: req.user.id
    })

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        department: user.department
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Soft delete by setting isActive to false
    user.isActive = false
    await user.save()

    res.json({
      success: true,
      message: 'User deactivated'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

