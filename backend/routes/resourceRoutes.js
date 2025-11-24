import express from 'express'
import {
  getResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  getResourceSummary
} from '../controllers/resourceController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.route('/')
  .get(protect, getResources)
  .post(protect, createResource)

router.route('/summary')
  .get(protect, getResourceSummary)

router.route('/:id')
  .get(protect, getResource)
  .put(protect, updateResource)
  .delete(protect, deleteResource)

export default router

