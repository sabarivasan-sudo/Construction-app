import Project from '../models/Project.js'
import Task from '../models/Task.js'
import Issue from '../models/Issue.js'
import Attendance from '../models/Attendance.js'
import Material from '../models/Material.js'
import Activity from '../models/Activity.js'
import PettyCash from '../models/PettyCash.js'

// @desc    Get dashboard statistics
// @route   GET /api/dashboard
// @access  Private
export const getDashboard = async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get active projects count
    const activeProjects = await Project.countDocuments({ status: 'active' })

    // Get today's attendance
    const todayAttendance = await Attendance.countDocuments({
      date: { $gte: today }
    })

    // Get active tasks count
    const activeTasks = await Task.countDocuments({
      status: { $in: ['pending', 'in-progress'] }
    })

    // Get pending issues count
    const pendingIssues = await Issue.countDocuments({
      status: { $in: ['open', 'in-progress'] }
    })

    // Get material stock levels
    const materials = await Material.find().select('name category currentStock capacity')
    const materialStockData = materials.map(m => ({
      name: m.name,
      stock: m.currentStock,
      capacity: m.capacity
    }))

    // Calculate overall project progress
    const projects = await Project.find()
    const totalProgress = projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
      : 0

    // Get recent activities
    const activities = await Activity.find()
      .populate('user', 'name')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()

    const activityFeed = activities.map(activity => ({
      id: activity._id,
      type: activity.type,
      message: activity.message,
      time: getTimeAgo(activity.createdAt),
      user: activity.user?.name || 'System'
    }))

    // Get active tasks with details
    const tasks = await Task.find({ status: { $in: ['pending', 'in-progress'] } })
      .populate('project', 'name')
      .limit(4)
      .lean()

    const activeTasksList = tasks.map(task => ({
      title: task.title,
      project: task.project?.name || 'N/A',
      progress: task.progress,
      priority: task.priority
    }))

    // Get petty cash balance
    const pettyCashEntries = await PettyCash.find()
    const totalExpenses = pettyCashEntries
      .filter(entry => entry.type === 'expense')
      .reduce((sum, entry) => sum + entry.amount, 0)
    const totalIncome = pettyCashEntries
      .filter(entry => entry.type === 'income')
      .reduce((sum, entry) => sum + entry.amount, 0)
    const pettyCashBalance = totalIncome - totalExpenses

    res.json({
      success: true,
      data: {
        kpis: {
          activeProjects,
          dailyAttendance: todayAttendance,
          activeTasks,
          pendingIssues
        },
        materialStockData,
        projectProgress: totalProgress,
        activityFeed,
        activeTasksList,
        pettyCash: {
          balance: pettyCashBalance,
          totalExpenses,
          totalIncome
        }
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Helper function to get time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  
  if (seconds < 60) return `${seconds} seconds ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  return `${Math.floor(seconds / 86400)} days ago`
}

