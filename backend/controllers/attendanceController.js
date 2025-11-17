import Attendance from '../models/Attendance.js'
import Activity from '../models/Activity.js'

export const getAttendances = async (req, res) => {
  try {
    const { user, project, date } = req.query
    const filter = {}

    if (user) filter.user = user
    if (project) filter.project = project
    if (date) {
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)
      filter.date = { $gte: startDate, $lte: endDate }
    }

    const attendances = await Attendance.find(filter)
      .populate('user', 'name email')
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
      data: attendance
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

