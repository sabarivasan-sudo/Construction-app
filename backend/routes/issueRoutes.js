import express from 'express'
import {
  getIssues,
  getIssue,
  createIssue,
  updateIssue,
  deleteIssue
} from '../controllers/issueController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.route('/')
  .get(protect, getIssues)
  .post(protect, createIssue)

router.route('/:id')
  .get(protect, getIssue)
  .put(protect, updateIssue)
  .delete(protect, deleteIssue)

export default router

