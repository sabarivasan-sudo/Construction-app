import { motion } from 'framer-motion'
import { FiDownload, FiBarChart2, FiCalendar, FiFileText } from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

const Reports = () => {
  const reportTypes = [
    { id: 1, name: 'Daily Report', icon: FiCalendar, color: 'primary' },
    { id: 2, name: 'Weekly Report', icon: FiBarChart2, color: 'secondary' },
    { id: 3, name: 'Monthly Report', icon: FiFileText, color: 'success' },
    { id: 4, name: 'Overall Report', icon: FiBarChart2, color: 'dark' },
  ]

  const projectData = [
    { name: 'Project A', progress: 75, budget: 2500000, spent: 1875000 },
    { name: 'Project B', progress: 45, budget: 5000000, spent: 2250000 },
    { name: 'Project C', progress: 90, budget: 10000000, spent: 9000000 },
  ]

  const expenseData = [
    { month: 'Jan', amount: 120000 },
    { month: 'Feb', amount: 150000 },
    { month: 'Mar', amount: 180000 },
    { month: 'Apr', amount: 165000 },
  ]

  const COLORS = ['#6366F1', '#8B5CF6', '#10B981', '#34D399']

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-20 md:pb-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-dark mb-2">Reports</h1>
        <p className="text-gray-500">Generate and view construction reports</p>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {reportTypes.map((report, index) => {
          const Icon = report.icon
          const colorMap = {
            primary: { bg: 'bg-primary/10', text: 'text-primary' },
            secondary: { bg: 'bg-secondary/10', text: 'text-secondary' },
            success: { bg: 'bg-success/10', text: 'text-success' },
            dark: { bg: 'bg-dark/10', text: 'text-dark' },
          }
          const colors = colorMap[report.color] || colorMap.primary
          return (
            <motion.button
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
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
          <button className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
            <FiDownload className="w-5 h-5" />
            <span>Export</span>
          </button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={projectData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="name" stroke="#374151" />
            <YAxis stroke="#374151" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #F3F4F6',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="progress" fill="#6366F1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
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
          <button className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
            <FiDownload className="w-5 h-5" />
            <span>Export</span>
          </button>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={expenseData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="month" stroke="#374151" />
            <YAxis stroke="#374151" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #F3F4F6',
                borderRadius: '8px',
              }}
            />
            <Line type="monotone" dataKey="amount" stroke="#8B5CF6" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Project Budget vs Spent */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {projectData.map((project, index) => (
          <motion.div
            key={index}
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
                <div className="w-full bg-light rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Spent</span>
                  <span className="text-sm font-bold text-dark">₹{project.spent.toLocaleString()}</span>
                </div>
                <div className="w-full bg-light rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(project.spent / project.budget) * 100}%` }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="bg-secondary h-2 rounded-full"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-light">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Remaining</span>
                  <span className="text-lg font-bold text-success">
                    ₹{(project.budget - project.spent).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

export default Reports

