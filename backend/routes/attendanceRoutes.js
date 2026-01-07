import express from 'express'
import multer from 'multer'
import {
  getAttendances,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  uploadAttendance
} from '../controllers/attendanceController.js'
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
  .get(protect, getAttendances)
  .post(protect, createAttendance)

router.route('/upload')
  .post(protect, upload.single('file'), uploadAttendance)

router.route('/:id')
  .put(protect, updateAttendance)
  .delete(protect, deleteAttendance)

export default router

