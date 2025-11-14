import { motion } from 'framer-motion'
import { FiPlus, FiSearch, FiAlertCircle, FiCheckCircle, FiClock } from 'react-icons/fi'

const Issues = () => {
  const issues = [
    {
      id: 1,
      title: 'Crack in Foundation Wall',
      project: 'Residential Complex A',
      reportedBy: 'Site Engineer',
      reportedDate: '2024-04-10',
      severity: 'high',
      status: 'open',
      description: 'Visible crack detected in the foundation wall of Building A, Section 2',
    },
    {
      id: 2,
      title: 'Water Leakage in Basement',
      project: 'Commercial Building B',
      reportedBy: 'Supervisor',
      reportedDate: '2024-04-12',
      severity: 'medium',
      status: 'in-progress',
      description: 'Water leakage observed in the basement area during heavy rain',
    },
    {
      id: 3,
      title: 'Electrical Panel Malfunction',
      project: 'Infrastructure Project C',
      reportedBy: 'Electrician',
      reportedDate: '2024-04-08',
      severity: 'high',
      status: 'resolved',
      description: 'Main electrical panel showing irregular voltage readings',
    },
    {
      id: 4,
      title: 'Material Quality Issue',
      project: 'Renovation Project D',
      reportedBy: 'Quality Inspector',
      reportedDate: '2024-04-14',
      severity: 'low',
      status: 'open',
      description: 'Batch of cement does not meet quality standards',
    },
  ]

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-danger text-white'
      case 'medium':
        return 'bg-secondary text-white'
      default:
        return 'bg-light text-dark'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return <FiCheckCircle className="w-5 h-5 text-success" />
      case 'in-progress':
        return <FiClock className="w-5 h-5 text-primary" />
      default:
        return <FiAlertCircle className="w-5 h-5 text-danger" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-20 md:pb-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark mb-2">Issues & Defects</h1>
          <p className="text-gray-500">Track and resolve construction issues</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:shadow-medium transition-all hover:scale-105">
          <FiPlus className="w-5 h-5" />
          <span>Report Issue</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search issues..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-light bg-white focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Issues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {issues.map((issue, index) => (
          <motion.div
            key={issue.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-soft card-hover"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
                <FiAlertCircle className="w-6 h-6 text-danger" />
              </div>
              {getStatusIcon(issue.status)}
            </div>

            <h3 className="text-xl font-bold text-dark mb-2">{issue.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{issue.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Project:</span>
                <span className="text-dark font-medium">{issue.project}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Reported By:</span>
                <span className="text-dark font-medium">{issue.reportedBy}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Date:</span>
                <span className="text-dark font-medium">{issue.reportedDate}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-light">
              <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                {issue.severity} severity
              </span>
              <button className="text-primary text-sm font-medium hover:underline">
                View Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default Issues

