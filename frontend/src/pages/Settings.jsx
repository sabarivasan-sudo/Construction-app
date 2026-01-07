import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { FiSettings, FiUser, FiBell, FiShield, FiGlobe, FiSave } from 'react-icons/fi'
import Toast from '../components/Toast'
import { useLanguage } from '../contexts/LanguageContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Settings = () => {
  const { t, changeLanguage } = useLanguage()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toasts, setToasts] = useState([])
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: ''
  })

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    taskReminders: true,
    issueAlerts: true
  })

  // General settings state
  const [generalSettings, setGeneralSettings] = useState({
    language: 'English',
    timezone: 'IST (UTC+5:30)',
    dateFormat: 'DD/MM/YYYY'
  })

  useEffect(() => {
    fetchUserProfile()
    // Load notification preferences from localStorage
    const savedNotifications = localStorage.getItem('notificationPreferences')
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications))
      } catch (e) {
      }
    }
    // Load general settings from localStorage
    const savedGeneral = localStorage.getItem('generalSettings')
    if (savedGeneral) {
      try {
        setGeneralSettings(JSON.parse(savedGeneral))
      } catch (e) {
      }
    }
  }, [])

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/login'
        return
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const userData = data.user || data
        setUser(userData)
        setProfileData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || ''
        })
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    } catch (error) {
      showToast(t('errorLoadingProfile'), 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), 4000)
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/login'
        return
      }

      const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.data)
        // Update localStorage user data
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
        localStorage.setItem('user', JSON.stringify({
          ...storedUser,
          name: data.data.name,
          email: data.data.email,
          phone: data.data.phone
        }))
        showToast(t('profileUpdated'), 'success')
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update profile' }))
        showToast(errorData.message || t('errorUpdatingProfile'), 'error')
      }
    } catch (error) {
      showToast(t('errorUpdatingProfile'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast(t('passwordsDoNotMatch'), 'error')
      return
    }

    if (passwordData.newPassword.length < 6) {
      showToast(t('passwordTooShort'), 'error')
      return
    }

    setSaving(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/login'
        return
      }

      // Update password
      const response = await fetch(`${API_URL}/users/${user.id}/password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      if (response.ok) {
        showToast(t('passwordUpdated'), 'success')
        // Reset password form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update password' }))
        const errorMessage = errorData.message === 'Current password is incorrect' 
          ? t('currentPasswordIncorrect')
          : errorData.message || t('errorUpdatingPassword')
        showToast(errorMessage, 'error')
      }
    } catch (error) {
      showToast(t('errorUpdatingPassword'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationToggle = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] }
    setNotifications(updated)
    localStorage.setItem('notificationPreferences', JSON.stringify(updated))
    showToast(t('notificationPreferencesSaved'), 'success')
  }

  const handleGeneralSettingChange = (key, value) => {
    const updated = { ...generalSettings, [key]: value }
    setGeneralSettings(updated)
    localStorage.setItem('generalSettings', JSON.stringify(updated))
    
    // If language is being changed, update the language context
    if (key === 'language') {
      changeLanguage(value)
    }
    
    showToast(t('settingsSaved'), 'success')
  }

      if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">{t('loading')}</div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-20 md:pb-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-dark mb-2">{t('settings')}</h1>
        <p className="text-sm sm:text-base text-gray-500">Manage your application settings and preferences</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 sm:p-6 shadow-soft"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#6B4EFF]/10 flex items-center justify-center flex-shrink-0">
              <FiUser className="w-5 h-5 sm:w-6 sm:h-6 text-[#6B4EFF]" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-dark">{t('profileSettings')}</h2>
          </div>
          <form onSubmit={handleProfileUpdate}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">{t('fullName')}</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B4EFF]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">{t('email')}</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B4EFF]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">{t('phone')}</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B4EFF]"
                  placeholder="+91 98765 43210"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-[#6B4EFF] text-white rounded-xl hover:bg-[#5A3EE8] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSave className="w-5 h-5" />
                <span>{saving ? t('saving') : t('saveChanges')}</span>
              </button>
            </div>
          </form>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 sm:p-6 shadow-soft"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <FiBell className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-dark">{t('notifications')}</h2>
          </div>
          <div className="space-y-4">
            {[
              { key: 'email', labelKey: 'emailNotifications' },
              { key: 'push', labelKey: 'pushNotifications' },
              { key: 'sms', labelKey: 'smsNotifications' },
              { key: 'taskReminders', labelKey: 'taskReminders' },
              { key: 'issueAlerts', labelKey: 'issueAlerts' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-600">{t(item.labelKey)}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications[item.key]}
                    onChange={() => handleNotificationToggle(item.key)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#6B4EFF]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6B4EFF]"></div>
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
          className="bg-white rounded-xl p-4 sm:p-6 shadow-soft"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <FiShield className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-dark">{t('security')}</h2>
          </div>
          <form onSubmit={handlePasswordUpdate}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">{t('currentPassword')}</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B4EFF]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">{t('newPassword')}</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B4EFF]"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">{t('confirmNewPassword')}</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B4EFF]"
                  required
                  minLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-[#6B4EFF] text-white rounded-xl hover:bg-[#5A3EE8] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSave className="w-5 h-5" />
                <span>{saving ? t('updating') : t('updatePassword')}</span>
              </button>
            </div>
          </form>
        </motion.div>

        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-4 sm:p-6 shadow-soft"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <FiGlobe className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-dark">{t('general')}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">{t('language')}</label>
              <select
                value={generalSettings.language}
                onChange={(e) => handleGeneralSettingChange('language', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B4EFF]"
              >
                <option>English</option>
                <option>Hindi</option>
                <option>Spanish</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">{t('timeZone')}</label>
              <select
                value={generalSettings.timezone}
                onChange={(e) => handleGeneralSettingChange('timezone', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B4EFF]"
              >
                <option>IST (UTC+5:30)</option>
                <option>EST (UTC-5:00)</option>
                <option>PST (UTC-8:00)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark mb-2">{t('dateFormat')}</label>
              <select
                value={generalSettings.dateFormat}
                onChange={(e) => handleGeneralSettingChange('dateFormat', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B4EFF]"
              >
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <Toast toasts={toasts} removeToast={removeToast} />
      )}
    </motion.div>
  )
}

export default Settings
