import express from 'express'
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.route('/')
  .get(protect, getTasks)
  .post(protect, createTask)

router.route('/:id')
  .get(protect, getTask)
  .put(protect, updateTask)
  .delete(protect, deleteTask)

export default router

