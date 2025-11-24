import Resource from '../models/Resource.js'
import Activity from '../models/Activity.js'

export const getResources = async (req, res) => {
  try {
    const { type, project, status } = req.query
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

    if (type) filter.type = type
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

    const resources = await Resource.find(filter)
      .populate('project', 'name')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      count: resources.length,
      data: resources
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('project', 'name')
      .populate('assignedBy', 'name email')

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' })
    }

    res.json({
      success: true,
      data: resource
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createResource = async (req, res) => {
  try {
    const resource = await Resource.create({
      ...req.body,
      assignedBy: req.user.id
    })

    await resource.populate('project', 'name')
    await resource.populate('assignedBy', 'name email')

    await Activity.create({
      type: 'resource',
      action: 'created',
      message: `Resource "${resource.name}" (${resource.type}) added to project`,
      entityId: resource._id,
      entityType: 'Resource',
      project: resource.project,
      user: req.user.id
    })

    res.status(201).json({
      success: true,
      data: resource
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('project', 'name')
      .populate('assignedBy', 'name email')

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' })
    }

    await Activity.create({
      type: 'resource',
      action: 'updated',
      message: `Resource "${resource.name}" updated`,
      entityId: resource._id,
      entityType: 'Resource',
      project: resource.project,
      user: req.user.id
    })

    res.json({
      success: true,
      data: resource
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' })
    }

    await resource.deleteOne()

    res.json({
      success: true,
      message: 'Resource deleted'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get resource summary grouped by type
export const getResourceSummary = async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate('project', 'name')

    // Group by type and name
    const summary = {
      labour: {},
      machinery: {},
      subcontractor: {}
    }

    resources.forEach(resource => {
      const type = resource.type
      const name = resource.name

      if (!summary[type][name]) {
        summary[type][name] = {
          name,
          count: 0,
          status: resource.status,
          projects: new Set()
        }
      }

      summary[type][name].count += resource.quantity || 1
      if (resource.project) {
        summary[type][name].projects.add(
          typeof resource.project === 'object' ? resource.project.name : resource.project
        )
      }
    })

    // Convert to arrays and format
    const formatted = {
      labour: Object.values(summary.labour).map(item => ({
        name: item.name,
        count: item.count,
        status: item.status,
        projects: Array.from(item.projects).length
      })),
      machinery: Object.values(summary.machinery).map(item => ({
        name: item.name,
        count: item.count,
        status: item.status,
        projects: Array.from(item.projects).length
      })),
      subcontractor: Object.values(summary.subcontractor).map(item => ({
        name: item.name,
        count: item.count,
        status: item.status,
        projects: Array.from(item.projects).length
      }))
    }

    res.json({
      success: true,
      data: formatted
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

