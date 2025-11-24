import express from 'express'
import {
  getProjectProgress,
  getExpenseTrend,
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport,
  getOverallReport,
  exportProjectProgress,
  exportExpenseTrend,
  exportDailyReport,
  exportWeeklyReport,
  exportMonthlyReport,
  exportOverallReport
} from '../controllers/reportController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/project-progress', protect, getProjectProgress)
router.get('/expense-trend', protect, getExpenseTrend)
router.get('/daily', protect, getDailyReport)
router.get('/weekly', protect, getWeeklyReport)
router.get('/monthly', protect, getMonthlyReport)
router.get('/overall', protect, getOverallReport)

// Export routes
router.get('/export/project-progress', protect, exportProjectProgress)
router.get('/export/expense-trend', protect, exportExpenseTrend)
router.get('/export/daily', protect, exportDailyReport)
router.get('/export/weekly', protect, exportWeeklyReport)
router.get('/export/monthly', protect, exportMonthlyReport)
router.get('/export/overall', protect, exportOverallReport)

export default router

