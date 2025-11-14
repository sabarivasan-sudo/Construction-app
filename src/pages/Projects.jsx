import { motion } from 'framer-motion'
import { FiPlus, FiSearch, FiFilter, FiMoreVertical } from 'react-icons/fi'
import { FiBriefcase, FiCalendar, FiDollarSign, FiUsers } from 'react-icons/fi'

const Projects = () => {
  const projects = [
    {
      id: 1,
      name: 'Residential Complex A',
      client: 'ABC Developers',
      progress: 75,
      budget: '₹2.5 Cr',
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      status: 'active',
      team: 12,
    },
    {
      id: 2,
      name: 'Commercial Building B',
      client: 'XYZ Corp',
      progress: 45,
      budget: '₹5.0 Cr',
      startDate: '2024-02-01',
      endDate: '2024-08-15',
      status: 'active',
      team: 18,
    },
    {
      id: 3,
      name: 'Infrastructure Project C',
      client: 'Government',
      progress: 90,
      budget: '₹10.0 Cr',
      startDate: '2023-11-01',
      endDate: '2024-04-30',
      status: 'active',
      team: 25,
    },
    {
      id: 4,
      name: 'Renovation Project D',
      client: 'Private Client',
      progress: 30,
      budget: '₹1.2 Cr',
      startDate: '2024-03-01',
      endDate: '2024-07-31',
      status: 'active',
      team: 8,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-20 md:pb-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark mb-2">Projects</h1>
          <p className="text-gray-500">Manage and track all your construction projects</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:shadow-medium transition-all hover:scale-105">
          <FiPlus className="w-5 h-5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-light bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 border border-light rounded-xl hover:bg-light transition-colors">
          <FiFilter className="w-5 h-5" />
          <span>Filter</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-soft card-hover"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FiBriefcase className="w-6 h-6 text-primary" />
              </div>
              <button className="p-2 hover:bg-light rounded-lg transition-colors">
                <FiMoreVertical className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <h3 className="text-xl font-bold text-dark mb-2">{project.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{project.client}</p>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-dark">Progress</span>
                <span className="text-sm font-bold text-primary">{project.progress}%</span>
              </div>
              <div className="w-full bg-light rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
                  className="bg-primary h-2 rounded-full"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <FiDollarSign className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{project.budget}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiUsers className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{project.team} members</span>
              </div>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
              <FiCalendar className="w-4 h-4" />
              <span>{project.startDate} - {project.endDate}</span>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-success/10 text-success rounded-lg text-xs font-medium">
                {project.status}
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

export default Projects

