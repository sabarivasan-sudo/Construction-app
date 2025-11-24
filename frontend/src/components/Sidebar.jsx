import { NavLink } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
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

const Sidebar = ({ isOpen, onToggle, onLinkClick, isMobile = false }) => {
  // Mobile sidebar - fixed width
  if (isMobile) {
    return (
      <aside className="h-full w-full bg-white border-r border-light shadow-soft overflow-y-auto">
        {/* Toggle Button */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-light sticky top-0 bg-white z-10">
          <h1 className="text-lg sm:text-xl font-bold text-dark truncate">ConstructPro</h1>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-light transition-colors flex-shrink-0"
          >
            <FiChevronLeft className="w-5 h-5 text-dark" />
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
                  `flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 mb-1 rounded-xl transition-all text-sm sm:text-base ${
                    isActive
                      ? 'bg-primary text-white shadow-medium'
                      : 'text-dark hover:bg-light'
                  }`
                }
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="font-medium truncate">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </aside>
    )
  }

  // Desktop sidebar - dynamic width with exact classes
  return (
    <aside
      className={`h-full transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? 'w-64' : 'w-20'
      } bg-white border-r border-light shadow-soft relative flex flex-col`}
    >
      {/* Toggle Button */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-light flex-shrink-0">
        <AnimatePresence>
          {isOpen && (
            <h1 className="text-lg sm:text-xl font-bold text-dark truncate">ConstructPro</h1>
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-light transition-colors flex-shrink-0"
        >
          {isOpen ? (
            <FiChevronLeft className="w-5 h-5 text-dark" />
          ) : (
            <FiChevronRight className="w-5 h-5 text-dark" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-2 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 mb-1 rounded-xl transition-all text-sm sm:text-base ${
                  isActive
                    ? 'bg-primary text-white shadow-medium'
                    : 'text-dark hover:bg-light'
                }`
              }
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <AnimatePresence>
                {isOpen && (
                  <span className="font-medium truncate">{item.label}</span>
                )}
              </AnimatePresence>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}

export default Sidebar
