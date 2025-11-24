import Project from '../models/Project.js'
import Task from '../models/Task.js'
import Issue from '../models/Issue.js'
import Attendance from '../models/Attendance.js'
import Material from '../models/Material.js'
import PettyCash from '../models/PettyCash.js'
import Consumption from '../models/Consumption.js'
import SiteTransfer from '../models/SiteTransfer.js'
import xlsx from 'xlsx'

// Get project progress report
export const getProjectProgress = async (req, res) => {
  try {
    const projects = await Project.find().select('name progress budget spent')
      .sort({ name: 1 })

    const projectData = projects.map(project => ({
      name: project.name,
      progress: project.progress || 0,
      budget: project.budget || 0,
      spent: project.spent || 0,
      remaining: (project.budget || 0) - (project.spent || 0)
    }))

    res.json({
      success: true,
      data: projectData
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get expense trend report
export const getExpenseTrend = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query // monthly, weekly, daily
    
    let startDate, endDate, groupBy
    
    if (period === 'daily') {
      // Last 7 days
      endDate = new Date()
      startDate = new Date()
      startDate.setDate(endDate.getDate() - 7)
      groupBy = 'day'
    } else if (period === 'weekly') {
      // Last 4 weeks
      endDate = new Date()
      startDate = new Date()
      startDate.setDate(endDate.getDate() - 28)
      groupBy = 'week'
    } else {
      // Last 6 months
      endDate = new Date()
      startDate = new Date()
      startDate.setMonth(endDate.getMonth() - 6)
      groupBy = 'month'
    }

    const expenses = await PettyCash.find({
      type: 'expense',
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 })

    // Group expenses by period
    const expenseData = []
    const expenseMap = {}

    expenses.forEach(expense => {
      const date = new Date(expense.date)
      let key, label

      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0]
        label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      } else if (groupBy === 'week') {
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
        label = `Week ${Math.ceil((date - startDate) / (1000 * 60 * 60 * 24 * 7))}`
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      }

      if (!expenseMap[key]) {
        expenseMap[key] = { period: label, amount: 0 }
      }
      expenseMap[key].amount += expense.amount || 0
    })

    // Convert to array and sort
    Object.keys(expenseMap).sort().forEach(key => {
      expenseData.push(expenseMap[key])
    })

    res.json({
      success: true,
      data: expenseData,
      period
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get daily report
export const getDailyReport = async (req, res) => {
  try {
    const { date } = req.query
    const reportDate = date ? new Date(date) : new Date()
    reportDate.setHours(0, 0, 0, 0)
    const nextDay = new Date(reportDate)
    nextDay.setDate(reportDate.getDate() + 1)

    const attendance = await Attendance.countDocuments({
      date: {
        $gte: reportDate,
        $lt: nextDay
      }
    })

    const tasks = await Task.countDocuments({
      createdAt: {
        $gte: reportDate,
        $lt: nextDay
      }
    })

    const issues = await Issue.countDocuments({
      createdAt: {
        $gte: reportDate,
        $lt: nextDay
      }
    })

    const expenses = await PettyCash.find({
      type: 'expense',
      date: {
        $gte: reportDate,
        $lt: nextDay
      }
    })

    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)

    res.json({
      success: true,
      data: {
        date: reportDate.toISOString().split('T')[0],
        attendance,
        tasks,
        issues,
        expenses: totalExpenses
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get weekly report
export const getWeeklyReport = async (req, res) => {
  try {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)
    endOfWeek.setHours(23, 59, 59, 999)

    const attendance = await Attendance.countDocuments({
      date: {
        $gte: startOfWeek,
        $lte: endOfWeek
      }
    })

    const tasks = await Task.countDocuments({
      createdAt: {
        $gte: startOfWeek,
        $lte: endOfWeek
      }
    })

    const issues = await Issue.countDocuments({
      createdAt: {
        $gte: startOfWeek,
        $lte: endOfWeek
      }
    })

    const expenses = await PettyCash.find({
      type: 'expense',
      date: {
        $gte: startOfWeek,
        $lte: endOfWeek
      }
    })

    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)

    res.json({
      success: true,
      data: {
        startDate: startOfWeek.toISOString().split('T')[0],
        endDate: endOfWeek.toISOString().split('T')[0],
        attendance,
        tasks,
        issues,
        expenses: totalExpenses
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get monthly report
export const getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query
    const reportMonth = month ? parseInt(month) : new Date().getMonth() + 1
    const reportYear = year ? parseInt(year) : new Date().getFullYear()

    const startDate = new Date(reportYear, reportMonth - 1, 1)
    const endDate = new Date(reportYear, reportMonth, 0, 23, 59, 59, 999)

    const attendance = await Attendance.countDocuments({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    })

    const tasks = await Task.countDocuments({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    })

    const issues = await Issue.countDocuments({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    })

    const expenses = await PettyCash.find({
      type: 'expense',
      date: {
        $gte: startDate,
        $lte: endDate
      }
    })

    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)

    res.json({
      success: true,
      data: {
        month: reportMonth,
        year: reportYear,
        attendance,
        tasks,
        issues,
        expenses: totalExpenses
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get overall report (summary)
export const getOverallReport = async (req, res) => {
  try {
    const projects = await Project.countDocuments()
    const activeProjects = await Project.countDocuments({ status: 'active' })
    const totalTasks = await Task.countDocuments()
    const totalIssues = await Issue.countDocuments()
    const totalUsers = await (await import('../models/User.js')).default.countDocuments({ isActive: true })
    
    const allProjects = await Project.find().select('budget spent')
    const totalBudget = allProjects.reduce((sum, p) => sum + (p.budget || 0), 0)
    const totalSpent = allProjects.reduce((sum, p) => sum + (p.spent || 0), 0)

    const expenses = await PettyCash.find({ type: 'expense' })
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)

    res.json({
      success: true,
      data: {
        projects: {
          total: projects,
          active: activeProjects
        },
        tasks: totalTasks,
        issues: totalIssues,
        users: totalUsers,
        budget: {
          total: totalBudget,
          spent: totalSpent,
          remaining: totalBudget - totalSpent
        },
        expenses: totalExpenses
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Export project progress as Excel
export const exportProjectProgress = async (req, res) => {
  try {
    const projects = await Project.find().select('name progress budget spent')
      .sort({ name: 1 })

    const projectData = projects.map(project => ({
      'Project Name': project.name,
      'Progress (%)': project.progress || 0,
      'Budget (₹)': project.budget || 0,
      'Spent (₹)': project.spent || 0,
      'Remaining (₹)': (project.budget || 0) - (project.spent || 0)
    }))

    // Create workbook and worksheet
    const workbook = xlsx.utils.book_new()
    const worksheet = xlsx.utils.json_to_sheet(projectData)
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 25 }, // Project Name
      { wch: 15 }, // Progress
      { wch: 18 }, // Budget
      { wch: 18 }, // Spent
      { wch: 18 }  // Remaining
    ]

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Project Progress')
    
    // Generate buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename=project-progress-report-${new Date().toISOString().split('T')[0]}.xlsx`)
    
    res.send(buffer)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Export expense trend as Excel
export const exportExpenseTrend = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query
    
    let startDate, endDate, groupBy
    
    if (period === 'daily') {
      endDate = new Date()
      startDate = new Date()
      startDate.setDate(endDate.getDate() - 7)
      groupBy = 'day'
    } else if (period === 'weekly') {
      endDate = new Date()
      startDate = new Date()
      startDate.setDate(endDate.getDate() - 28)
      groupBy = 'week'
    } else {
      endDate = new Date()
      startDate = new Date()
      startDate.setMonth(endDate.getMonth() - 6)
      groupBy = 'month'
    }

    const expenses = await PettyCash.find({
      type: 'expense',
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 })

    const expenseMap = {}
    expenses.forEach(expense => {
      const date = new Date(expense.date)
      let key, label

      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0]
        label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      } else if (groupBy === 'week') {
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        key = weekStart.toISOString().split('T')[0]
        label = `Week ${Math.ceil((date - startDate) / (1000 * 60 * 60 * 24 * 7))}`
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      }

      if (!expenseMap[key]) {
        expenseMap[key] = { period: label, amount: 0 }
      }
      expenseMap[key].amount += expense.amount || 0
    })

    const expenseData = []
    Object.keys(expenseMap).sort().forEach(key => {
      expenseData.push({
        'Period': expenseMap[key].period,
        'Amount (₹)': expenseMap[key].amount
      })
    })

    // Create workbook and worksheet
    const workbook = xlsx.utils.book_new()
    const worksheet = xlsx.utils.json_to_sheet(expenseData)
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 20 }, // Period
      { wch: 18 }  // Amount
    ]

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Expense Trend')
    
    // Generate buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename=expense-trend-report-${new Date().toISOString().split('T')[0]}.xlsx`)
    
    res.send(buffer)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Export daily report as Excel
export const exportDailyReport = async (req, res) => {
  try {
    const { date } = req.query
    const reportDate = date ? new Date(date) : new Date()
    reportDate.setHours(0, 0, 0, 0)
    const nextDay = new Date(reportDate)
    nextDay.setDate(reportDate.getDate() + 1)

    const attendance = await Attendance.countDocuments({
      date: {
        $gte: reportDate,
        $lt: nextDay
      }
    })

    const tasks = await Task.countDocuments({
      createdAt: {
        $gte: reportDate,
        $lt: nextDay
      }
    })

    const issues = await Issue.countDocuments({
      createdAt: {
        $gte: reportDate,
        $lt: nextDay
      }
    })

    const expenses = await PettyCash.find({
      type: 'expense',
      date: {
        $gte: reportDate,
        $lt: nextDay
      }
    })

    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)

    const reportData = [{
      'Date': reportDate.toISOString().split('T')[0],
      'Attendance': attendance,
      'Tasks': tasks,
      'Issues': issues,
      'Total Expenses (₹)': totalExpenses
    }]

    // Create workbook and worksheet
    const workbook = xlsx.utils.book_new()
    const worksheet = xlsx.utils.json_to_sheet(reportData)
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 15 }, // Date
      { wch: 15 }, // Attendance
      { wch: 15 }, // Tasks
      { wch: 15 }, // Issues
      { wch: 20 }  // Expenses
    ]

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Daily Report')
    
    // Generate buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename=daily-report-${reportDate.toISOString().split('T')[0]}.xlsx`)
    
    res.send(buffer)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Export weekly report as Excel
export const exportWeeklyReport = async (req, res) => {
  try {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)
    endOfWeek.setHours(23, 59, 59, 999)

    const attendance = await Attendance.countDocuments({
      date: {
        $gte: startOfWeek,
        $lte: endOfWeek
      }
    })

    const tasks = await Task.countDocuments({
      createdAt: {
        $gte: startOfWeek,
        $lte: endOfWeek
      }
    })

    const issues = await Issue.countDocuments({
      createdAt: {
        $gte: startOfWeek,
        $lte: endOfWeek
      }
    })

    const expenses = await PettyCash.find({
      type: 'expense',
      date: {
        $gte: startOfWeek,
        $lte: endOfWeek
      }
    })

    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)

    const reportData = [{
      'Start Date': startOfWeek.toISOString().split('T')[0],
      'End Date': endOfWeek.toISOString().split('T')[0],
      'Attendance': attendance,
      'Tasks': tasks,
      'Issues': issues,
      'Total Expenses (₹)': totalExpenses
    }]

    // Create workbook and worksheet
    const workbook = xlsx.utils.book_new()
    const worksheet = xlsx.utils.json_to_sheet(reportData)
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 15 }, // Start Date
      { wch: 15 }, // End Date
      { wch: 15 }, // Attendance
      { wch: 15 }, // Tasks
      { wch: 15 }, // Issues
      { wch: 20 }  // Expenses
    ]

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Weekly Report')
    
    // Generate buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename=weekly-report-${startOfWeek.toISOString().split('T')[0]}.xlsx`)
    
    res.send(buffer)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Export monthly report as Excel
export const exportMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query
    const reportMonth = month ? parseInt(month) : new Date().getMonth() + 1
    const reportYear = year ? parseInt(year) : new Date().getFullYear()

    const startDate = new Date(reportYear, reportMonth - 1, 1)
    const endDate = new Date(reportYear, reportMonth, 0, 23, 59, 59, 999)

    const attendance = await Attendance.countDocuments({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    })

    const tasks = await Task.countDocuments({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    })

    const issues = await Issue.countDocuments({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    })

    const expenses = await PettyCash.find({
      type: 'expense',
      date: {
        $gte: startDate,
        $lte: endDate
      }
    })

    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)

    const reportData = [{
      'Month': new Date(reportYear, reportMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      'Attendance': attendance,
      'Tasks': tasks,
      'Issues': issues,
      'Total Expenses (₹)': totalExpenses
    }]

    // Create workbook and worksheet
    const workbook = xlsx.utils.book_new()
    const worksheet = xlsx.utils.json_to_sheet(reportData)
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 20 }, // Month
      { wch: 15 }, // Attendance
      { wch: 15 }, // Tasks
      { wch: 15 }, // Issues
      { wch: 20 }  // Expenses
    ]

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Monthly Report')
    
    // Generate buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename=monthly-report-${reportYear}-${String(reportMonth).padStart(2, '0')}.xlsx`)
    
    res.send(buffer)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Export overall report as Excel
export const exportOverallReport = async (req, res) => {
  try {
    const projects = await Project.countDocuments()
    const activeProjects = await Project.countDocuments({ status: 'active' })
    const totalTasks = await Task.countDocuments()
    const totalIssues = await Issue.countDocuments()
    const totalUsers = await (await import('../models/User.js')).default.countDocuments({ isActive: true })
    
    const allProjects = await Project.find().select('budget spent')
    const totalBudget = allProjects.reduce((sum, p) => sum + (p.budget || 0), 0)
    const totalSpent = allProjects.reduce((sum, p) => sum + (p.spent || 0), 0)

    const expenses = await PettyCash.find({ type: 'expense' })
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)

    const reportData = [{
      'Total Projects': projects,
      'Active Projects': activeProjects,
      'Total Tasks': totalTasks,
      'Total Issues': totalIssues,
      'Total Users': totalUsers,
      'Total Budget (₹)': totalBudget,
      'Total Spent (₹)': totalSpent,
      'Remaining Budget (₹)': totalBudget - totalSpent,
      'Total Expenses (₹)': totalExpenses
    }]

    // Create workbook and worksheet
    const workbook = xlsx.utils.book_new()
    const worksheet = xlsx.utils.json_to_sheet(reportData)
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 18 }, // Total Projects
      { wch: 18 }, // Active Projects
      { wch: 15 }, // Total Tasks
      { wch: 15 }, // Total Issues
      { wch: 15 }, // Total Users
      { wch: 20 }, // Total Budget
      { wch: 20 }, // Total Spent
      { wch: 22 }, // Remaining Budget
      { wch: 20 }  // Total Expenses
    ]

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Overall Report')
    
    // Generate buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename=overall-report-${new Date().toISOString().split('T')[0]}.xlsx`)
    
    res.send(buffer)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

