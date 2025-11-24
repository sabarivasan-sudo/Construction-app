import SiteTransfer from '../models/SiteTransfer.js'
import Material from '../models/Material.js'
import Activity from '../models/Activity.js'

export const getTransfers = async (req, res) => {
  try {
    const transfers = await SiteTransfer.find()
      .populate('material', 'name unit category')
      .populate('transferredBy', 'name email')
      .sort({ transferDate: -1 })

    res.json({
      success: true,
      count: transfers.length,
      data: transfers
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getTransfer = async (req, res) => {
  try {
    const transfer = await SiteTransfer.findById(req.params.id)
      .populate('material', 'name unit category')
      .populate('transferredBy', 'name email')

    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' })
    }

    res.json({
      success: true,
      data: transfer
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createTransfer = async (req, res) => {
  try {
    const transfer = await SiteTransfer.create({
      ...req.body,
      transferredBy: req.user.id
    })

    await transfer.populate('material', 'name unit category')
    await transfer.populate('transferredBy', 'name email')

    await Activity.create({
      type: 'transfer',
      action: 'created',
      message: `Material transfer created: ${transfer.quantity} units from ${transfer.fromSite} to ${transfer.toSite}`,
      entityId: transfer._id,
      entityType: 'SiteTransfer',
      user: req.user.id
    })

    res.status(201).json({
      success: true,
      data: transfer
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateTransfer = async (req, res) => {
  try {
    const transfer = await SiteTransfer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('material', 'name unit category')
      .populate('transferredBy', 'name email')

    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' })
    }

    await Activity.create({
      type: 'transfer',
      action: 'updated',
      message: `Material transfer updated: ${transfer.status}`,
      entityId: transfer._id,
      entityType: 'SiteTransfer',
      user: req.user.id
    })

    res.json({
      success: true,
      data: transfer
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteTransfer = async (req, res) => {
  try {
    const transfer = await SiteTransfer.findById(req.params.id)

    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' })
    }

    await transfer.deleteOne()

    res.json({
      success: true,
      message: 'Transfer deleted'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

