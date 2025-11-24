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
    // Get current user to check their assigned projects
    const User = (await import('../models/User.js')).default
    const currentUser = await User.findById(req.user.id).select('role projects')
    
    // Build project filter for non-admin users
    let projectFilter = {}
    let projectIds = []
    
    if (currentUser.role !== 'admin') {
      if (currentUser.projects && currentUser.projects.length > 0) {
        // Convert to ObjectIds if they're strings
        projectIds = currentUser.projects.map(p => 
          typeof p === 'string' ? p : p._id || p
        )
        projectFilter._id = { $in: projectIds }
      } else {
        // If user has no assigned projects, return empty dashboard
        return res.json({
          success: true,
          data: {
            kpis: {
              activeProjects: 0,
              dailyAttendance: 0,
              activeTasks: 0,
              pendingIssues: 0
            },
            materialStockData: [],
            projectProgress: 0,
            activityFeed: [],
            activeTasksList: [],
            pettyCash: {
              balance: 0,
              totalExpenses: 0,
              totalIncome: 0
            }
          }
        })
      }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get active projects count (filtered by assigned projects)
    const activeProjectsFilter = { status: 'active', ...projectFilter }
    const activeProjects = await Project.countDocuments(activeProjectsFilter)

    // Get today's attendance (filtered by assigned projects)
    const todayAttendanceFilter = { date: { $gte: today } }
    if (currentUser.role !== 'admin' && projectIds.length > 0) {
      todayAttendanceFilter.project = { $in: projectIds }
    }
    const todayAttendance = await Attendance.countDocuments(todayAttendanceFilter)

    // Get active tasks count (filtered by assigned projects)
    const activeTasksFilter = { status: { $in: ['pending', 'in-progress'] } }
    if (currentUser.role !== 'admin' && projectIds.length > 0) {
      activeTasksFilter.project = { $in: projectIds }
    }
    const activeTasks = await Task.countDocuments(activeTasksFilter)

    // Get pending issues count (filtered by assigned projects)
    const pendingIssuesFilter = { status: { $in: ['open', 'in-progress'] } }
    if (currentUser.role !== 'admin' && projectIds.length > 0) {
      pendingIssuesFilter.project = { $in: projectIds }
    }
    const pendingIssues = await Issue.countDocuments(pendingIssuesFilter)

    // Get material stock levels (no project filter needed - materials are global)
    const materials = await Material.find().select('name category currentStock capacity')
    const materialStockData = materials.map(m => ({
      name: m.name,
      stock: m.currentStock,
      capacity: m.capacity
    }))

    // Calculate overall project progress (filtered by assigned projects)
    const projects = await Project.find(projectFilter)
    const totalProgress = projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
      : 0

    // Get recent activities (filtered by assigned projects)
    const activitiesFilter = {}
    if (currentUser.role !== 'admin' && projectIds.length > 0) {
      activitiesFilter.project = { $in: projectIds }
    }
    const activities = await Activity.find(activitiesFilter)
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

    // Get active tasks with details (filtered by assigned projects)
    const tasks = await Task.find(activeTasksFilter)
      .populate('project', 'name')
      .limit(4)
      .lean()

    const activeTasksList = tasks.map(task => ({
      title: task.title,
      project: task.project?.name || 'N/A',
      progress: task.progress,
      priority: task.priority
    }))

    // Get petty cash balance (filtered by assigned projects)
    const pettyCashFilter = {}
    if (currentUser.role !== 'admin' && projectIds.length > 0) {
      pettyCashFilter.project = { $in: projectIds }
    }
    const pettyCashEntries = await PettyCash.find(pettyCashFilter)
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

