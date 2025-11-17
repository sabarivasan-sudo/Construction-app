import Issue from '../models/Issue.js'
import Activity from '../models/Activity.js'

export const getIssues = async (req, res) => {
  try {
    const { project, status, severity } = req.query
    const filter = {}

    if (project) filter.project = project
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

