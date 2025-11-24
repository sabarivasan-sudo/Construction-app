import Consumption from '../models/Consumption.js'
import Material from '../models/Material.js'
import Activity from '../models/Activity.js'

export const getConsumptions = async (req, res) => {
  try {
    const { project, material, startDate, endDate } = req.query
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
    if (material) filter.material = material
    if (startDate || endDate) {
      filter.consumptionDate = {}
      if (startDate) filter.consumptionDate.$gte = new Date(startDate)
      if (endDate) filter.consumptionDate.$lte = new Date(endDate)
    }

    const consumptions = await Consumption.find(filter)
      .populate('material', 'name unit category')
      .populate('project', 'name')
      .populate('recordedBy', 'name email')
      .sort({ consumptionDate: -1 })

    res.json({
      success: true,
      count: consumptions.length,
      data: consumptions
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getConsumption = async (req, res) => {
  try {
    const consumption = await Consumption.findById(req.params.id)
      .populate('material', 'name unit category')
      .populate('project', 'name')
      .populate('recordedBy', 'name email')

    if (!consumption) {
      return res.status(404).json({ message: 'Consumption not found' })
    }

    res.json({
      success: true,
      data: consumption
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createConsumption = async (req, res) => {
  try {
    // Get material to get unit
    const material = await Material.findById(req.body.material)
    if (!material) {
      return res.status(404).json({ message: 'Material not found' })
    }

    const consumption = await Consumption.create({
      ...req.body,
      unit: material.unit,
      recordedBy: req.user.id
    })

    // Update material stock (reduce by consumed quantity)
    if (req.body.updateStock !== false) {
      material.currentStock = Math.max(0, (material.currentStock || 0) - (req.body.quantity || 0))
      await material.save()
    }

    await consumption.populate('material', 'name unit category')
    await consumption.populate('project', 'name')
    await consumption.populate('recordedBy', 'name email')

    await Activity.create({
      type: 'consumption',
      action: 'consumed',
      message: `Material consumption recorded: ${consumption.quantity} ${material.unit} of ${material.name}`,
      entityId: consumption._id,
      entityType: 'Consumption',
      project: consumption.project,
      user: req.user.id
    })

    res.status(201).json({
      success: true,
      data: consumption
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateConsumption = async (req, res) => {
  try {
    const consumption = await Consumption.findById(req.params.id)
    if (!consumption) {
      return res.status(404).json({ message: 'Consumption not found' })
    }

    // If quantity changed, adjust material stock
    if (req.body.quantity && req.body.quantity !== consumption.quantity) {
      const material = await Material.findById(consumption.material)
      if (material) {
        const quantityDiff = consumption.quantity - req.body.quantity
        material.currentStock = Math.max(0, (material.currentStock || 0) + quantityDiff)
        await material.save()
      }
    }

    const updatedConsumption = await Consumption.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('material', 'name unit category')
      .populate('project', 'name')
      .populate('recordedBy', 'name email')

    await Activity.create({
      type: 'consumption',
      action: 'updated',
      message: `Material consumption updated`,
      entityId: updatedConsumption._id,
      entityType: 'Consumption',
      project: updatedConsumption.project,
      user: req.user.id
    })

    res.json({
      success: true,
      data: updatedConsumption
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteConsumption = async (req, res) => {
  try {
    const consumption = await Consumption.findById(req.params.id)
    if (!consumption) {
      return res.status(404).json({ message: 'Consumption not found' })
    }

    // Restore material stock
    const material = await Material.findById(consumption.material)
    if (material) {
      material.currentStock = (material.currentStock || 0) + (consumption.quantity || 0)
      await material.save()
    }

    await consumption.deleteOne()

    res.json({
      success: true,
      message: 'Consumption deleted'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get weekly consumption data for chart
export const getWeeklyConsumption = async (req, res) => {
  try {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    const consumptions = await Consumption.find({
      consumptionDate: {
        $gte: startOfWeek,
        $lte: endOfWeek
      }
    })
      .populate('material', 'name unit category')

    // Group by day and material
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const chartData = dayNames.map((day, index) => {
      const dayDate = new Date(startOfWeek)
      dayDate.setDate(startOfWeek.getDate() + index)
      dayDate.setHours(0, 0, 0, 0)
      const nextDay = new Date(dayDate)
      nextDay.setDate(dayDate.getDate() + 1)

      const dayConsumptions = consumptions.filter(c => {
        const consDate = new Date(c.consumptionDate)
        return consDate >= dayDate && consDate < nextDay
      })

      const data = { name: day }
      
      // Group by material category
      const categories = ['cement', 'steel', 'bricks', 'sand', 'gravel']
      categories.forEach(category => {
        const categoryConsumptions = dayConsumptions.filter(c => 
          c.material?.category === category
        )
        data[category] = categoryConsumptions.reduce((sum, c) => sum + (c.quantity || 0), 0)
      })

      return data
    })

    res.json({
      success: true,
      data: chartData
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

