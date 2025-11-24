import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

const translations = {
  en: {
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    search: 'Search',
    loading: 'Loading...',
    saving: 'Saving...',
    updating: 'Updating...',
    success: 'Success',
    error: 'Error',
    
    // Settings
    settings: 'Settings',
    profileSettings: 'Profile Settings',
    fullName: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    saveChanges: 'Save Changes',
    notifications: 'Notifications',
    emailNotifications: 'Email Notifications',
    pushNotifications: 'Push Notifications',
    smsNotifications: 'SMS Notifications',
    taskReminders: 'Task Reminders',
    issueAlerts: 'Issue Alerts',
    security: 'Security',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    updatePassword: 'Update Password',
    general: 'General',
    language: 'Language',
    timeZone: 'Time Zone',
    dateFormat: 'Date Format',
    
    // Dashboard
    dashboard: 'Dashboard',
    projects: 'Projects',
    tasks: 'Tasks',
    issues: 'Issues',
    attendance: 'Attendance',
    inventory: 'Inventory',
    siteTransfer: 'Site Transfer',
    consumption: 'Consumption',
    pettyCash: 'Petty Cash',
    resources: 'Resources',
    users: 'Users',
    reports: 'Reports',
    
    // Messages
    profileUpdated: 'Profile updated successfully',
    passwordUpdated: 'Password updated successfully',
    settingsSaved: 'Settings saved',
    notificationPreferencesSaved: 'Notification preferences saved',
    errorLoadingProfile: 'Error loading profile',
    errorUpdatingProfile: 'Error updating profile',
    errorUpdatingPassword: 'Error updating password',
    passwordsDoNotMatch: 'New passwords do not match',
    passwordTooShort: 'Password must be at least 6 characters',
    currentPasswordIncorrect: 'Current password is incorrect'
  },
  hi: {
    // Common
    save: 'सहेजें',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    close: 'बंद करें',
    search: 'खोजें',
    loading: 'लोड हो रहा है...',
    saving: 'सहेजा जा रहा है...',
    updating: 'अपडेट हो रहा है...',
    success: 'सफल',
    error: 'त्रुटि',
    
    // Settings
    settings: 'सेटिंग्स',
    profileSettings: 'प्रोफ़ाइल सेटिंग्स',
    fullName: 'पूरा नाम',
    email: 'ईमेल',
    phone: 'फ़ोन',
    saveChanges: 'परिवर्तन सहेजें',
    notifications: 'सूचनाएं',
    emailNotifications: 'ईमेल सूचनाएं',
    pushNotifications: 'पुश सूचनाएं',
    smsNotifications: 'एसएमएस सूचनाएं',
    taskReminders: 'कार्य अनुस्मारक',
    issueAlerts: 'समस्या अलर्ट',
    security: 'सुरक्षा',
    currentPassword: 'वर्तमान पासवर्ड',
    newPassword: 'नया पासवर्ड',
    confirmNewPassword: 'नया पासवर्ड पुष्टि करें',
    updatePassword: 'पासवर्ड अपडेट करें',
    general: 'सामान्य',
    language: 'भाषा',
    timeZone: 'समय क्षेत्र',
    dateFormat: 'दिनांक प्रारूप',
    
    // Dashboard
    dashboard: 'डैशबोर्ड',
    projects: 'प्रोजेक्ट्स',
    tasks: 'कार्य',
    issues: 'समस्याएं',
    attendance: 'उपस्थिति',
    inventory: 'इन्वेंटरी',
    siteTransfer: 'साइट ट्रांसफर',
    consumption: 'खपत',
    pettyCash: 'छोटी नकदी',
    resources: 'संसाधन',
    users: 'उपयोगकर्ता',
    reports: 'रिपोर्ट्स',
    
    // Messages
    profileUpdated: 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई',
    passwordUpdated: 'पासवर्ड सफलतापूर्वक अपडेट किया गया',
    settingsSaved: 'सेटिंग्स सहेजी गईं',
    notificationPreferencesSaved: 'सूचना प्राथमिकताएं सहेजी गईं',
    errorLoadingProfile: 'प्रोफ़ाइल लोड करने में त्रुटि',
    errorUpdatingProfile: 'प्रोफ़ाइल अपडेट करने में त्रुटि',
    errorUpdatingPassword: 'पासवर्ड अपडेट करने में त्रुटि',
    passwordsDoNotMatch: 'नए पासवर्ड मेल नहीं खाते',
    passwordTooShort: 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए',
    currentPasswordIncorrect: 'वर्तमान पासवर्ड गलत है'
  }
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    // Load language from localStorage
    const savedLanguage = localStorage.getItem('language')
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hi')) {
      setLanguage(savedLanguage)
    } else {
      // Check if generalSettings has language preference
      const generalSettings = localStorage.getItem('generalSettings')
      if (generalSettings) {
        try {
          const settings = JSON.parse(generalSettings)
          if (settings.language === 'Hindi') {
            setLanguage('hi')
          } else if (settings.language === 'English') {
            setLanguage('en')
          }
        } catch (e) {
          console.error('Error parsing general settings:', e)
        }
      }
    }
  }, [])

  const changeLanguage = (lang) => {
    const langCode = lang === 'Hindi' ? 'hi' : lang === 'English' ? 'en' : lang
    setLanguage(langCode)
    localStorage.setItem('language', langCode)
    
    // Also update generalSettings
    const generalSettings = localStorage.getItem('generalSettings')
    if (generalSettings) {
      try {
        const settings = JSON.parse(generalSettings)
        settings.language = lang
        localStorage.setItem('generalSettings', JSON.stringify(settings))
      } catch (e) {
        console.error('Error updating general settings:', e)
      }
    }
  }

  const t = (key) => {
    return translations[language]?.[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

