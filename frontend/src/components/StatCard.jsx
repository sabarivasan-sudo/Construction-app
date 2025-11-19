import { motion } from 'framer-motion'
import { FiTrendingUp } from 'react-icons/fi'

const StatCard = ({ title, value, change, icon: Icon, color = 'primary', delay = 0 }) => {
  const colorClasses = {
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-white',
    success: 'bg-success text-white',
    danger: 'bg-danger text-white',
    dark: 'bg-dark text-white',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-xl p-6 shadow-soft card-hover"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-full ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        {change && (
          <div className="flex items-center gap-1 text-success">
            <FiTrendingUp className="w-4 h-4" />
            <span className="text-sm font-semibold">{change}</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-dark mb-1">{value}</h3>
      <p className="text-sm text-gray-500">{title}</p>
    </motion.div>
  )
}

export default StatCard

