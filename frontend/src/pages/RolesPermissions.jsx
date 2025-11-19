import { motion } from 'framer-motion'
import { FiPlus, FiShield, FiCheck, FiX } from 'react-icons/fi'

const RolesPermissions = () => {
  const roles = [
    {
      id: 1,
      name: 'Project Manager',
      users: 5,
      permissions: {
        projects: true,
        tasks: true,
        issues: true,
        attendance: true,
        inventory: true,
        reports: true,
        users: true,
        settings: true,
      },
    },
    {
      id: 2,
      name: 'Site Engineer',
      users: 12,
      permissions: {
        projects: true,
        tasks: true,
        issues: true,
        attendance: true,
        inventory: true,
        reports: false,
        users: false,
        settings: false,
      },
    },
    {
      id: 3,
      name: 'Supervisor',
      users: 8,
      permissions: {
        projects: false,
        tasks: true,
        issues: true,
        attendance: true,
        inventory: false,
        reports: false,
        users: false,
        settings: false,
      },
    },
    {
      id: 4,
      name: 'Viewer',
      users: 3,
      permissions: {
        projects: true,
        tasks: true,
        issues: true,
        attendance: true,
        inventory: true,
        reports: true,
        users: false,
        settings: false,
      },
    },
  ]

  const permissionLabels = {
    projects: 'Projects',
    tasks: 'Tasks',
    issues: 'Issues',
    attendance: 'Attendance',
    inventory: 'Inventory',
    reports: 'Reports',
    users: 'Users',
    settings: 'Settings',
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
          <h1 className="text-3xl font-bold text-dark mb-2">Roles & Permissions</h1>
          <p className="text-gray-500">Manage user roles and access permissions</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:shadow-medium transition-all hover:scale-105">
          <FiPlus className="w-5 h-5" />
          <span>New Role</span>
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roles.map((role, index) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-soft card-hover"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <FiShield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark">{role.name}</h3>
                  <p className="text-sm text-gray-500">{role.users} users</p>
                </div>
              </div>
              <button className="text-primary text-sm font-medium hover:underline">
                Edit
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-dark mb-3">Permissions</h4>
              {Object.entries(role.permissions).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-light last:border-0">
                  <span className="text-sm text-gray-600">{permissionLabels[key]}</span>
                  {value ? (
                    <FiCheck className="w-5 h-5 text-success" />
                  ) : (
                    <FiX className="w-5 h-5 text-gray-300" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default RolesPermissions

