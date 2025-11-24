import express from 'express'
import multer from 'multer'
import {
  getMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  uploadMaterials
} from '../controllers/materialController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ]
    
    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls|csv)$/i)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Please upload XLSX, XLS, or CSV file.'), false)
    }
  }
})

router.route('/')
  .get(protect, getMaterials)
  .post(protect, createMaterial)

router.route('/upload')
  .post(protect, upload.single('file'), uploadMaterials)

router.route('/:id')
  .get(protect, getMaterial)
  .put(protect, updateMaterial)
  .delete(protect, deleteMaterial)

export default router

