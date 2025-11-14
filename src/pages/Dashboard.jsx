import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  FiPackage,
  FiDollarSign,
  FiActivity,
  FiCheckSquare,
  FiAlertCircle,
  FiUsers,
} from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import BlurText from '../components/BlurText'
import Particles from '../components/Particles'
import DashboardCards from '../components/DashboardCards'

const Dashboard = () => {
  const [showCards, setShowCards] = useState(false)
  const userName = 'Sabari'
  
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
  const projectProgress = 68
  const dailyAttendance = 145
  const activeTasks = 23
  const pendingIssues = 8

  const materialStockData = [
    { name: 'Cement', stock: 85, capacity: 100 },
    { name: 'Steel', stock: 60, capacity: 100 },
    { name: 'Bricks', stock: 90, capacity: 100 },
    { name: 'Sand', stock: 75, capacity: 100 },
    { name: 'Gravel', stock: 55, capacity: 100 },
  ]

  const activityFeed = [
    { id: 1, type: 'task', message: 'Task "Foundation Work" completed', time: '2 mins ago', icon: FiCheckSquare, color: '#00C9A7' },
    { id: 2, type: 'issue', message: 'New issue reported in Building A', time: '15 mins ago', icon: FiAlertCircle, color: '#EF4444' },
    { id: 3, type: 'material', message: 'Cement stock updated - 85 units', time: '1 hour ago', icon: FiPackage, color: '#6A11CB' },
    { id: 4, type: 'attendance', message: '145 workers checked in today', time: '2 hours ago', icon: FiUsers, color: '#FF8A00' },
    { id: 5, type: 'transfer', message: 'Material transfer to Site B', time: '3 hours ago', icon: FiActivity, color: '#2575FC' },
  ]

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
          
          <BlurText
            text={`${timeGreeting.greeting}, ${userName} — wishing you a powerful day on-site!`}
            onComplete={handleBlurComplete}
          />
        </div>

        {/* KPI Cards - 3D Drop Animation */}
        {showCards && (
          <DashboardCards />
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
                {[
                  { title: 'Foundation Work', project: 'Building A', progress: 75, priority: 'high' },
                  { title: 'Electrical Installation', project: 'Building B', progress: 45, priority: 'medium' },
                  { title: 'Plumbing Setup', project: 'Building A', progress: 60, priority: 'high' },
                  { title: 'Roofing', project: 'Building C', progress: 30, priority: 'low' },
                ].map((task, index) => (
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
                ))}
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
                {activityFeed.map((activity, index) => {
                  const Icon = activity.icon
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 2.5 + index * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-xl transition-colors cursor-pointer bg-gray-50/50 border border-white/60 hover:bg-gray-100/50"
                    >
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${activity.color}20` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: activity.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-dark font-medium">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </motion.div>
                  )
                })}
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
                <p className="text-3xl font-bold text-gray-900">₹14,680</p>
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
