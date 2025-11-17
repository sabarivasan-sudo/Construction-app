import express from 'express'
import {
  getAttendances,
  createAttendance,
  updateAttendance
} from '../controllers/attendanceController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.route('/')
  .get(protect, getAttendances)
  .post(protect, createAttendance)

router.route('/:id')
  .put(protect, updateAttendance)

export default router

