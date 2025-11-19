import { motion } from 'framer-motion'
import { FiPlus, FiSearch, FiUser, FiMail, FiPhone, FiShield } from 'react-icons/fi'

const Users = () => {
  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+91 98765 43210',
      role: 'Project Manager',
      status: 'active',
      avatar: 'JD',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+91 98765 43211',
      role: 'Site Engineer',
      status: 'active',
      avatar: 'JS',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      phone: '+91 98765 43212',
      role: 'Supervisor',
      status: 'inactive',
      avatar: 'MJ',
    },
    {
      id: 4,
      name: 'Sarah Williams',
      email: 'sarah.williams@example.com',
      phone: '+91 98765 43213',
      role: 'Quality Inspector',
      status: 'active',
      avatar: 'SW',
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
          <h1 className="text-3xl font-bold text-dark mb-2">Users</h1>
          <p className="text-gray-500">Manage system users and access</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:shadow-medium transition-all hover:scale-105">
          <FiPlus className="w-5 h-5" />
          <span>Add User</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search users..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-light bg-white focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-soft card-hover"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-white text-xl font-bold">
                {user.avatar}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-dark">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.role}</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <FiMail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FiPhone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{user.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FiShield className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{user.role}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-light">
              <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                user.status === 'active' 
                  ? 'bg-success/10 text-success' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {user.status}
              </span>
              <button className="text-primary text-sm font-medium hover:underline">
                Edit
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default Users

