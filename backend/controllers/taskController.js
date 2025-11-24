import Task from '../models/Task.js'
import Activity from '../models/Activity.js'

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    const { project, status, assignedTo } = req.query
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
    if (assignedTo) filter.assignedTo = assignedTo

    const tasks = await Task.find(filter)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('watchers', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('watchers', 'name email')
      .populate('createdBy', 'name')
      .populate('comments.user', 'name email')

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    res.json({
      success: true,
      data: task
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
  try {
    // Calculate progress based on subtasks if provided
    let progress = req.body.progress || 0
    if (req.body.subtasks && req.body.subtasks.length > 0) {
      const completedSubtasks = req.body.subtasks.filter(st => st.completed).length
      progress = Math.round((completedSubtasks / req.body.subtasks.length) * 100)
    }

    const task = await Task.create({
      ...req.body,
      progress,
      createdBy: req.user.id
    })

    await Activity.create({
      type: 'task',
      action: 'created',
      message: `Task "${task.title}" created`,
      entityId: task._id,
      entityType: 'Task',
      project: task.project,
      user: req.user.id
    })

    res.status(201).json({
      success: true,
      data: task
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  try {
    // Calculate progress based on subtasks if provided
    if (req.body.subtasks && req.body.subtasks.length > 0) {
      const completedSubtasks = req.body.subtasks.filter(st => st.completed).length
      req.body.progress = Math.round((completedSubtasks / req.body.subtasks.length) * 100)
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    // If task is completed, set completedDate
    if (req.body.status === 'completed' && !task.completedDate) {
      task.completedDate = new Date()
      await task.save()
    }

    await Activity.create({
      type: 'task',
      action: req.body.status === 'completed' ? 'completed' : 'updated',
      message: `Task "${task.title}" ${req.body.status === 'completed' ? 'completed' : 'updated'}`,
      entityId: task._id,
      entityType: 'Task',
      project: task.project,
      user: req.user.id
    })

    res.json({
      success: true,
      data: task
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    await task.deleteOne()

    await Activity.create({
      type: 'task',
      action: 'deleted',
      message: `Task "${task.title}" deleted`,
      entityId: task._id,
      entityType: 'Task',
      project: task.project,
      user: req.user.id
    })

    res.json({
      success: true,
      message: 'Task deleted'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

