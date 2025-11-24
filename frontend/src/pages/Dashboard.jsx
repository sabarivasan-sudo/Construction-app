import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { 
  FiPackage,
  FiDollarSign,
  FiActivity,
  FiCheckSquare,
  FiAlertCircle,
  FiUsers,
  FiBriefcase,
  FiFileText,
  FiUpload,
  FiX,
  FiEye,
  FiDownload,
  FiCalendar,
  FiEdit3,
  FiImage,
  FiClock,
  FiUser,
} from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import BlurText from '../components/BlurText'
import Particles from '../components/Particles'
import DashboardCards from '../components/DashboardCards'
import Toast from '../components/Toast'

const Dashboard = () => {
  const [showCards, setShowCards] = useState(false)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [showTodayWorkModal, setShowTodayWorkModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [todayProgress, setTodayProgress] = useState(null)
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [progressForm, setProgressForm] = useState({
    progressPercentage: 0,
    description: '',
    workCompleted: '',
    workPlanned: '',
    issues: '',
    weather: 'sunny',
    labourCount: 0,
    machineryUsed: [],
    machineryInput: ''
  })
  const [todayWorkForm, setTodayWorkForm] = useState({
    workPlanned: '',
    description: ''
  })
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [viewingPdf, setViewingPdf] = useState(null)
  const [toasts, setToasts] = useState([])
  const [showViewModal, setShowViewModal] = useState(false)
  const [progressHistory, setProgressHistory] = useState([])
  const [viewingImage, setViewingImage] = useState(null)
  const fileInputRef = useRef(null)
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  // Base URL for static file serving (without /api)
  const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const userData = JSON.parse(userStr)
        setUser(userData)
        // Set first project as default if available
        if (userData.projects && userData.projects.length > 0) {
          setSelectedProject(userData.projects[0]._id || userData.projects[0])
        }
      } catch (e) {
        console.error('Error parsing user data:', e)
      }
    }

    // Fetch dashboard data
    fetchDashboard()
    fetchProjects()
  }, [])

  // Fetch today's progress when project is selected
  useEffect(() => {
    if (selectedProject) {
      fetchTodayProgress()
    }
  }, [selectedProject])

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data.data)
      } else {
        console.error('Failed to fetch dashboard data')
        // Set default empty data if API fails
        setDashboardData({
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
            balance: 0
          }
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      // Set default empty data on error
      setDashboardData({
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
          balance: 0
        }
      })
    } finally {
      setLoading(false)
    }
  }

  // Refresh dashboard when window regains focus or when navigating back
  useEffect(() => {
    const handleFocus = () => {
      fetchDashboard()
    }
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchDashboard()
      }
    }
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Refresh dashboard data periodically (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboard()
    }, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  // Time-based greeting
  const getTimeGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 11) {
      return { greeting: 'Good morning', emoji: '☀️', period: 'morning' }
    } else if (hour >= 11 && hour < 16) {
      return { greeting: 'Good afternoon', emoji: '🌤️', period: 'afternoon' }
    } else if (hour >= 16 && hour < 21) {
      return { greeting: 'Good evening', emoji: '🌙', period: 'evening' }
    } else {
      return { greeting: 'Good night', emoji: '🌙', period: 'night' }
    }
  }

  const timeGreeting = getTimeGreeting()
  const userName = user?.name || 'User'

  // Use real data or defaults
  const projectProgress = dashboardData?.projectProgress || 0
  const materialStockData = dashboardData?.materialStockData || []
  const activityFeed = dashboardData?.activityFeed || []
  const activeTasksList = dashboardData?.activeTasksList || []

  // Premium chart colors matching the gradient theme
  const COLORS = ['#6A11CB', '#2575FC', '#00C9A7', '#FF8A00', '#EF4444']

  const handleBlurComplete = () => {
    // Show cards directly after blur text completes
    setShowCards(true)
  }

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No token found')
        return
      }

      const response = await fetch(`${API_URL}/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Projects fetched:', data)
        const projectsList = data.data || []
        setProjects(projectsList)
        
        if (projectsList.length > 0 && !selectedProject) {
          setSelectedProject(projectsList[0]._id)
        } else if (projectsList.length === 0) {
          console.warn('No projects available for this user')
          addToast('No projects assigned. Please contact administrator.', 'info')
        }
      } else if (response.status === 401) {
        // Token expired or invalid - clear storage and redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch projects' }))
        console.error('Error fetching projects:', errorData.message)
        addToast('Failed to load projects. Please refresh the page.', 'error')
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      addToast('Failed to load projects. Please check your connection.', 'error')
    }
  }

  const fetchTodayProgress = async () => {
    if (!selectedProject) return
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/daily-progress/today/${selectedProject}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        if (data.data) {
          setTodayProgress(data.data)
          setProgressForm({
            progressPercentage: data.data.progressPercentage || 0,
            description: data.data.description || '',
            workCompleted: data.data.workCompleted || '',
            workPlanned: data.data.workPlanned || '',
            issues: data.data.issues || '',
            weather: data.data.weather || 'sunny',
            labourCount: data.data.labourCount || 0,
            machineryUsed: data.data.machineryUsed || [],
            machineryInput: ''
          })
          // Ensure attachments have type field
          const attachments = (data.data.attachments || []).map(att => ({
            ...att,
            type: att.type || (att.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' : 'pdf')
          }))
          setUploadedFiles(attachments)
        } else {
          setTodayProgress(null)
          setProgressForm({
            progressPercentage: 0,
            description: '',
            workCompleted: '',
            workPlanned: '',
            issues: '',
            weather: 'sunny',
            labourCount: 0,
            machineryUsed: [],
            machineryInput: ''
          })
          setUploadedFiles([])
        }
      }
    } catch (error) {
      console.error('Error fetching today progress:', error)
    }
  }

  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 3000)
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const handleSubmitProgress = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const payload = {
        ...progressForm,
        project: selectedProject,
        date: new Date().toISOString().split('T')[0]
      }

      let response
      if (todayProgress) {
        // Update existing
        response = await fetch(`${API_URL}/daily-progress/${todayProgress._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        })
      } else {
        // Create new
        response = await fetch(`${API_URL}/daily-progress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        })
      }

      if (response.ok) {
        addToast(todayProgress ? 'Progress updated successfully!' : 'Progress recorded successfully!', 'success')
        await fetchTodayProgress()
        await fetchDashboard()
        setShowProgressModal(false)
      } else {
        const error = await response.json()
        addToast(error.message || 'Failed to save progress', 'error')
      }
    } catch (error) {
      console.error('Error saving progress:', error)
      addToast('Failed to save progress', 'error')
    }
  }

  const fetchProgressHistory = async () => {
    if (!selectedProject) return
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/daily-progress?project=${selectedProject}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        // Sort by date descending (newest first)
        const sorted = (data.data || []).sort((a, b) => new Date(b.date) - new Date(a.date))
        setProgressHistory(sorted)
      }
    } catch (error) {
      console.error('Error fetching progress history:', error)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const isPdf = file.type === 'application/pdf'
    const isImage = file.type.startsWith('image/')
    
    if (!isPdf && !isImage) {
      addToast('Please upload PDF or image files only', 'error')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast('File size must be less than 10MB', 'error')
      return
    }

    if (!todayProgress) {
      addToast('Please save progress first before uploading files', 'error')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_URL}/daily-progress/${todayProgress._id}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        addToast('File uploaded successfully!', 'success')
        await fetchTodayProgress()
      } else {
        const error = await response.json()
        addToast(error.message || 'Failed to upload file', 'error')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      addToast('Failed to upload file', 'error')
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDeleteFile = async (attachmentId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/daily-progress/${todayProgress._id}/attachments/${attachmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        addToast('File deleted successfully!', 'success')
        await fetchTodayProgress()
      } else {
        addToast('Failed to delete file', 'error')
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      addToast('Failed to delete file', 'error')
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getTodayProgressPercentage = () => {
    if (!todayProgress) return 0
    return todayProgress.progressPercentage || 0
  }

  // 3D Card Animation Variants for other sections
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 40, 
      scale: 0.9, 
      rotateX: 20 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      rotateX: 0,
      transition: { 
        type: "spring",
        stiffness: 150,
        damping: 15,
        ease: [0.34, 1.56, 0.64, 1] // backOut
      }
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12
      }
    }
  }

  return (
    <div className="relative min-h-screen" style={{ background: 'linear-gradient(180deg, #F9F7FF 0%, #FFFFFF 100%)' }}>
      {/* Particle Background */}
      <Particles />

      {/* Premium Gradient Glow Animation */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-64 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(106, 17, 203, 0.08), rgba(37, 117, 252, 0.08), rgba(0, 201, 167, 0.08))',
          mixBlendMode: 'overlay',
          zIndex: 1,
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 pb-20 md:pb-6 relative z-10"
      >
        {/* Welcome Section - Centered, then moves up */}
        <div className="flex flex-col items-center justify-center min-h-[250px] mb-4 relative">
          {/* Construction Icons Background - Premium Orange */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15">
            <div className="flex items-center gap-12 md:gap-16">
              {/* Construction Tool - Premium Orange */}
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: 'easeInOut' 
                }}
                className="text-5xl md:text-7xl"
                style={{ 
                  color: '#FF8A00',
                  filter: 'drop-shadow(0 4px 8px rgba(255, 138, 0, 0.3))',
                }}
              >
                🏗️
              </motion.div>
              {/* Construction Box - Mild Orange */}
              <motion.div
                animate={{ 
                  y: [0, 10, 0],
                  rotate: [0, -5, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: 'easeInOut',
                  delay: 0.5
                }}
                className="text-5xl md:text-7xl"
                style={{ 
                  color: '#FFB347',
                  filter: 'drop-shadow(0 4px 8px rgba(255, 179, 71, 0.3))',
                }}
              >
                🏗️
              </motion.div>
              {/* Package - Industrial Orange */}
              <motion.div
                animate={{ 
                  y: [0, -8, 0],
                  rotate: [0, 3, 0]
                }}
                transition={{ 
                  duration: 3.5, 
                  repeat: Infinity, 
                  ease: 'easeInOut',
                  delay: 1
                }}
                className="text-5xl md:text-7xl"
                style={{ 
                  color: '#F97316',
                  filter: 'drop-shadow(0 4px 8px rgba(249, 115, 22, 0.3))',
                }}
              >
                🔨
              </motion.div>
            </div>
          </div>
          
          {user && (
            <BlurText
              text={`${timeGreeting.greeting}, ${userName} — wishing you a powerful day on-site!`}
              onComplete={handleBlurComplete}
            />
          )}
        </div>

        {/* KPI Cards - 3D Drop Animation */}
        {showCards && (
          <DashboardCards kpiData={dashboardData?.kpis || {
            activeProjects: 0,
            dailyAttendance: 0,
            activeTasks: 0,
            pendingIssues: 0
          }} />
        )}

        {/* Charts Section - Only show after cards */}
        {showCards && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Material Stock Levels Chart */}
            <motion.div
              variants={cardVariants}
              whileHover={{ scale: 1.01, y: -4 }}
              className="rounded-3xl p-6 bg-white/90 backdrop-blur-lg shadow-xl border border-white/60 transition-all duration-300 ease-out"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Material Stock Levels</h2>
                <FiPackage className="w-6 h-6 text-primary" />
              </div>
              {materialStockData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={materialStockData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6B7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    fontSize={12}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="stock" 
                    radius={[8, 8, 0, 0]}
                    animationDuration={1000}
                  >
                    {materialStockData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400">
                  <p>No material data available</p>
                </div>
              )}
            </motion.div>

            {/* Today's Progress Card */}
            <motion.div
              variants={cardVariants}
              whileHover={{ scale: 1.01, y: -4 }}
              className="rounded-3xl bg-white/90 backdrop-blur-xl shadow-xl border border-white/60 p-6 flex flex-col items-center justify-center transition-all duration-300 ease-out"
            >
              <div className="flex items-center justify-between w-full mb-4">
                <h2 className="text-lg font-bold text-gray-800">Today's Progress</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      fetchProjects()
                      if (selectedProject) {
                        fetchProgressHistory()
                        setShowViewModal(true)
                      } else {
                        addToast('Please select a project first', 'info')
                      }
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="View Progress History"
                  >
                    <FiEye className="w-5 h-5 text-primary" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      fetchProjects()
                      setShowProgressModal(true)
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Update Progress"
                  >
                    <FiEdit3 className="w-5 h-5 text-primary" />
                  </button>
                </div>
              </div>
              
              {/* Today's Work Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  fetchProjects()
                  if (selectedProject) {
                    fetchTodayProgress()
                    if (todayProgress) {
                      setTodayWorkForm({
                        workPlanned: todayProgress.workPlanned || '',
                        description: todayProgress.description || ''
                      })
                    } else {
                      setTodayWorkForm({
                        workPlanned: '',
                        description: ''
                      })
                    }
                    setShowTodayWorkModal(true)
                  } else {
                    addToast('Please select a project first', 'info')
                  }
                }}
                className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl hover:from-primary/90 hover:to-purple-600/90 transition-all font-semibold flex items-center justify-center gap-2"
              >
                <FiClock className="w-5 h-5" />
                Today's Work (Morning Update)
              </button>
              
              {/* Upload Photos Button - Always Visible */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  fetchProjects()
                  if (selectedProject) {
                    fetchTodayProgress()
                    setShowUploadModal(true)
                  } else {
                    addToast('Please select a project first', 'info')
                  }
                }}
                className="w-full mt-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-500/90 hover:to-emerald-600/90 transition-all font-semibold flex items-center justify-center gap-2"
              >
                <FiImage className="w-5 h-5" />
                Upload Photos
              </button>
              
              <div className="relative w-48 h-48 mb-4">
                <svg className="transform -rotate-90 w-48 h-48">
                  <circle
                    cx="96"
                    cy="96"
                    r="84"
                    stroke="#F3F4F6"
                    strokeWidth="12"
                    fill="none"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="84"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 84}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 84 }}
                    animate={{ 
                      strokeDashoffset: 2 * Math.PI * 84 * (1 - getTodayProgressPercentage() / 100)
                    }}
                    transition={{ 
                      duration: 1.5, 
                      delay: 0.5,
                      type: "spring",
                      stiffness: 100
                    }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6A11CB" />
                      <stop offset="50%" stopColor="#2575FC" />
                      <stop offset="100%" stopColor="#00C9A7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1, type: "spring", stiffness: 200 }}
                    className="text-center"
                  >
                    <span className="text-4xl font-bold text-dark">{getTodayProgressPercentage()}%</span>
                    <p className="text-sm text-gray-600 mt-1">
                      {todayProgress ? 'Updated Today' : 'Click to Update'}
                    </p>
                  </motion.div>
                </div>
              </div>
              {todayProgress && (
                <div className="text-center text-sm text-gray-500">
                  <p className="flex items-center justify-center gap-2">
                    <FiCalendar className="w-4 h-4" />
                    {new Date(todayProgress.date).toLocaleDateString()}
                  </p>
                  {uploadedFiles.length > 0 && (
                    <p className="mt-1 flex items-center justify-center gap-2">
                      <FiFileText className="w-4 h-4" />
                      {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} attached
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Activity Feed - Only show after charts */}
        {showCards && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Active Tasks List */}
            <motion.div
              variants={cardVariants}
              whileHover={{ scale: 1.01, y: -4 }}
              className="rounded-3xl p-6 bg-white shadow-xl backdrop-blur-xl border border-white/60 transition-all duration-300 ease-out"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Active Tasks</h2>
                <FiCheckSquare className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-4">
                {activeTasksList.length > 0 ? activeTasksList.map((task, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2.5 + index * 0.1 }}
                    className="p-4 rounded-xl bg-gray-50/50 border border-white/60"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-dark">{task.title}</h3>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        task.priority === 'high' ? 'bg-danger text-white' :
                        task.priority === 'medium' ? 'bg-warning text-white' :
                        'bg-light text-dark'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{task.project}</p>
                    <div className="w-full bg-light rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${task.progress}%` }}
                        transition={{ delay: 2.8 + index * 0.1, duration: 0.8 }}
                        className={`h-2 rounded-full ${
                          task.priority === 'high' ? 'bg-danger' :
                          task.priority === 'medium' ? 'bg-warning' :
                          'bg-success'
                        }`}
                      />
                    </div>
                  </motion.div>
                )) : (
                  <p className="text-center text-gray-500 py-8">No active tasks</p>
                )}
              </div>
            </motion.div>

            {/* Activity Feed */}
            <motion.div
              variants={cardVariants}
              whileHover={{ scale: 1.01, y: -4 }}
              className="rounded-3xl p-6 bg-white shadow-xl backdrop-blur-xl border border-white/60 transition-all duration-300 ease-out"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Live Site Activity</h2>
                <FiActivity className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-4">
                {activityFeed.length > 0 ? activityFeed.map((activity, index) => {
                  // Map activity type to icon
                  const iconMap = {
                    task: FiCheckSquare,
                    issue: FiAlertCircle,
                    material: FiPackage,
                    attendance: FiUsers,
                    transfer: FiActivity,
                    consumption: FiPackage,
                    'petty-cash': FiDollarSign,
                    project: FiBriefcase,
                    user: FiUsers
                  }
                  const Icon = iconMap[activity.type] || FiActivity
                  const colorMap = {
                    task: '#00C9A7',
                    issue: '#EF4444',
                    material: '#6A11CB',
                    attendance: '#FF8A00',
                    transfer: '#2575FC',
                    consumption: '#6A11CB',
                    'petty-cash': '#FACC15',
                    project: '#6A11CB',
                    user: '#2575FC'
                  }
                  const activityColor = colorMap[activity.type] || '#2575FC'
                  
                  return (
                    <motion.div
                      key={activity.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 2.5 + index * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-xl transition-colors cursor-pointer bg-gray-50/50 border border-white/60 hover:bg-gray-100/50"
                    >
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${activityColor}20` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: activityColor }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-dark font-medium">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </motion.div>
                  )
                }) : (
                  <p className="text-center text-gray-500 py-8">No recent activity</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Petty Cash Summary */}
        {showCards && (
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.01, y: -4 }}
            className="rounded-3xl p-6 bg-white shadow-xl backdrop-blur-xl border border-white/60 transition-all duration-300 ease-out"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Petty Cash</h2>
                <p className="text-3xl font-bold text-gray-900">₹{dashboardData?.pettyCash?.balance?.toLocaleString() || '0'}</p>
                <p className="text-sm text-gray-500 mt-1">Available balance</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-warning to-yellow-500 flex items-center justify-center">
                <FiDollarSign className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Today's Progress Modal */}
      <AnimatePresence>
        {showProgressModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowProgressModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold text-gray-800">Today's Progress Update</h2>
                <button
                  onClick={() => setShowProgressModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleSubmitProgress} className="p-6 space-y-6">
                {/* Project Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Project *
                  </label>
                  {projects.length === 0 ? (
                    <div className="w-full px-4 py-3 rounded-xl border border-yellow-300 bg-yellow-50">
                      <p className="text-sm text-yellow-800">
                        No projects available. Please contact your administrator to assign projects to your account.
                      </p>
                    </div>
                  ) : (
                    <select
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select Project</option>
                      {projects.map((project) => (
                        <option key={project._id} value={project._id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Progress Percentage */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Progress Percentage * ({progressForm.progressPercentage}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progressForm.progressPercentage}
                    onChange={(e) => setProgressForm({ ...progressForm, progressPercentage: parseInt(e.target.value) })}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    required
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Work Completed */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Work Completed Today
                  </label>
                  <textarea
                    value={progressForm.workCompleted}
                    onChange={(e) => setProgressForm({ ...progressForm, workCompleted: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Describe the work completed today..."
                  />
                </div>

                {/* Work Planned */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Work Planned for Tomorrow
                  </label>
                  <textarea
                    value={progressForm.workPlanned}
                    onChange={(e) => setProgressForm({ ...progressForm, workPlanned: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Describe the work planned for tomorrow..."
                  />
                </div>

                {/* Issues */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Issues / Challenges
                  </label>
                  <textarea
                    value={progressForm.issues}
                    onChange={(e) => setProgressForm({ ...progressForm, issues: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Any issues or challenges faced today..."
                  />
                </div>

                {/* Weather & Labour */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Weather
                    </label>
                    <select
                      value={progressForm.weather}
                      onChange={(e) => setProgressForm({ ...progressForm, weather: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="sunny">Sunny</option>
                      <option value="cloudy">Cloudy</option>
                      <option value="rainy">Rainy</option>
                      <option value="windy">Windy</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Labour Count
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={progressForm.labourCount}
                      onChange={(e) => setProgressForm({ ...progressForm, labourCount: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={progressForm.description}
                    onChange={(e) => setProgressForm({ ...progressForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Any additional notes or comments..."
                  />
                </div>


                {/* Submit Button */}
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowProgressModal(false)}
                    className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors font-semibold"
                  >
                    {todayProgress ? 'Update Progress' : 'Save Progress'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today's Work Modal */}
      <AnimatePresence>
        {showTodayWorkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTodayWorkModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold text-gray-800">Today's Work - Morning Update</h2>
                <button
                  onClick={() => setShowTodayWorkModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <form 
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (!selectedProject) {
                    addToast('Please select a project first', 'error')
                    return
                  }

                  try {
                    const token = localStorage.getItem('token')
                    const payload = {
                      project: selectedProject,
                      date: new Date().toISOString().split('T')[0],
                      progressPercentage: todayProgress?.progressPercentage || 0,
                      workPlanned: todayWorkForm.workPlanned,
                      description: todayWorkForm.description,
                      workCompleted: todayProgress?.workCompleted || '',
                      issues: todayProgress?.issues || '',
                      weather: todayProgress?.weather || 'sunny',
                      labourCount: todayProgress?.labourCount || 0
                    }

                    let response
                    if (todayProgress) {
                      response = await fetch(`${API_URL}/daily-progress/${todayProgress._id}`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(payload)
                      })
                    } else {
                      response = await fetch(`${API_URL}/daily-progress`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(payload)
                      })
                    }

                    if (response.ok) {
                      addToast('Today\'s work updated successfully!', 'success')
                      await fetchTodayProgress()
                      await fetchDashboard()
                      setShowTodayWorkModal(false)
                    } else {
                      const error = await response.json()
                      addToast(error.message || 'Failed to save', 'error')
                    }
                  } catch (error) {
                    console.error('Error saving today\'s work:', error)
                    addToast('Failed to save today\'s work', 'error')
                  }
                }}
                className="p-6 space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Project *
                  </label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Work Planned for Today *
                  </label>
                  <textarea
                    value={todayWorkForm.workPlanned}
                    onChange={(e) => setTodayWorkForm({ ...todayWorkForm, workPlanned: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Describe the work planned for today..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={todayWorkForm.description}
                    onChange={(e) => setTodayWorkForm({ ...todayWorkForm, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Any additional notes or comments..."
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowTodayWorkModal(false)}
                    className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors font-semibold"
                  >
                    Save Today's Work
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Photos Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold text-gray-800">Upload Photos & Documents</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {!todayProgress ? (
                  <div className="text-center py-12">
                    <FiImage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No progress entry found</p>
                    <p className="text-gray-400 text-sm mt-2 mb-4">Please save "Today's Work" first before uploading files</p>
                    <button
                      onClick={() => {
                        setShowUploadModal(false)
                        setShowTodayWorkModal(true)
                      }}
                      className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-semibold"
                    >
                      Go to Today's Work
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Upload Photos & Documents
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                        >
                          <FiUpload className="w-5 h-5" />
                          Upload File/Photo
                        </button>
                        <span className="text-sm text-gray-500">PDF or Images (Max 10MB)</span>
                      </div>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Uploaded Files</h3>
                        <div className="space-y-2">
                          {uploadedFiles.map((file, index) => {
                            const fileType = file.type || (file.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' : 'pdf')
                            return (
                              <div
                                key={file._id || index}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  {fileType === 'image' ? (
                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                      <img
                                        src={`${BASE_URL}${file.url}`}
                                        alt={file.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          console.error('Image load error:', `${BASE_URL}${file.url}`)
                                          e.target.style.display = 'none'
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <FiFileText className="w-5 h-5 text-primary flex-shrink-0" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {file.size ? formatFileSize(file.size) : ''} • {fileType === 'image' ? 'Image' : 'PDF'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {fileType === 'image' ? (
                                    <button
                                      type="button"
                                      onClick={() => setViewingImage(`${BASE_URL}${file.url}`)}
                                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                      <FiEye className="w-5 h-5 text-gray-600" />
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setViewingPdf(`${BASE_URL}${file.url}`)}
                                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                      <FiEye className="w-5 h-5 text-gray-600" />
                                    </button>
                                  )}
                                  <a
                                    href={`${BASE_URL}${file.url}`}
                                    download
                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                  >
                                    <FiDownload className="w-5 h-5 text-gray-600" />
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteFile(file._id)}
                                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                  >
                                    <FiX className="w-5 h-5 text-red-600" />
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Progress History Modal */}
      <AnimatePresence>
        {showViewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Progress History</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {projects.find(p => p._id === selectedProject)?.name || 'Project'} - Date-wise Progress
                  </p>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {progressHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No progress entries found</p>
                    <p className="text-gray-400 text-sm mt-2">Start recording your daily progress to see history here</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {progressHistory.map((entry, index) => {
                      const entryDate = new Date(entry.date)
                      // Ensure attachments have type field, fallback to file extension
                      const attachmentsWithType = (entry.attachments || []).map(att => ({
                        ...att,
                        type: att.type || (att.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' : 'pdf')
                      }))
                      const images = attachmentsWithType.filter(a => a.type === 'image')
                      const pdfs = attachmentsWithType.filter(a => a.type === 'pdf')
                      
                      return (
                        <motion.div
                          key={entry._id || index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                        >
                          {/* Date Header */}
                          <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0">
                                <FiCalendar className="w-5 h-5 text-white" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-base font-bold text-gray-800 truncate">
                                  {entryDate.toLocaleDateString('en-US', { 
                                    weekday: 'short', 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </h3>
                                <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                                  <FiUser className="w-3 h-3" />
                                  <span className="truncate">{entry.recordedBy?.name || 'Unknown User'}</span>
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                              <div className="text-2xl font-bold text-primary">
                                {entry.progressPercentage}%
                              </div>
                              <div className="text-xs text-gray-500">Progress</div>
                            </div>
                          </div>

                          {/* Progress Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            {/* Work Completed */}
                            <div className="bg-gray-50 rounded-lg p-3">
                              <h4 className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                                <FiCheckSquare className="w-3.5 h-3.5" />
                                Work Completed
                              </h4>
                              <p className="text-xs text-gray-600 whitespace-pre-wrap line-clamp-3">
                                {entry.workCompleted || <span className="text-gray-400 italic">No work completed noted</span>}
                              </p>
                            </div>

                            {/* Work Planned for Tomorrow */}
                            <div className="bg-blue-50 rounded-lg p-3">
                              <h4 className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                                <FiClock className="w-3.5 h-3.5" />
                                Work Planned
                              </h4>
                              <p className="text-xs text-gray-600 whitespace-pre-wrap line-clamp-3">
                                {entry.workPlanned || <span className="text-gray-400 italic">No work planned</span>}
                              </p>
                            </div>
                          </div>

                          {/* Issues & Additional Info */}
                          {(entry.issues || entry.description) && (
                            <div className="mb-3 space-y-2">
                              {entry.issues && (
                                <div className="bg-red-50 rounded-lg p-3">
                                  <h4 className="text-xs font-semibold text-red-700 mb-1.5">Issues / Challenges</h4>
                                  <p className="text-xs text-red-600 whitespace-pre-wrap line-clamp-2">{entry.issues}</p>
                                </div>
                              )}
                              {entry.description && (
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <h4 className="text-xs font-semibold text-gray-700 mb-1.5">Additional Notes</h4>
                                  <p className="text-xs text-gray-600 whitespace-pre-wrap line-clamp-2">{entry.description}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Weather & Labour Info */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {entry.weather && (
                              <div className="px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-md text-xs font-medium capitalize">
                                ☀️ {entry.weather}
                              </div>
                            )}
                            {entry.labourCount > 0 && (
                              <div className="px-2.5 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium">
                                👷 {entry.labourCount} workers
                              </div>
                            )}
                          </div>

                          {/* Photos Gallery */}
                          {images.length > 0 && (
                            <div className="mb-3">
                              <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                                <FiImage className="w-3.5 h-3.5" />
                                Photos ({images.length})
                              </h4>
                              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                                {images.map((img, imgIndex) => (
                                  <div
                                    key={imgIndex}
                                    className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 aspect-square"
                                    onClick={() => setViewingImage(`${BASE_URL}${img.url}`)}
                                  >
                                    <img
                                      src={`${BASE_URL}${img.url}`}
                                      alt={img.name}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                      <FiEye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* PDF Documents */}
                          {pdfs.length > 0 && (
                            <div>
                              <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                                <FiFileText className="w-3.5 h-3.5" />
                                Documents ({pdfs.length})
                              </h4>
                              <div className="space-y-1.5">
                                {pdfs.map((pdf, pdfIndex) => (
                                  <div
                                    key={pdfIndex}
                                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                  >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <FiFileText className="w-4 h-4 text-primary flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-800 truncate">{pdf.name}</p>
                                        <p className="text-xs text-gray-500">
                                          {pdf.size ? formatFileSize(pdf.size) : ''}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <button
                                        onClick={() => setViewingPdf(`${BASE_URL}${pdf.url}`)}
                                        className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                                        title="View PDF"
                                      >
                                        <FiEye className="w-4 h-4 text-gray-600" />
                                      </button>
                                      <a
                                        href={`${BASE_URL}${pdf.url}`}
                                        download
                                        className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
                                        title="Download PDF"
                                      >
                                        <FiDownload className="w-4 h-4 text-gray-600" />
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF Viewer Modal */}
      <AnimatePresence>
        {viewingPdf && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setViewingPdf(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h3 className="text-lg font-bold text-gray-800">PDF Viewer</h3>
                <button
                  onClick={() => setViewingPdf(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              <div className="p-6">
                <iframe
                  src={viewingPdf}
                  className="w-full h-[80vh] rounded-xl border border-gray-200"
                  title="PDF Viewer"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Viewer Modal */}
      <AnimatePresence>
        {viewingImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setViewingImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h3 className="text-lg font-bold text-gray-800">Photo Viewer</h3>
                <button
                  onClick={() => setViewingImage(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              <div className="p-6">
                <img
                  src={viewingImage}
                  alt="Progress Photo"
                  className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
                  onError={(e) => {
                    console.error('Failed to load image:', viewingImage)
                    e.target.style.display = 'none'
                    const errorDiv = document.createElement('div')
                    errorDiv.className = 'text-center py-12'
                    errorDiv.innerHTML = `
                      <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      <p class="text-gray-500 text-lg">Failed to load image</p>
                      <p class="text-gray-400 text-sm mt-2">The image may have been deleted or moved</p>
                    `
                    e.target.parentElement.appendChild(errorDiv)
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default Dashboard
