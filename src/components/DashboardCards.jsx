import { motion } from 'framer-motion'
import { FiBriefcase, FiUsers, FiCheckSquare, FiAlertCircle } from 'react-icons/fi'

// Premium Card Animation Variants
const cardDropVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
      ease: "easeOut",
    }
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1 // Stagger delay between cards
    }
  }
}

// Premium InfoCard Component
const InfoCard = ({ icon: Icon, value, label, trend, trendColor, iconGradient }) => {
  return (
    <motion.div
      variants={cardDropVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ 
        scale: 1.02,
        y: -4,
      }}
      className="
        bg-white 
        rounded-3xl 
        p-6 
        border border-white/60
        backdrop-blur-xl
        shadow-[0_4px_20px_rgba(0,0,0,0.05)]
        hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]
        transition-all duration-300 ease-out
        cursor-pointer
        hover:-translate-y-1
      "
    >
      <div className="flex items-center gap-4">
        <div 
          className="w-12 h-12 p-3 rounded-2xl text-white flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-400 shadow-lg"
        >
          <Icon className="w-6 h-6" />
        </div>

        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-900 mb-1">{value}</h2>
          <p className="text-sm text-gray-500">{label}</p>
        </div>

        {trend && (
          <span className={`text-sm ml-auto font-medium ${trendColor}`}>
            {trend}
          </span>
        )}
      </div>
    </motion.div>
  )
}

const DashboardCards = ({ kpiData }) => {
  const kpiCards = [
    {
      id: 0,
      value: kpiData?.activeProjects?.toString() || "0",
      label: "Active Projects",
      icon: FiBriefcase,
      trend: null, // Can be calculated from trends
      trendColor: "text-green-600",
    },
    {
      id: 1,
      value: kpiData?.dailyAttendance?.toString() || "0",
      label: "Daily Attendance",
      icon: FiUsers,
      trend: null,
      trendColor: "text-green-600",
    },
    {
      id: 2,
      value: kpiData?.activeTasks?.toString() || "0",
      label: "Active Tasks",
      icon: FiCheckSquare,
      trend: null,
      trendColor: "text-green-600",
    },
    {
      id: 3,
      value: kpiData?.pendingIssues?.toString() || "0",
      label: "Pending Issues",
      icon: FiAlertCircle,
      trend: null,
      trendColor: "text-red-600",
    },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {kpiCards.map((card) => (
        <InfoCard
          key={card.id}
          icon={card.icon}
          value={card.value}
          label={card.label}
          trend={card.trend}
          trendColor={card.trendColor}
          iconGradient={card.iconGradient}
        />
      ))}
    </motion.div>
  )
}

export default DashboardCards
