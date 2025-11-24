import Attendance from '../models/Attendance.js'
import Activity from '../models/Activity.js'

export const getAttendances = async (req, res) => {
  try {
    const { user, project, date } = req.query
    const filter = {}

    // Get current user to check their assigned projects
    const User = (await import('../models/User.js')).default
    const currentUser = await User.findById(req.user.id).select('role projects')
    
    // If user is not admin, filter by assigned projects
    if (currentUser.role !== 'admin') {
      if (currentUser.projects && currentUser.projects.length > 0) {
        // Convert to ObjectIds if they're strings
        const projectIds = currentUser.projects.map(p => 
          typeof p === 'string' ? p : p._id || p
        )
        filter.project = { $in: projectIds }
      } else {
        // If user has no assigned projects, return empty array
        return res.json({
          success: true,
          count: 0,
          data: []
        })
      }
    }

    if (user) filter.user = user
    // If project query param is provided, further filter (must be within user's assigned projects)
    if (project) {
      if (currentUser.role === 'admin' || (currentUser.projects && currentUser.projects.some(p => {
        const pId = typeof p === 'string' ? p : p._id || p
        return pId.toString() === project.toString()
      }))) {
        filter.project = project
      } else {
        // User trying to access project they don't have access to
        return res.json({
          success: true,
          count: 0,
          data: []
        })
      }
    }
    if (date) {
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)
      filter.date = { $gte: startDate, $lte: endDate }
    }

    const attendances = await Attendance.find(filter)
      .populate('user', 'name email role department')
      .populate('project', 'name')
      .sort({ date: -1 })

    res.json({
      success: true,
      count: attendances.length,
      data: attendances
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.create(req.body)
    
    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('user', 'name email role department')
      .populate('project', 'name')

    await Activity.create({
      type: 'attendance',
      action: 'created',
      message: `Attendance recorded for ${attendance.date}`,
      entityId: attendance._id,
      entityType: 'Attendance',
      project: attendance.project,
      user: req.user.id
    })

    res.status(201).json({
      success: true,
      data: populatedAttendance
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('user', 'name email')
      .populate('project', 'name')

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance not found' })
    }

    // Calculate work hours if checkOut is provided
    if (req.body.checkOut && attendance.checkIn) {
      const hours = (new Date(req.body.checkOut) - new Date(attendance.checkIn)) / (1000 * 60 * 60)
      attendance.workHours = Math.round(hours * 100) / 100
      await attendance.save()
    }

    res.json({
      success: true,
      data: attendance
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id)

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance not found' })
    }

    await Activity.create({
      type: 'attendance',
      action: 'deleted',
      message: `Attendance deleted for ${attendance.date}`,
      entityId: attendance._id,
      entityType: 'Attendance',
      project: attendance.project,
      user: req.user.id
    })

    res.json({
      success: true,
      message: 'Attendance deleted successfully'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const uploadAttendance = async (req, res) => {
  try {
    // TODO: Implement Excel/CSV parsing
    // For now, return a placeholder response
    // You'll need to install: multer, xlsx, or csv-parser
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    // Placeholder response - implement actual parsing logic
    res.json({
      success: true,
      message: 'File upload endpoint ready. Excel parsing to be implemented.',
      count: 0,
      data: []
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

