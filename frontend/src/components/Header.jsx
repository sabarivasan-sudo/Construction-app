import { useState, useEffect } from 'react'
import { FiSearch, FiBell, FiMenu, FiLogOut } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

const Header = ({ onMenuClick, showMenuButton }) => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        setUser(JSON.parse(userStr))
      } catch (e) {
        console.error('Error parsing user data:', e)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
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
    <header className="h-16 flex items-center justify-between px-4 border-b bg-white shadow-soft"
    >
      <div className="flex items-center gap-4 flex-1">
        {showMenuButton && (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-light transition-colors"
          >
            <FiMenu className="w-6 h-6 text-dark" />
          </button>
        )}

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search projects, tasks, materials..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-light bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-light transition-colors">
          <FiBell className="w-6 h-6 text-dark" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
        </button>

        {/* User Avatar */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-semibold">
              {getInitials(user.name)}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-dark">{user.name}</p>
              <p className="text-xs text-gray-500">{getRoleDisplay(user.role)}</p>
            </div>
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="ml-4 p-2 rounded-lg hover:bg-light transition-colors group"
              title="Logout"
            >
              <FiLogOut className="w-5 h-5 text-dark group-hover:text-primary transition-colors" />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header

