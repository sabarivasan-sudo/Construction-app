import express from 'express'
import {
  getConsumptions,
  getConsumption,
  createConsumption,
  updateConsumption,
  deleteConsumption,
  getWeeklyConsumption
} from '../controllers/consumptionController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.route('/')
  .get(protect, getConsumptions)
  .post(protect, createConsumption)

router.route('/weekly')
  .get(protect, getWeeklyConsumption)

router.route('/:id')
  .get(protect, getConsumption)
  .put(protect, updateConsumption)
  .delete(protect, deleteConsumption)

export default router

