import express from 'express'
import {
  getAttendances,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  uploadAttendance
} from '../controllers/attendanceController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.route('/')
  .get(protect, getAttendances)
  .post(protect, createAttendance)

router.route('/upload')
  .post(protect, uploadAttendance)

router.route('/:id')
  .put(protect, updateAttendance)
  .delete(protect, deleteAttendance)

export default router

