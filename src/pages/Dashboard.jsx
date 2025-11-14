import { motion } from 'framer-motion'
import { 
  FiBriefcase, 
  FiCheckSquare, 
  FiAlertCircle, 
  FiUsers,
  FiPackage,
  FiDollarSign,
  FiActivity
} from 'react-icons/fi'
import StatCard from '../components/StatCard'
import ProgressCircle from '../components/ProgressCircle'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const Dashboard = () => {
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

  const expenseData = [
    { name: 'Mon', amount: 1200 },
    { name: 'Tue', amount: 1900 },
    { name: 'Wed', amount: 3000 },
    { name: 'Thu', amount: 2800 },
    { name: 'Fri', amount: 1890 },
    { name: 'Sat', amount: 2390 },
    { name: 'Sun', amount: 1500 },
  ]

  const activeTasksList = [
    { id: 1, title: 'Foundation Work', project: 'Building A', progress: 75, priority: 'high' },
    { id: 2, title: 'Electrical Installation', project: 'Building B', progress: 45, priority: 'medium' },
    { id: 3, title: 'Plumbing Setup', project: 'Building A', progress: 60, priority: 'high' },
    { id: 4, title: 'Roofing', project: 'Building C', progress: 30, priority: 'low' },
  ]

  const activityFeed = [
    { id: 1, type: 'task', message: 'Task "Foundation Work" completed', time: '2 mins ago' },
    { id: 2, type: 'issue', message: 'New issue reported in Building A', time: '15 mins ago' },
    { id: 3, type: 'material', message: 'Cement stock updated', time: '1 hour ago' },
    { id: 4, type: 'attendance', message: '145 workers checked in today', time: '2 hours ago' },
  ]

  const COLORS = ['#1A73E8', '#F9A825', '#43A047', '#E53935', '#263238']

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-20 md:pb-6"
    >
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-dark mb-2">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Projects"
          value="12"
          change="+2 this month"
          icon={FiBriefcase}
          color="primary"
          delay={0.1}
        />
        <StatCard
          title="Daily Attendance"
          value={dailyAttendance}
          change="+5% from yesterday"
          icon={FiUsers}
          color="success"
          delay={0.2}
        />
        <StatCard
          title="Active Tasks"
          value={activeTasks}
          change="3 completed today"
          icon={FiCheckSquare}
          color="secondary"
          delay={0.3}
        />
        <StatCard
          title="Pending Issues"
          value={pendingIssues}
          change="-2 resolved"
          icon={FiAlertCircle}
          color="danger"
          delay={0.4}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Progress */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-soft"
        >
          <h2 className="text-xl font-bold text-dark mb-4">Overall Progress</h2>
          <div className="flex items-center justify-center mb-4">
            <ProgressCircle percentage={projectProgress} size={150} />
          </div>
          <p className="text-center text-gray-500">All Projects Combined</p>
        </motion.div>

        {/* Material Stock */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-soft lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-dark">Material Stock Levels</h2>
            <FiPackage className="w-6 h-6 text-primary" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={materialStockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ECEFF1" />
              <XAxis dataKey="name" stroke="#263238" />
              <YAxis stroke="#263238" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ECEFF1',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="stock" fill="#1A73E8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Active Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl p-6 shadow-soft lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-dark">Active Tasks</h2>
            <FiCheckSquare className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-4">
            {activeTasksList.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="border border-light rounded-xl p-4 hover:shadow-medium transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-dark">{task.title}</h3>
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      task.priority === 'high'
                        ? 'bg-danger text-white'
                        : task.priority === 'medium'
                        ? 'bg-secondary text-white'
                        : 'bg-light text-dark'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{task.project}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-light rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${task.progress}%` }}
                      transition={{ delay: 1 + index * 0.1, duration: 0.8 }}
                      className="bg-primary h-2 rounded-full"
                    />
                  </div>
                  <span className="text-sm font-medium text-dark">{task.progress}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Petty Cash Expenses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-dark">Petty Cash</h2>
            <FiDollarSign className="w-6 h-6 text-primary" />
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold text-dark mb-1">₹14,680</p>
            <p className="text-sm text-gray-500">This Week</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={expenseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ECEFF1" />
              <XAxis dataKey="name" stroke="#263238" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ECEFF1',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="amount" fill="#F9A825" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-xl p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-dark">Live Activity</h2>
            <FiActivity className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-4">
            {activityFeed.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-light transition-colors"
              >
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'task' ? 'bg-success' :
                  activity.type === 'issue' ? 'bg-danger' :
                  activity.type === 'material' ? 'bg-primary' :
                  'bg-secondary'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-dark">{activity.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Dashboard

