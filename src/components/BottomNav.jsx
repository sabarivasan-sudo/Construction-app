import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiLayout,
  FiBriefcase,
  FiCheckSquare,
  FiAlertCircle,
  FiMoreVertical
} from 'react-icons/fi'

const navItems = [
  { path: '/', icon: FiLayout, label: 'Dashboard' },
  { path: '/projects', icon: FiBriefcase, label: 'Projects' },
  { path: '/tasks', icon: FiCheckSquare, label: 'Tasks' },
  { path: '/issues', icon: FiAlertCircle, label: 'Issues' },
  { path: '/settings', icon: FiMoreVertical, label: 'More' },
]

const BottomNav = ({ currentPath }) => {
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-light shadow-large z-50 md:hidden"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPath === item.path || 
            (item.path === '/' && currentPath === '/') ||
            (item.path !== '/' && currentPath.startsWith(item.path))
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all"
            >
              <Icon
                className={`w-6 h-6 transition-colors ${
                  isActive ? 'text-primary' : 'text-gray-400'
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  isActive ? 'text-primary' : 'text-gray-400'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"
                />
              )}
            </NavLink>
          )
        })}
      </div>
    </motion.nav>
  )
}

export default BottomNav

