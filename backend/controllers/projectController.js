import Project from '../models/Project.js'
import Activity from '../models/Activity.js'

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('projectManager', 'name email')
      .populate('team', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      count: projects.length,
      data: projects
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
export const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('projectManager', 'name email')
      .populate('team', 'name email')
      .populate('createdBy', 'name')

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    res.json({
      success: true,
      data: project
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Create project
// @route   POST /api/projects
// @access  Private
export const createProject = async (req, res) => {
  try {
    const project = await Project.create({
      ...req.body,
      createdBy: req.user.id
    })

    await Activity.create({
      type: 'project',
      action: 'created',
      message: `Project "${project.name}" created`,
      entityId: project._id,
      entityType: 'Project',
      project: project._id,
      user: req.user.id
    })

    res.status(201).json({
      success: true,
      data: project
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    await Activity.create({
      type: 'project',
      action: 'updated',
      message: `Project "${project.name}" updated`,
      entityId: project._id,
      entityType: 'Project',
      project: project._id,
      user: req.user.id
    })

    res.json({
      success: true,
      data: project
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    await project.deleteOne()

    await Activity.create({
      type: 'project',
      action: 'deleted',
      message: `Project "${project.name}" deleted`,
      entityId: project._id,
      entityType: 'Project',
      user: req.user.id
    })

    res.json({
      success: true,
      message: 'Project deleted'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

