import { motion } from 'framer-motion'
import { FiPlus, FiSearch, FiFilter, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi'

const Tasks = () => {
  const tasks = [
    {
      id: 1,
      title: 'Foundation Work - Building A',
      project: 'Residential Complex A',
      assignee: 'John Doe',
      dueDate: '2024-04-15',
      priority: 'high',
      status: 'in-progress',
      progress: 75,
    },
    {
      id: 2,
      title: 'Electrical Installation',
      project: 'Commercial Building B',
      assignee: 'Jane Smith',
      dueDate: '2024-04-20',
      priority: 'medium',
      status: 'in-progress',
      progress: 45,
    },
    {
      id: 3,
      title: 'Plumbing Setup',
      project: 'Residential Complex A',
      assignee: 'Mike Johnson',
      dueDate: '2024-04-18',
      priority: 'high',
      status: 'pending',
      progress: 0,
    },
    {
      id: 4,
      title: 'Roofing Work',
      project: 'Infrastructure Project C',
      assignee: 'Sarah Williams',
      dueDate: '2024-04-25',
      priority: 'low',
      status: 'completed',
      progress: 100,
    },
  ]

  const getPriorityColor = (priority) => {
    switch (priority) {
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
      case 'completed':
        return <FiCheckCircle className="w-5 h-5 text-success" />
      case 'in-progress':
        return <FiClock className="w-5 h-5 text-primary" />
      default:
        return <FiAlertCircle className="w-5 h-5 text-gray-400" />
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
          <h1 className="text-3xl font-bold text-dark mb-2">Tasks</h1>
          <p className="text-gray-500">Track and manage construction tasks</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:shadow-medium transition-all hover:scale-105">
          <FiPlus className="w-5 h-5" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-light bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 border border-light rounded-xl hover:bg-light transition-colors">
          <FiFilter className="w-5 h-5" />
          <span>Filter</span>
        </button>
      </div>

      {/* Tasks List - Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-light">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Task</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Project</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Assignee</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Due Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Priority</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Progress</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <motion.tr
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-light hover:bg-light/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-dark">{task.title}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{task.project}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{task.assignee}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{task.dueDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-light rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${task.progress}%` }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                          className="bg-primary h-2 rounded-full"
                        />
                      </div>
                      <span className="text-sm text-gray-600">{task.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusIcon(task.status)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tasks Cards - Mobile View */}
      <div className="md:hidden space-y-4">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-4 shadow-soft"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-dark mb-1">{task.title}</h3>
                <p className="text-sm text-gray-500">{task.project}</p>
              </div>
              {getStatusIcon(task.status)}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-gray-600">Assignee: {task.assignee}</span>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-600">Due: {task.dueDate}</span>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              <span className="text-sm font-medium text-dark">{task.progress}%</span>
            </div>

            <div className="w-full bg-light rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${task.progress}%` }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-primary h-2 rounded-full"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default Tasks

