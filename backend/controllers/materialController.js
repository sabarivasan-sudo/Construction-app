import Material from '../models/Material.js'
import Activity from '../models/Activity.js'

export const getMaterials = async (req, res) => {
  try {
    const materials = await Material.find().sort({ name: 1 })

    res.json({
      success: true,
      count: materials.length,
      data: materials
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)

    if (!material) {
      return res.status(404).json({ message: 'Material not found' })
    }

    res.json({
      success: true,
      data: material
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createMaterial = async (req, res) => {
  try {
    const material = await Material.create(req.body)

    await Activity.create({
      type: 'material',
      action: 'created',
      message: `Material "${material.name}" added to inventory`,
      entityId: material._id,
      entityType: 'Material',
      user: req.user.id
    })

    res.status(201).json({
      success: true,
      data: material
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!material) {
      return res.status(404).json({ message: 'Material not found' })
    }

    await Activity.create({
      type: 'material',
      action: 'updated',
      message: `Material "${material.name}" stock updated - ${material.currentStock} units`,
      entityId: material._id,
      entityType: 'Material',
      user: req.user.id
    })

    res.json({
      success: true,
      data: material
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)

    if (!material) {
      return res.status(404).json({ message: 'Material not found' })
    }

    await material.deleteOne()

    res.json({
      success: true,
      message: 'Material deleted'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

