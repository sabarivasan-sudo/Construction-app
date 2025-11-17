import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  FiPackage,
  FiDollarSign,
  FiActivity,
  FiCheckSquare,
  FiAlertCircle,
  FiUsers,
  FiBriefcase,
} from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import BlurText from '../components/BlurText'
import Particles from '../components/Particles'
import DashboardCards from '../components/DashboardCards'

const Dashboard = () => {
  const [showCards, setShowCards] = useState(false)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        setUser(JSON.parse(userStr))
      } catch (e) {
        console.error('Error parsing user data:', e)
      }
    }

    // Fetch dashboard data
    fetchDashboard()
  }, [])

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

            {/* Project Progress Ring */}
            <motion.div
              variants={cardVariants}
              whileHover={{ scale: 1.01, y: -4 }}
              className="rounded-3xl bg-white/90 backdrop-blur-xl shadow-xl border border-white/60 p-6 flex flex-col items-center justify-center transition-all duration-300 ease-out"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-6">Overall Progress</h2>
              <div className="relative w-48 h-48">
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
                      strokeDashoffset: 2 * Math.PI * 84 * (1 - projectProgress / 100)
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
                    <span className="text-4xl font-bold text-dark">{projectProgress}%</span>
                    <p className="text-sm text-gray-600 mt-1">All Projects Combined</p>
                  </motion.div>
                </div>
              </div>
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
    </div>
  )
}

export default Dashboard
