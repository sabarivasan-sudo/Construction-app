import express from 'express'
import {
  getTransfers,
  getTransfer,
  createTransfer,
  updateTransfer,
  deleteTransfer
} from '../controllers/siteTransferController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.route('/')
  .get(protect, getTransfers)
  .post(protect, createTransfer)

router.route('/:id')
  .get(protect, getTransfer)
  .put(protect, updateTransfer)
  .delete(protect, deleteTransfer)

export default router

