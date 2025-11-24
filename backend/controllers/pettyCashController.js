import PettyCash from '../models/PettyCash.js'
import Activity from '../models/Activity.js'

export const getPettyCash = async (req, res) => {
  try {
    const { project, type, startDate, endDate } = req.query
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
          totals: {
            expenses: 0,
            income: 0,
            balance: 0
          },
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
          totals: {
            expenses: 0,
            income: 0,
            balance: 0
          },
          data: []
        })
      }
    }
    if (type) filter.type = type
    if (startDate || endDate) {
      filter.date = {}
      if (startDate) filter.date.$gte = new Date(startDate)
      if (endDate) filter.date.$lte = new Date(endDate)
    }

    const transactions = await PettyCash.find(filter)
      .populate('project', 'name')
      .populate('recordedBy', 'name')
      .sort({ date: -1 })

    // Calculate totals
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const balance = totalIncome - totalExpenses

    res.json({
      success: true,
      count: transactions.length,
      totals: {
        expenses: totalExpenses,
        income: totalIncome,
        balance
      },
      data: transactions
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createPettyCash = async (req, res) => {
  try {
    const transaction = await PettyCash.create({
      ...req.body,
      recordedBy: req.user.id
    })

    await transaction.populate('project', 'name')
    await transaction.populate('recordedBy', 'name email')

    await Activity.create({
      type: 'petty-cash',
      action: 'created',
      message: `Petty cash ${transaction.type}: ₹${transaction.amount} - ${transaction.description}`,
      entityId: transaction._id,
      entityType: 'PettyCash',
      project: transaction.project,
      user: req.user.id
    })

    res.status(201).json({
      success: true,
      data: transaction
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updatePettyCash = async (req, res) => {
  try {
    const transaction = await PettyCash.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('project', 'name')
      .populate('recordedBy', 'name email')

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' })
    }

    await Activity.create({
      type: 'petty-cash',
      action: 'updated',
      message: `Petty cash transaction updated: ₹${transaction.amount}`,
      entityId: transaction._id,
      entityType: 'PettyCash',
      project: transaction.project,
      user: req.user.id
    })

    res.json({
      success: true,
      data: transaction
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deletePettyCash = async (req, res) => {
  try {
    const transaction = await PettyCash.findById(req.params.id)

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' })
    }

    await transaction.deleteOne()

    res.json({
      success: true,
      message: 'Transaction deleted'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get weekly expenses data for chart
export const getWeeklyExpenses = async (req, res) => {
  try {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    const transactions = await PettyCash.find({
      type: 'expense',
      date: {
        $gte: startOfWeek,
        $lte: endOfWeek
      }
    })

    // Group by day
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const chartData = dayNames.map((day, index) => {
      const dayDate = new Date(startOfWeek)
      dayDate.setDate(startOfWeek.getDate() + index)
      dayDate.setHours(0, 0, 0, 0)
      const nextDay = new Date(dayDate)
      nextDay.setDate(dayDate.getDate() + 1)

      const dayExpenses = transactions.filter(t => {
        const transDate = new Date(t.date)
        return transDate >= dayDate && transDate < nextDay
      })

      const amount = dayExpenses.reduce((sum, t) => sum + (t.amount || 0), 0)

      return {
        day,
        amount: Math.round(amount)
      }
    })

    res.json({
      success: true,
      data: chartData
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

