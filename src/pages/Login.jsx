import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiEye, FiEyeOff, FiPackage, FiBriefcase } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showDemoAccounts, setShowDemoAccounts] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const navigate = useNavigate()

  const demoAccounts = [
    { role: 'Admin', email: 'admin@demo.com', password: '123456' },
    { role: 'Manager', email: 'manager@demo.com', password: '123456' },
    { role: 'Employee', email: 'employee@demo.com', password: '123456' },
  ]

  const handleLogin = (e) => {
    e.preventDefault()
    // Navigate to dashboard on login
    navigate('/')
  }

  const handleDemoLogin = (demoEmail, demoPassword, role) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    // Auto login after a brief delay with visual feedback
    setTimeout(() => {
      navigate('/')
    }, 500)
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden flex items-center justify-center">
      {/* Construction Site Video Background */}
      <div className="absolute inset-0 w-full h-full">
        {!videoError && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 0 }}
            onError={() => setVideoError(true)}
          >
            {/* 
              INSTRUCTIONS: Replace this with your construction site video
              1. Place your video file in: public/videos/construction-site.mp4
              2. Or use an external URL
              3. Recommended: MP4 format, 1080p or 720p, 10-30 seconds loop
              
              Example sources:
              - <source src="/videos/construction-site.mp4" type="video/mp4" />
              - <source src="https://your-cdn.com/construction-video.mp4" type="video/mp4" />
            */}
            <source src="/videos/31289-385265687.mp4" type="video/mp4" />
            {/* Fallback: If video doesn't exist, it will show animated background */}
          </video>
        )}
        
        {/* Subtle overlay - only on right side for text readability, keeping video colors natural */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent"
          style={{ zIndex: 1 }}
        />
      </div>

      {/* Animated Background Pattern - Fallback/Overlay - Reduced opacity to show video colors */}
      <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 1, pointerEvents: 'none' }}>
        {/* Construction Site Pattern - Animated Shapes - Very subtle */}
        <div className="absolute inset-0 opacity-5">
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [12, 15, 12],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute top-20 left-10 w-32 h-32 border-4 border-white/30 rounded-lg"
          />
          <motion.div
            animate={{
              y: [0, 15, 0],
              rotate: [-12, -15, -12],
              scale: [1, 0.9, 1]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5
            }}
            className="absolute top-40 right-20 w-24 h-24 border-4 border-white/30 rounded-lg"
          />
          <motion.div
            animate={{
              rotate: [45, 50, 45],
              scale: [1, 1.15, 1]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1
            }}
            className="absolute bottom-32 left-1/4 w-40 h-40 border-4 border-white/30 rounded-lg"
          />
          <motion.div
            animate={{
              y: [0, -15, 0],
              rotate: [-45, -50, -45],
              scale: [1, 0.95, 1]
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1.5
            }}
            className="absolute bottom-20 right-1/3 w-28 h-28 border-4 border-white/30 rounded-lg"
          />
        </div>

        {/* Grid Pattern - Very subtle */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 w-full flex items-center justify-end p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md transform scale-90 sm:scale-100"
        >
          {/* Glass Morphism Login Card */}
          <div
            className="relative backdrop-blur-xl rounded-2xl p-8 shadow-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
            }}
          >
            {/* Construction Animation - Top Right */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="absolute top-4 right-4"
            >
              <FiPackage className="w-8 h-8 text-white/80" />
            </motion.div>

            {/* Construction Animation - Bottom Left */}
            <motion.div
              animate={{
                x: [0, 10, 0],
                rotate: [0, -10, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5
              }}
              className="absolute bottom-4 left-4"
            >
              <FiBriefcase className="w-6 h-6 text-white/60" />
            </motion.div>

            {/* Logo/Title */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl font-bold text-white mb-2">ConstructPro</h1>
              <p className="text-white/80">Construction Management System</p>
            </motion.div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all"
                    required
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>

              {/* Forgot Password */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-end"
              >
                <a href="#" className="text-white/80 hover:text-white text-sm transition-colors">
                  Forgot Password?
                </a>
              </motion.div>

              {/* Sign In Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #FB923C, #F97316)',
                  boxShadow: '0 4px 15px rgba(249, 115, 22, 0.4)'
                }}
              >
                Sign In
              </motion.button>
            </form>

            {/* Demo Accounts Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8 pt-8 border-t border-white/20"
            >
              <button
                onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                className="w-full text-white/80 hover:text-white text-sm font-medium mb-4 transition-colors flex items-center justify-center gap-2"
              >
                <span>Demo Accounts</span>
                <motion.span
                  animate={{ rotate: showDemoAccounts ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  ▼
                </motion.span>
              </button>

              {showDemoAccounts && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  {demoAccounts.map((account, index) => (
                    <motion.button
                      key={account.role}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDemoLogin(account.email, account.password, account.role)}
                      className="w-full p-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-all text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-semibold">{account.role}</p>
                          <p className="text-white/70 text-xs mt-1">
                            {account.email} / {account.password}
                          </p>
                        </div>
                        <span className="text-white/60 text-sm">→</span>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-white/60 text-sm mt-6"
          >
            © 2024 ConstructPro. All rights reserved.
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}

export default Login

