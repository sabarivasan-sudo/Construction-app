import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  FiDownload, FiBarChart2, FiCalendar, FiFileText, FiX, FiSearch
} from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import Toast from '../components/Toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Reports = () => {
  const [projectData, setProjectData] = useState([])
  const [expenseData, setExpenseData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [toasts, setToasts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  const reportTypes = [
    { id: 'daily', name: 'Daily Report', icon: FiCalendar, color: 'primary' },
    { id: 'weekly', name: 'Weekly Report', icon: FiBarChart2, color: 'secondary' },
    { id: 'monthly', name: 'Monthly Report', icon: FiFileText, color: 'success' },
    { id: 'overall', name: 'Overall Report', icon: FiBarChart2, color: 'dark' },
  ]

  // Fetch data
  useEffect(() => {
    fetchProjectProgress()
    fetchExpenseTrend()
  }, [])

  const fetchProjectProgress = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/login'
        return
      }

      const response = await fetch(`${API_URL}/reports/project-progress`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProjectData(data.data || [])
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const fetchExpenseTrend = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`${API_URL}/reports/expense-trend?period=monthly`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setExpenseData(data.data || [])
      }
    } catch (error) {
    }
  }

  const fetchReport = async (reportType) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      let url = ''
      if (reportType === 'daily') {
        url = `${API_URL}/reports/daily`
      } else if (reportType === 'weekly') {
        url = `${API_URL}/reports/weekly`
      } else if (reportType === 'monthly') {
        url = `${API_URL}/reports/monthly`
      } else if (reportType === 'overall') {
        url = `${API_URL}/reports/overall`
      }

      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setReportData(data.data)
        setSelectedReport(reportType)
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch report' }))
        showToast(errorData.message || 'Failed to fetch report', 'error')
      }
    } catch (error) {
      showToast('Error fetching report', 'error')
    }
  }

  const showToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), 4000)
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const handleExport = async (type) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/login'
        return
      }

      let url = ''
      
      if (type === 'project-progress') {
        url = `${API_URL}/reports/export/project-progress`
      } else if (type === 'expense-trend') {
        url = `${API_URL}/reports/export/expense-trend?period=monthly`
      } else if (type === 'daily') {
        url = `${API_URL}/reports/export/daily`
      } else if (type === 'weekly') {
        url = `${API_URL}/reports/export/weekly`
      } else if (type === 'monthly') {
        url = `${API_URL}/reports/export/monthly`
      } else if (type === 'overall') {
        url = `${API_URL}/reports/export/overall`
      } else {
        showToast('Export not available for this report', 'error')
        return
      }

      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const contentDisposition = response.headers.get('Content-Disposition')
        let filename = `${type}-report.xlsx`
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i)
          if (filenameMatch) {
            filename = filenameMatch[1]
          }
        }

        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        showToast('Report exported successfully as Excel', 'success')
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to export report' }))
        showToast(errorData.message || 'Failed to export report', 'error')
      }
    } catch (error) {
      showToast('Error exporting report', 'error')
    }
  }

  // Filter projects based on search
  const filteredProjects = projectData.filter(project =>
    project.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading reports...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark mb-2">Reports</h1>
        <p className="text-sm sm:text-base text-gray-500">Generate and view construction reports</p>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search projects, tasks, materials..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent shadow-sm"
        />
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {reportTypes.map((report, index) => {
          const Icon = report.icon
          const colorMap = {
            primary: { bg: 'bg-[#6B4EFF]/10', text: 'text-[#6B4EFF]' },
            secondary: { bg: 'bg-purple-500/10', text: 'text-purple-500' },
            success: { bg: 'bg-green-500/10', text: 'text-green-500' },
            dark: { bg: 'bg-gray-500/10', text: 'text-gray-600' },
          }
          const colors = colorMap[report.color] || colorMap.primary
          return (
            <motion.button
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => fetchReport(report.id)}
              className="bg-white rounded-xl p-6 shadow-soft card-hover text-left"
            >
              <div className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${colors.text}`} />
              </div>
              <h3 className="font-bold text-dark">{report.name}</h3>
            </motion.button>
          )
        })}
      </div>

      {/* Project Progress Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-soft"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-dark">Project Progress</h2>
          <button
            onClick={() => handleExport('project-progress')}
            className="flex items-center gap-2 px-4 py-2 text-[#6B4EFF] hover:bg-[#6B4EFF]/10 rounded-lg transition-colors"
          >
            <FiDownload className="w-5 h-5" />
            <span>Export</span>
          </button>
        </div>
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No project data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredProjects}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" stroke="#374151" />
              <YAxis stroke="#374151" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #F3F4F6',
                  borderRadius: '8px',
                }}
                formatter={(value) => `${value}%`}
              />
              <Bar dataKey="progress" fill="#6366F1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Expense Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl p-6 shadow-soft"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-dark">Expense Trend</h2>
          <button
            onClick={() => handleExport('expense-trend')}
            className="flex items-center gap-2 px-4 py-2 text-[#6B4EFF] hover:bg-[#6B4EFF]/10 rounded-lg transition-colors"
          >
            <FiDownload className="w-5 h-5" />
            <span>Export</span>
          </button>
        </div>
        {expenseData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No expense data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={expenseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="period" stroke="#374151" />
              <YAxis stroke="#374151" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #F3F4F6',
                  borderRadius: '8px',
                }}
                formatter={(value) => `₹${value.toLocaleString()}`}
              />
              <Line type="monotone" dataKey="amount" stroke="#8B5CF6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Project Budget vs Spent */}
      {filteredProjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
        >
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-soft"
            >
              <h3 className="text-lg font-bold text-dark mb-4">{project.name}</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Budget</span>
                    <span className="text-sm font-bold text-dark">₹{project.budget.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-[#6B4EFF] h-2 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Spent</span>
                    <span className="text-sm font-bold text-dark">₹{project.spent.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${project.budget > 0 ? Math.min((project.spent / project.budget) * 100, 100) : 0}%` }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="bg-purple-500 h-2 rounded-full"
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Remaining</span>
                    <span className={`text-lg font-bold ${project.remaining >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ₹{project.remaining.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Report Detail Modal */}
      <AnimatePresence>
        {selectedReport && reportData && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => {
                setSelectedReport(null)
                setReportData(null)
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div>
                    <h2 className="text-2xl font-bold text-dark">
                      {reportTypes.find(r => r.id === selectedReport)?.name || 'Report'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Detailed report information</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedReport(null)
                      setReportData(null)
                    }}
                    className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FiX className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-4">
                    {selectedReport === 'daily' && reportData && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-1">Date</p>
                            <p className="text-lg font-bold text-dark">{reportData.date}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-1">Attendance</p>
                            <p className="text-lg font-bold text-dark">{reportData.attendance || 0}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-1">Tasks</p>
                            <p className="text-lg font-bold text-dark">{reportData.tasks || 0}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-1">Issues</p>
                            <p className="text-lg font-bold text-dark">{reportData.issues || 0}</p>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
                          <p className="text-lg font-bold text-dark">₹{reportData.expenses?.toLocaleString() || 0}</p>
                        </div>
                      </>
                    )}

                    {selectedReport === 'weekly' && reportData && (
                      <>
                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                          <p className="text-sm text-gray-500 mb-1">Period</p>
                            <p className="text-lg font-bold text-dark">
                              {reportData.startDate} to {reportData.endDate}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-1">Attendance</p>
                            <p className="text-lg font-bold text-dark">{reportData.attendance || 0}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-1">Tasks</p>
                            <p className="text-lg font-bold text-dark">{reportData.tasks || 0}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-1">Issues</p>
                            <p className="text-lg font-bold text-dark">{reportData.issues || 0}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
                            <p className="text-lg font-bold text-dark">₹{reportData.expenses?.toLocaleString() || 0}</p>
                          </div>
                        </div>
                      </>
                    )}

                    {selectedReport === 'monthly' && reportData && (
                      <>
                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                          <p className="text-sm text-gray-500 mb-1">Month</p>
                          <p className="text-lg font-bold text-dark">
                            {new Date(reportData.year, reportData.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-1">Attendance</p>
                            <p className="text-lg font-bold text-dark">{reportData.attendance || 0}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-1">Tasks</p>
                            <p className="text-lg font-bold text-dark">{reportData.tasks || 0}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-1">Issues</p>
                            <p className="text-lg font-bold text-dark">{reportData.issues || 0}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
                            <p className="text-lg font-bold text-dark">₹{reportData.expenses?.toLocaleString() || 0}</p>
                          </div>
                        </div>
                      </>
                    )}

                    {selectedReport === 'overall' && reportData && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-1">Total Projects</p>
                            <p className="text-lg font-bold text-dark">{reportData.projects?.total || 0}</p>
                            <p className="text-xs text-gray-500 mt-1">Active: {reportData.projects?.active || 0}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-1">Total Tasks</p>
                            <p className="text-lg font-bold text-dark">{reportData.tasks || 0}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-1">Total Issues</p>
                            <p className="text-lg font-bold text-dark">{reportData.issues || 0}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-500 mb-1">Total Users</p>
                            <p className="text-lg font-bold text-dark">{reportData.users || 0}</p>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-sm text-gray-500 mb-2">Budget Summary</p>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Total Budget:</span>
                              <span className="text-sm font-bold text-dark">₹{reportData.budget?.total?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Total Spent:</span>
                              <span className="text-sm font-bold text-dark">₹{reportData.budget?.spent?.toLocaleString() || 0}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-200">
                              <span className="text-sm font-semibold text-gray-700">Remaining:</span>
                              <span className={`text-sm font-bold ${reportData.budget?.remaining >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                ₹{reportData.budget?.remaining?.toLocaleString() || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
                          <p className="text-lg font-bold text-dark">₹{reportData.expenses?.toLocaleString() || 0}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200">
                  <button
                    onClick={() => handleExport(selectedReport)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#6B4EFF] text-white hover:bg-[#5A3EE8] transition-colors"
                  >
                    <FiDownload className="w-5 h-5" />
                    <span>Export to Excel</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedReport(null)
                      setReportData(null)
                    }}
                    className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <Toast toasts={toasts} removeToast={removeToast} />
      )}
    </div>
  )
}

export default Reports
