import express from 'express'
import {
  getPettyCash,
  createPettyCash,
  updatePettyCash,
  deletePettyCash,
  getWeeklyExpenses
} from '../controllers/pettyCashController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.route('/')
  .get(protect, getPettyCash)
  .post(protect, createPettyCash)

router.route('/weekly')
  .get(protect, getWeeklyExpenses)

router.route('/:id')
  .put(protect, updatePettyCash)
  .delete(protect, deletePettyCash)

export default router

