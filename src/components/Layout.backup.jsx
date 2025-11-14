// BACKUP VERSION - Use this if main version has issues
// This is a simpler, more bulletproof version

import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import Header from './Header'
import BottomNav from './BottomNav'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const location = useLocation()

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

  return (
    <div className="flex h-screen bg-background overflow-hidden" style={{ width: '100%', maxWidth: '100%' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
      )}

      {/* Main Content - ALWAYS 100% width */}
      <div 
        className="flex-1 flex flex-col overflow-hidden"
        style={{ 
          width: '100%',
          maxWidth: '100%',
          minWidth: 0
        }}
      >
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showMenuButton={isMobile}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8" style={{ width: '100%' }}>
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar - RENDERED LAST, COMPLETELY SEPARATE */}
      {isMobile && (
        <>
          <AnimatePresence>
            {sidebarOpen && (
              <>
                {/* Overlay */}
                <div
                  onClick={() => setSidebarOpen(false)}
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 9998,
                    pointerEvents: 'auto'
                  }}
                />
                {/* Sidebar */}
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: sidebarOpen ? 0 : -280,
                    width: '280px',
                    height: '100vh',
                    backgroundColor: 'white',
                    zIndex: 9999,
                    transition: 'left 0.3s ease',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <Sidebar 
                    isOpen={true} 
                    onToggle={() => setSidebarOpen(false)}
                    onLinkClick={() => setSidebarOpen(false)}
                    isMobile={true}
                  />
                </div>
              </>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Bottom Nav */}
      {isMobile && <BottomNav currentPath={location.pathname} />}
    </div>
  )
}

export default Layout

