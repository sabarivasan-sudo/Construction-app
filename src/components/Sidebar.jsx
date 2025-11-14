import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiLayout,
  FiBriefcase,
  FiCheckSquare,
  FiAlertCircle,
  FiClock,
  FiPackage,
  FiTruck,
  FiShoppingCart,
  FiDollarSign,
  FiUsers,
  FiUser,
  FiShield,
  FiBarChart2,
  FiSettings,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi'

const menuItems = [
  { path: '/', icon: FiLayout, label: 'Dashboard' },
  { path: '/projects', icon: FiBriefcase, label: 'Projects' },
  { path: '/tasks', icon: FiCheckSquare, label: 'Tasks' },
  { path: '/issues', icon: FiAlertCircle, label: 'Issues' },
  { path: '/attendance', icon: FiClock, label: 'Attendance' },
  { path: '/inventory', icon: FiPackage, label: 'Inventory' },
  { path: '/site-transfer', icon: FiTruck, label: 'Site Transfer' },
  { path: '/consumption', icon: FiShoppingCart, label: 'Consumption' },
  { path: '/petty-cash', icon: FiDollarSign, label: 'Petty Cash' },
  { path: '/resources', icon: FiUsers, label: 'Resources' },
  { path: '/users', icon: FiUser, label: 'Users' },
  { path: '/roles-permissions', icon: FiShield, label: 'Roles & Permissions' },
  { path: '/reports', icon: FiBarChart2, label: 'Reports' },
  { path: '/settings', icon: FiSettings, label: 'Settings' },
]

const Sidebar = ({ isOpen, onToggle, onLinkClick }) => {
  return (
    <>
      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? '280px' : '80px',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="bg-white border-r border-light shadow-soft relative z-10"
      >
        {/* Toggle Button */}
        <div className="flex items-center justify-between p-4 border-b border-light">
          <AnimatePresence>
            {isOpen && (
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-xl font-bold text-dark"
              >
                ConstructPro
              </motion.h1>
            )}
          </AnimatePresence>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-light transition-colors"
          >
            {isOpen ? (
              <FiChevronLeft className="w-5 h-5 text-dark" />
            ) : (
              <FiChevronRight className="w-5 h-5 text-dark" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onLinkClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 mb-1 rounded-xl transition-all group ${
                    isActive
                      ? 'bg-primary text-white shadow-medium'
                      : 'text-dark hover:bg-light'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            )
          })}
        </nav>
      </motion.aside>

      {/* Hover Reveal for Collapsed Sidebar */}
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed left-20 top-0 h-screen w-64 bg-white shadow-large z-20 pointer-events-none opacity-0 hover:opacity-100 transition-opacity"
        />
      )}
    </>
  )
}

export default Sidebar

