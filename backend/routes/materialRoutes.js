import express from 'express'
import {
  getMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial
} from '../controllers/materialController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.route('/')
  .get(protect, getMaterials)
  .post(protect, createMaterial)

router.route('/:id')
  .get(protect, getMaterial)
  .put(protect, updateMaterial)
  .delete(protect, deleteMaterial)

export default router

