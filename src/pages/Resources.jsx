import { motion } from 'framer-motion'
import { FiPlus, FiUsers, FiTruck, FiBriefcase } from 'react-icons/fi'

const Resources = () => {
  const labour = [
    { id: 1, name: 'Construction Workers', count: 120, status: 'active' },
    { id: 2, name: 'Skilled Laborers', count: 45, status: 'active' },
    { id: 3, name: 'Site Engineers', count: 8, status: 'active' },
  ]

  const machinery = [
    { id: 1, name: 'Excavator', count: 5, status: 'operational' },
    { id: 2, name: 'Crane', count: 3, status: 'operational' },
    { id: 3, name: 'Concrete Mixer', count: 8, status: 'operational' },
    { id: 4, name: 'Bulldozer', count: 2, status: 'maintenance' },
  ]

  const subcontractors = [
    { id: 1, name: 'ABC Electrical Works', type: 'Electrical', projects: 3 },
    { id: 2, name: 'XYZ Plumbing Services', type: 'Plumbing', projects: 2 },
    { id: 3, name: 'DEF Painting Contractors', type: 'Painting', projects: 1 },
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
          <h1 className="text-3xl font-bold text-dark mb-2">Resources</h1>
          <p className="text-gray-500">Manage labour, machinery, and subcontractors</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:shadow-medium transition-all hover:scale-105">
          <FiPlus className="w-5 h-5" />
          <span>Add Resource</span>
        </button>
      </div>

      {/* Labour Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-soft"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <FiUsers className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-dark">Labour</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {labour.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="border border-light rounded-xl p-4 hover:shadow-medium transition-shadow"
            >
              <h3 className="font-semibold text-dark mb-2">{item.name}</h3>
              <p className="text-2xl font-bold text-primary mb-1">{item.count}</p>
              <span className="text-xs text-gray-500 capitalize">{item.status}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Machinery Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-6 shadow-soft"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
            <FiTruck className="w-6 h-6 text-secondary" />
          </div>
          <h2 className="text-xl font-bold text-dark">Machinery</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {machinery.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="border border-light rounded-xl p-4 hover:shadow-medium transition-shadow"
            >
              <h3 className="font-semibold text-dark mb-2">{item.name}</h3>
              <p className="text-2xl font-bold text-secondary mb-1">{item.count}</p>
              <span className={`text-xs px-2 py-1 rounded-lg ${
                item.status === 'operational' 
                  ? 'bg-success/10 text-success' 
                  : 'bg-danger/10 text-danger'
              }`}>
                {item.status}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Subcontractors Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl p-6 shadow-soft"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
            <FiBriefcase className="w-6 h-6 text-success" />
          </div>
          <h2 className="text-xl font-bold text-dark">Subcontractors</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subcontractors.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="border border-light rounded-xl p-6 hover:shadow-medium transition-shadow card-hover"
            >
              <h3 className="font-bold text-dark mb-2">{item.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{item.type}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Active Projects</span>
                <span className="text-lg font-bold text-success">{item.projects}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Resources

