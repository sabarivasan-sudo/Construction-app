import { useState, useEffect, useRef } from 'react'
import { FiSearch, FiBell, FiMenu, FiLogOut, FiUser, FiChevronDown } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

const Header = ({ onMenuClick, showMenuButton }) => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        setUser(JSON.parse(userStr))
      } catch (e) {
      }
    }

    // Listen for storage changes (in case user logs out from another tab)
    const handleStorageChange = () => {
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        setUser(null)
        navigate('/login')
      } else {
        try {
          setUser(JSON.parse(userStr))
        } catch (e) {
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [navigate])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  const handleLogout = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Clear all storage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // Force navigation to login page
    window.location.href = '/login'
  }

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Get role display name
  const getRoleDisplay = (role) => {
    const roleMap = {
      admin: 'Administrator',
      manager: 'Project Manager',
      employee: 'Employee',
      viewer: 'Viewer'
    }
    return roleMap[role] || role
  }

  return (
    <header className="h-16 flex items-center justify-between px-2 sm:px-4 border-b bg-white shadow-soft"
    >
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        {showMenuButton && (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-light transition-colors flex-shrink-0"
          >
            <FiMenu className="w-5 h-5 sm:w-6 sm:h-6 text-dark" />
          </button>
        )}

        {/* Search Bar - Hidden on very small screens, shown on sm+ */}
        <div className="relative flex-1 max-w-md hidden sm:block">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search projects, tasks, materials..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-light bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-light transition-colors">
          <FiBell className="w-5 h-5 sm:w-6 sm:h-6 text-dark" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
        </button>

        {/* User Menu */}
        {user && (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg hover:bg-light transition-colors"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
                {getInitials(user.name)}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-dark truncate max-w-[120px]">{user.name}</p>
                <p className="text-xs text-gray-500 truncate max-w-[120px]">{getRoleDisplay(user.role)}</p>
              </div>
              <FiChevronDown className={`w-4 h-4 text-gray-500 transition-transform hidden sm:block ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-large border border-gray-100 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-semibold text-dark truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  <p className="text-xs text-gray-400 mt-1">{getRoleDisplay(user.role)}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

export default Header

