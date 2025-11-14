import { FiSearch, FiBell, FiMenu, FiLogOut } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

const Header = ({ onMenuClick, showMenuButton }) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    // Clear any auth state if needed
    // Navigate to login page
    navigate('/login')
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-semibold">
            JD
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-dark">John Doe</p>
            <p className="text-xs text-gray-500">Project Manager</p>
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
      </div>
    </header>
  )
}

export default Header

