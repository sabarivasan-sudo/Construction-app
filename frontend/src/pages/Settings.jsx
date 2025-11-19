import { motion } from 'framer-motion'
import { FiSettings, FiUser, FiBell, FiShield, FiGlobe, FiSave } from 'react-icons/fi'

const Settings = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-20 md:pb-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-dark mb-2">Settings</h1>
        <p className="text-gray-500">Manage your application settings and preferences</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-soft"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FiUser className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-dark">Profile Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Full Name</label>
              <input
                type="text"
                defaultValue="John Doe"
                className="w-full px-4 py-3 rounded-xl border border-light bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Email</label>
              <input
                type="email"
                defaultValue="john.doe@example.com"
                className="w-full px-4 py-3 rounded-xl border border-light bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Phone</label>
              <input
                type="tel"
                defaultValue="+91 98765 43210"
                className="w-full px-4 py-3 rounded-xl border border-light bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:shadow-medium transition-all">
              <FiSave className="w-5 h-5" />
              <span>Save Changes</span>
            </button>
          </div>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-soft"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <FiBell className="w-6 h-6 text-secondary" />
            </div>
            <h2 className="text-xl font-bold text-dark">Notifications</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Email Notifications', checked: true },
              { label: 'Push Notifications', checked: true },
              { label: 'SMS Notifications', checked: false },
              { label: 'Task Reminders', checked: true },
              { label: 'Issue Alerts', checked: true },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-light last:border-0">
                <span className="text-sm text-gray-600">{item.label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={item.checked}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-soft"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
              <FiShield className="w-6 h-6 text-danger" />
            </div>
            <h2 className="text-xl font-bold text-dark">Security</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Current Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-light bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">New Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-light bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Confirm New Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-light bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:shadow-medium transition-all">
              <FiSave className="w-5 h-5" />
              <span>Update Password</span>
            </button>
          </div>
        </motion.div>

        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-soft"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <FiGlobe className="w-6 h-6 text-success" />
            </div>
            <h2 className="text-xl font-bold text-dark">General</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Language</label>
              <select className="w-full px-4 py-3 rounded-xl border border-light bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                <option>English</option>
                <option>Hindi</option>
                <option>Spanish</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Time Zone</label>
              <select className="w-full px-4 py-3 rounded-xl border border-light bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                <option>IST (UTC+5:30)</option>
                <option>EST (UTC-5:00)</option>
                <option>PST (UTC-8:00)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">Date Format</label>
              <select className="w-full px-4 py-3 rounded-xl border border-light bg-background focus:outline-none focus:ring-2 focus:ring-primary">
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Settings

