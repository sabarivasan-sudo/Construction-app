import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  FiPlus, FiSearch, FiUser, FiMail, FiPhone, FiShield, FiX,
  FiEdit2, FiTrash2, FiMoreVertical, FiLock, FiBriefcase
} from 'react-icons/fi'
import Toast from '../components/Toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [deletingUser, setDeletingUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredUsers, setFilteredUsers] = useState([])
  const [toasts, setToasts] = useState([])
  const [openMenuId, setOpenMenuId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    phone: '',
    department: '',
    isActive: true,
    projects: []
  })
  const [projects, setProjects] = useState([])

  // Fetch users and projects
  useEffect(() => {
    fetchUsers()
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`${API_URL}/projects`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProjects(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  // Search and filter
  useEffect(() => {
    let filtered = [...users]
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query) ||
        user.department?.toLowerCase().includes(query) ||
        user.phone?.includes(query)
      )
    }
    setFilteredUsers(filtered)
  }, [searchQuery, users])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.menu-container')) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/login'
        return
      }

      const response = await fetch(`${API_URL}/users`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.data || [])
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch users' }))
        showToast(errorData.message || 'Failed to fetch users', 'error')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      showToast('Error fetching users', 'error')
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

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'employee',
      phone: '',
      department: '',
      isActive: true,
      projects: []
    })
    setEditingUser(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const payload = { ...formData }
      
      // Don't send password if editing and password is empty
      if (editingUser && !payload.password) {
        delete payload.password
      }

      const url = editingUser 
        ? `${API_URL}/users/${editingUser._id || editingUser.id}`
        : `${API_URL}/users`
      
      const method = editingUser ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.ok) {
        showToast(
          editingUser ? 'User updated successfully' : 'User created successfully',
          'success'
        )
        setShowModal(false)
        resetForm()
        fetchUsers()
      } else {
        showToast(data.message || 'Failed to save user', 'error')
      }
    } catch (error) {
      console.error('Error saving user:', error)
      showToast('Error saving user', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (user) => {
    setOpenMenuId(null)
    setEditingUser(user)
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '', // Don't pre-fill password
      role: user.role || 'employee',
      phone: user.phone || '',
      department: user.department || '',
      isActive: user.isActive !== undefined ? user.isActive : true
    })
    setShowModal(true)
  }

  const handleDelete = async () => {
    if (!deletingUser) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/users/${deletingUser._id || deletingUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        showToast('User deactivated successfully', 'success')
        setDeletingUser(null)
        fetchUsers()
      } else {
        showToast(data.message || 'Failed to deactivate user', 'error')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      showToast('Error deactivating user', 'error')
    }
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const getRoleLabel = (role) => {
    const labels = {
      'admin': 'Admin',
      'manager': 'Manager',
      'employee': 'Employee',
      'viewer': 'Viewer'
    }
    return labels[role] || role
  }

  const getRoleDisplayName = (role) => {
    // Map backend roles to display names
    const roleMap = {
      'admin': 'Administrator',
      'manager': 'Project Manager',
      'employee': 'Site Engineer',
      'viewer': 'Quality Inspector'
    }
    return roleMap[role] || role
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark mb-2">Users</h1>
          <p className="text-gray-500">Manage system users and access</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-6 py-3 bg-[#6B4EFF] text-white rounded-xl hover:shadow-lg transition-all hover:scale-105"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add User</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent shadow-sm"
        />
      </div>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <FiUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No users found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user, index) => {
            const initials = getInitials(user.name)
            const isActive = user.isActive !== undefined ? user.isActive : true
            
            return (
              <motion.div
                key={user._id || user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-soft card-hover relative group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-[#6B4EFF] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {user.avatar || initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-dark truncate">{user.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{getRoleDisplayName(user.role)}</p>
                  </div>
                  <div className="relative menu-container">
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(openMenuId === (user._id || user.id) ? null : (user._id || user.id))}
                      className="p-2 rounded-lg hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <FiMoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                    {openMenuId === (user._id || user.id) && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            handleEdit(user)
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-left text-dark hover:bg-gray-50 transition-colors"
                        >
                          <FiEdit2 className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            setDeletingUser(user)
                            setOpenMenuId(null)
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          <span>Deactivate</span>
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {user.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <FiMail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600 truncate">{user.email}</span>
                    </div>
                  )}
                  {user.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <FiPhone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600">{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <FiShield className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600">{getRoleLabel(user.role)}</span>
                  </div>
                  {user.projects && user.projects.length > 0 && (
                    <div className="flex items-start gap-2 text-sm">
                      <FiBriefcase className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="text-gray-600 font-medium">Assigned Projects:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.projects.map((project, idx) => (
                            <span key={project._id || project.id || idx} className="px-2 py-0.5 bg-[#6B4EFF]/10 text-[#6B4EFF] rounded-md text-xs">
                              {project.name || project}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    isActive 
                      ? 'bg-green-50 text-green-600' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {isActive ? 'active' : 'inactive'}
                  </span>
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-[#6B4EFF] text-sm font-medium hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Add/Edit User Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => {
                setShowModal(false)
                resetForm()
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div>
                    <h2 className="text-2xl font-bold text-dark">
                      {editingUser ? 'Edit User' : 'Add User'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Manage system users and access</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                    className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FiX className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                {/* Modal Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          placeholder="John Doe"
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          placeholder="john.doe@example.com"
                          disabled={!!editingUser}
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                      {editingUser && (
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password {!editingUser && <span className="text-red-500">*</span>}
                        {editingUser && <span className="text-gray-500 text-xs">(Leave blank to keep current)</span>}
                      </label>
                      <div className="relative">
                        <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required={!editingUser}
                          minLength={6}
                          placeholder={editingUser ? "Enter new password (optional)" : "Minimum 6 characters"}
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Role and Phone */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Role <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FiShield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            required
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                          >
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="employee">Employee</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <div className="relative">
                          <FiPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+91 98765 43210"
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Projects Assignment */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assigned Projects
                        <span className="text-gray-500 text-xs ml-2">(User will only see selected projects)</span>
                      </label>
                      <div className="relative">
                        <FiBriefcase className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                        <select
                          multiple
                          value={formData.projects}
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, option => option.value)
                            setFormData({ ...formData, projects: selected })
                          }}
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent min-h-[120px]"
                        >
                          {projects.map((project) => (
                            <option key={project._id || project.id} value={project._id || project.id}>
                              {project.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Hold Ctrl (Windows) or Cmd (Mac) to select multiple projects
                        </p>
                      </div>
                    </div>

                    {/* Department and Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department
                        </label>
                        <div className="relative">
                          <FiBriefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            placeholder="e.g., Engineering, Operations"
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          value={formData.isActive ? 'active' : 'inactive'}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex items-center justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false)
                        resetForm()
                      }}
                      className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 rounded-xl bg-[#6B4EFF] text-white hover:bg-[#5a3fe6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                      {submitting ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setDeletingUser(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              >
                <h3 className="text-xl font-bold text-dark mb-2">Deactivate User</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to deactivate "{deletingUser.name}"? They will no longer be able to access the system.
                </p>
                <div className="flex items-center justify-end gap-4">
                  <button
                    onClick={() => setDeletingUser(null)}
                    className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    Deactivate
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <Toast toasts={toasts} removeToast={removeToast} />
      )}
    </div>
  )
}

export default Users
