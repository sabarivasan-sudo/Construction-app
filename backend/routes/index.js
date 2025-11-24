import express from 'express'
import authRoutes from './authRoutes.js'
import dashboardRoutes from './dashboardRoutes.js'
import projectRoutes from './projectRoutes.js'
import taskRoutes from './taskRoutes.js'
import issueRoutes from './issueRoutes.js'
import attendanceRoutes from './attendanceRoutes.js'
import materialRoutes from './materialRoutes.js'
import siteTransferRoutes from './siteTransferRoutes.js'
import consumptionRoutes from './consumptionRoutes.js'
import pettyCashRoutes from './pettyCashRoutes.js'
import resourceRoutes from './resourceRoutes.js'
import userRoutes from './userRoutes.js'
import roleRoutes from './roleRoutes.js'
import reportRoutes from './reportRoutes.js'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/projects', projectRoutes)
router.use('/tasks', taskRoutes)
router.use('/issues', issueRoutes)
router.use('/attendance', attendanceRoutes)
router.use('/materials', materialRoutes)
router.use('/transfers', siteTransferRoutes)
router.use('/consumption', consumptionRoutes)
router.use('/petty-cash', pettyCashRoutes)
router.use('/resources', resourceRoutes)
router.use('/users', userRoutes)
router.use('/roles', roleRoutes)
router.use('/reports', reportRoutes)

export default router

