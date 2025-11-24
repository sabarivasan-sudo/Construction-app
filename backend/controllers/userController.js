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
      .populate('projects', 'name')
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
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('projects', 'name')

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
    )
      .select('-password')
      .populate('projects', 'name')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    await Activity.create({
      type: 'user',
      action: 'updated',
      message: `User ${user.name} updated by ${req.user.name}`,
      entityId: user._id,
      entityType: 'User',
      user: req.user.id
    })

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

// @desc    Update user password
// @route   PUT /api/users/:id/password
// @access  Private
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    // Only allow users to update their own password, or admins to update any password
    const userId = req.params.id
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this password' })
    }

    const user = await User.findById(userId).select('+password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    // Update password
    user.password = newPassword
    await user.save()

    await Activity.create({
      type: 'user',
      action: 'updated',
      message: `Password updated for user ${user.name}`,
      entityId: user._id,
      entityType: 'User',
      user: req.user.id
    })

    res.json({
      success: true,
      message: 'Password updated successfully'
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

