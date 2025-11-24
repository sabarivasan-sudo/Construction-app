import Issue from '../models/Issue.js'
import Activity from '../models/Activity.js'

export const getIssues = async (req, res) => {
  try {
    const { project, status, severity } = req.query
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
    if (status) filter.status = status
    if (severity) filter.severity = severity

    const issues = await Issue.find(filter)
      .populate('project', 'name')
      .populate('task', 'title')
      .populate('assignedTo', 'name email')
      .populate('watchers', 'name email')
      .populate('reportedBy', 'name')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      count: issues.length,
      data: issues
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('project', 'name')
      .populate('task', 'title')
      .populate('assignedTo', 'name email')
      .populate('watchers', 'name email')
      .populate('reportedBy', 'name')
      .populate('comments.user', 'name email')

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' })
    }

    res.json({
      success: true,
      data: issue
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createIssue = async (req, res) => {
  try {
    const issue = await Issue.create({
      ...req.body,
      reportedBy: req.user.id
    })

    await Activity.create({
      type: 'issue',
      action: 'created',
      message: `Issue "${issue.title}" reported`,
      entityId: issue._id,
      entityType: 'Issue',
      project: issue.project,
      user: req.user.id
    })

    res.status(201).json({
      success: true,
      data: issue
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateIssue = async (req, res) => {
  try {
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' })
    }

    if (req.body.status === 'resolved' && !issue.resolvedDate) {
      issue.resolvedDate = new Date()
      await issue.save()
    }

    await Activity.create({
      type: 'issue',
      action: req.body.status === 'resolved' ? 'resolved' : 'updated',
      message: `Issue "${issue.title}" ${req.body.status === 'resolved' ? 'resolved' : 'updated'}`,
      entityId: issue._id,
      entityType: 'Issue',
      project: issue.project,
      user: req.user.id
    })

    res.json({
      success: true,
      data: issue
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' })
    }

    await issue.deleteOne()

    res.json({
      success: true,
      message: 'Issue deleted'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

