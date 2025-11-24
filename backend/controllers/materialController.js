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

export const uploadMaterials = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const file = req.file

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ]

    if (!allowedTypes.includes(file.mimetype) && !file.originalname.match(/\.(xlsx|xls|csv)$/i)) {
      return res.status(400).json({ 
        message: 'Invalid file type. Please upload XLSX, XLS, or CSV file.' 
      })
    }

    // TODO: Implement Excel/CSV parsing using xlsx library
    // For now, return a placeholder response
    // You'll need to install: npm install multer xlsx
    res.json({
      success: true,
      message: 'File uploaded successfully. Excel parsing to be implemented.',
      fileName: file.originalname,
      fileSize: file.size
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

