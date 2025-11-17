import PettyCash from '../models/PettyCash.js'
import Activity from '../models/Activity.js'

export const getPettyCash = async (req, res) => {
  try {
    const { project, type, startDate, endDate } = req.query
    const filter = {}

    if (project) filter.project = project
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

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' })
    }

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

