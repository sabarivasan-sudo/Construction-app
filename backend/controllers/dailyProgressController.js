import DailyProgress from '../models/DailyProgress.js'
import Activity from '../models/Activity.js'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/progress')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// @desc    Get all daily progress entries
// @route   GET /api/daily-progress
// @access  Private
export const getDailyProgress = async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default
    const currentUser = await User.findById(req.user.id).select('role projects')
    
    let filter = {}
    
    // Filter by date if provided
    if (req.query.date) {
      const date = new Date(req.query.date)
      date.setHours(0, 0, 0, 0)
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)
      filter.date = { $gte: date, $lt: nextDate }
    }
    
    // Filter by project if provided
    if (req.query.project) {
      filter.project = req.query.project
    }
    
    // If user is not admin, filter by assigned projects
    if (currentUser.role !== 'admin') {
      if (currentUser.projects && currentUser.projects.length > 0) {
        const projectIds = currentUser.projects.map(p => 
          typeof p === 'string' ? p : p._id || p
        )
        filter.project = filter.project 
          ? { $in: [filter.project, ...projectIds] }
          : { $in: projectIds }
      } else {
        return res.json({
          success: true,
          count: 0,
          data: []
        })
      }
    }
    
    const progress = await DailyProgress.find(filter)
      .populate('project', 'name location')
      .populate('recordedBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('materialsUsed.material', 'name unit')
      .sort({ date: -1, createdAt: -1 })

    res.json({
      success: true,
      count: progress.length,
      data: progress
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get today's progress for a project
// @route   GET /api/daily-progress/today/:projectId
// @access  Private
export const getTodayProgress = async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const progress = await DailyProgress.findOne({
      project: req.params.projectId,
      date: { $gte: today, $lt: tomorrow }
    })
      .populate('project', 'name location')
      .populate('recordedBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('materialsUsed.material', 'name unit')

    if (!progress) {
      return res.json({
        success: true,
        data: null
      })
    }

    res.json({
      success: true,
      data: progress
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get single daily progress entry
// @route   GET /api/daily-progress/:id
// @access  Private
export const getProgress = async (req, res) => {
  try {
    const progress = await DailyProgress.findById(req.params.id)
      .populate('project', 'name location')
      .populate('recordedBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('materialsUsed.material', 'name unit')

    if (!progress) {
      return res.status(404).json({ message: 'Progress entry not found' })
    }

    res.json({
      success: true,
      data: progress
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create daily progress entry
// @route   POST /api/daily-progress
// @access  Private
export const createProgress = async (req, res) => {
  try {
    // Check if progress already exists for this project and date
    const date = req.body.date ? new Date(req.body.date) : new Date()
    date.setHours(0, 0, 0, 0)
    const tomorrow = new Date(date)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existing = await DailyProgress.findOne({
      project: req.body.project,
      date: { $gte: date, $lt: tomorrow }
    })

    if (existing) {
      return res.status(400).json({ 
        message: 'Progress entry already exists for this date. Please update the existing entry.' 
      })
    }

    const progressData = {
      ...req.body,
      date: date,
      recordedBy: req.user.id
    }

    const progress = await DailyProgress.create(progressData)

    // Update project progress if provided
    if (req.body.progressPercentage) {
      const Project = (await import('../models/Project.js')).default
      await Project.findByIdAndUpdate(req.body.project, {
        progress: req.body.progressPercentage
      })
    }

    await Activity.create({
      type: 'project',
      action: 'updated',
      message: `Daily progress ${req.body.progressPercentage}% recorded for project`,
      entityId: progress.project,
      entityType: 'Project',
      project: progress.project,
      user: req.user.id
    })

    const populatedProgress = await DailyProgress.findById(progress._id)
      .populate('project', 'name location')
      .populate('recordedBy', 'name email')

    res.status(201).json({
      success: true,
      data: populatedProgress
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update daily progress entry
// @route   PUT /api/daily-progress/:id
// @access  Private
export const updateProgress = async (req, res) => {
  try {
    const progress = await DailyProgress.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('project', 'name location')
      .populate('recordedBy', 'name email')

    if (!progress) {
      return res.status(404).json({ message: 'Progress entry not found' })
    }

    // Update project progress if provided
    if (req.body.progressPercentage) {
      const Project = (await import('../models/Project.js')).default
      await Project.findByIdAndUpdate(progress.project._id, {
        progress: req.body.progressPercentage
      })
    }

    await Activity.create({
      type: 'project',
      action: 'updated',
      message: `Daily progress updated to ${progress.progressPercentage}%`,
      entityId: progress.project._id,
      entityType: 'Project',
      project: progress.project._id,
      user: req.user.id
    })

    res.json({
      success: true,
      data: progress
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Upload PDF attachment
// @route   POST /api/daily-progress/:id/upload
// @access  Private
export const uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const progress = await DailyProgress.findById(req.params.id)
    if (!progress) {
      // Delete uploaded file if progress not found
      fs.unlinkSync(req.file.path)
      return res.status(404).json({ message: 'Progress entry not found' })
    }

    // Determine file type
    const isImage = req.file.mimetype.startsWith('image/')
    const fileType = isImage ? 'image' : 'pdf'
    
    const attachment = {
      name: req.file.originalname,
      url: `/uploads/progress/${req.file.filename}`,
      type: fileType,
      uploadedAt: new Date(),
      size: req.file.size
    }

    progress.attachments.push(attachment)
    await progress.save()

    res.json({
      success: true,
      data: attachment
    })
  } catch (error) {
    // Delete file on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path)
      } catch (e) {
        // File deletion failed
      }
    }
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete attachment
// @route   DELETE /api/daily-progress/:id/attachments/:attachmentId
// @access  Private
export const deleteAttachment = async (req, res) => {
  try {
    const progress = await DailyProgress.findById(req.params.id)
    if (!progress) {
      return res.status(404).json({ message: 'Progress entry not found' })
    }

    const attachment = progress.attachments.id(req.params.attachmentId)
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' })
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', attachment.url)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    attachment.deleteOne()
    await progress.save()

    res.json({
      success: true,
      message: 'Attachment deleted'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete daily progress entry
// @route   DELETE /api/daily-progress/:id
// @access  Private
export const deleteProgress = async (req, res) => {
  try {
    const progress = await DailyProgress.findById(req.params.id)
    if (!progress) {
      return res.status(404).json({ message: 'Progress entry not found' })
    }

    // Delete all attachments
    for (const attachment of progress.attachments) {
      const filePath = path.join(__dirname, '..', attachment.url)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    await progress.deleteOne()

    res.json({
      success: true,
      message: 'Progress entry deleted'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Approve/reject progress entry
// @route   PUT /api/daily-progress/:id/approve
// @access  Private (Admin/Manager)
export const approveProgress = async (req, res) => {
  try {
    const { status, notes } = req.body
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be approved or rejected' })
    }

    const existing = await DailyProgress.findById(req.params.id)
    if (!existing) {
      return res.status(404).json({ message: 'Progress entry not found' })
    }

    const progress = await DailyProgress.findByIdAndUpdate(
      req.params.id,
      {
        status,
        approvedBy: req.user.id,
        approvedAt: new Date(),
        notes: notes || existing.notes
      },
      { new: true }
    )
      .populate('project', 'name location')
      .populate('recordedBy', 'name email')
      .populate('approvedBy', 'name email')

    res.json({
      success: true,
      data: progress
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

