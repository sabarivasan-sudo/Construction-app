import User from '../models/User.js'
import Activity from '../models/Activity.js'

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, department } = req.body

    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Check if this is the first user - make them admin
    const userCount = await User.countDocuments()
    const isFirstUser = userCount === 0

    const user = await User.create({
      name,
      email,
      password,
      role: isFirstUser ? 'admin' : (role || 'employee'),
      phone,
      department
    })

    const token = user.generateToken()

    // Populate projects for the user
    await user.populate('projects', 'name')

    // Create activity
    await Activity.create({
      type: 'user',
      action: 'created',
      message: `User ${user.name} registered`,
      entityId: user._id,
      entityType: 'User',
      user: user._id
    })

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        projects: user.projects || []
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' })
    }

    const user = await User.findOne({ email }).select('+password')

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' })
    }

    const token = user.generateToken()

    // Populate projects for the user
    await user.populate('projects', 'name')

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        projects: user.projects || []
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('projects', 'name')
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        department: user.department,
        projects: user.projects || []
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

