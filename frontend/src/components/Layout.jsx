import { useState, useEffect } from 'react'
import { useLocation, Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import BottomNav from './BottomNav'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const location = useLocation()
  const navigate = useNavigate()

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    // If no token or user, redirect to login
    if (!token || !user) {
      navigate('/login')
    }
  }, [navigate])

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [isMobile, sidebarOpen])

  // Desktop Layout
  if (!isMobile) {
    return (
      <div className="flex w-full h-screen overflow-hidden">
        {/* Sidebar - Desktop */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden bg-background">
          {/* Header */}
          <Header 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            showMenuButton={false}
          />

          {/* Content */}
          <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
            <div className="max-w-7xl mx-auto w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    )
  }

  // Mobile Layout
  return (
    <>
      {/* Main Container - Mobile */}
      <div className="flex w-full h-screen overflow-hidden bg-background">
        {/* Main Content - Always full width on mobile */}
        <div className="flex flex-col flex-1 overflow-hidden bg-background w-full">
          {/* Header */}
          <Header 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            showMenuButton={true}
          />

          {/* Content */}
          <main className="flex-1 overflow-auto p-3 sm:p-4">
            <div className="max-w-7xl mx-auto w-full">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Bottom Nav - Mobile */}
        <BottomNav currentPath={location.pathname} />
      </div>

      {/* Mobile Sidebar - Fixed overlay */}
      {sidebarOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar */}
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-50 transition-transform duration-300 ease-in-out">
            <Sidebar 
              isOpen={true} 
              onToggle={() => setSidebarOpen(false)}
              onLinkClick={() => setSidebarOpen(false)}
              isMobile={true}
            />
          </div>
        </>
      )}
    </>
  )
}

export default Layout
