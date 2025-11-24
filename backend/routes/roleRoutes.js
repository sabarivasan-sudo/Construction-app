import express from 'express'
import {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole
} from '../controllers/roleController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

router.route('/')
  .get(protect, getRoles)
  .post(protect, authorize('admin'), createRole)

router.route('/:id')
  .get(protect, getRole)
  .put(protect, authorize('admin'), updateRole)
  .delete(protect, authorize('admin'), deleteRole)

export default router

