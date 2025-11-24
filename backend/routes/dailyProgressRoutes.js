import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  getDailyProgress,
  getTodayProgress,
  getProgress,
  createProgress,
  updateProgress,
  deleteProgress,
  uploadAttachment,
  deleteAttachment,
  approveProgress
} from '../controllers/dailyProgressController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure multer for PDF and Image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads/progress')
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `progress-${uniqueSuffix}${path.extname(file.originalname)}`)
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ]
    const allowedExtensions = /\.(pdf|jpg|jpeg|png|gif|webp)$/i
    
    if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.test(file.originalname)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Please upload PDF or image file (JPG, PNG, GIF, WEBP).'), false)
    }
  }
})

router.route('/')
  .get(protect, getDailyProgress)
  .post(protect, createProgress)

router.route('/today/:projectId')
  .get(protect, getTodayProgress)

router.route('/:id')
  .get(protect, getProgress)
  .put(protect, updateProgress)
  .delete(protect, deleteProgress)

router.route('/:id/upload')
  .post(protect, upload.single('file'), uploadAttachment)

router.route('/:id/attachments/:attachmentId')
  .delete(protect, deleteAttachment)

router.route('/:id/approve')
  .put(protect, approveProgress)

export default router

