import express from 'express'
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

router.route('/')
  .get(protect, authorize('admin', 'manager'), getUsers)
  .post(protect, authorize('admin', 'manager'), createUser)

router.route('/:id')
  .get(protect, getUser)
  .put(protect, updateUser)
  .delete(protect, authorize('admin'), deleteUser)

export default router

