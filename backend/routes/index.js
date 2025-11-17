import express from 'express'
import authRoutes from './authRoutes.js'
import dashboardRoutes from './dashboardRoutes.js'
import projectRoutes from './projectRoutes.js'
import taskRoutes from './taskRoutes.js'
import issueRoutes from './issueRoutes.js'
import attendanceRoutes from './attendanceRoutes.js'
import materialRoutes from './materialRoutes.js'
import pettyCashRoutes from './pettyCashRoutes.js'
import userRoutes from './userRoutes.js'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/projects', projectRoutes)
router.use('/tasks', taskRoutes)
router.use('/issues', issueRoutes)
router.use('/attendance', attendanceRoutes)
router.use('/materials', materialRoutes)
router.use('/petty-cash', pettyCashRoutes)
router.use('/users', userRoutes)

export default router

