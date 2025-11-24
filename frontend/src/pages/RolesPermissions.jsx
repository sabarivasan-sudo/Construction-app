import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  FiPlus, FiShield, FiCheck, FiX, FiEdit2, FiTrash2, FiMoreVertical
} from 'react-icons/fi'
import Toast from '../components/Toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const RolesPermissions = () => {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [deletingRole, setDeletingRole] = useState(null)
  const [toasts, setToasts] = useState([])
  const [openMenuId, setOpenMenuId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: {
      projects: false,
      tasks: false,
      issues: false,
      attendance: false,
      inventory: false,
      siteTransfer: false,
      consumption: false,
      pettyCash: false,
      resources: false,
      reports: false,
      users: false,
      roles: false,
      settings: false
    },
    isActive: true
  })

  const permissionLabels = {
    projects: 'Projects',
    tasks: 'Tasks',
    issues: 'Issues',
    attendance: 'Attendance',
    inventory: 'Inventory',
    siteTransfer: 'Site Transfer',
    consumption: 'Consumption',
    pettyCash: 'Petty Cash',
    resources: 'Resources',
    reports: 'Reports',
    users: 'Users',
    roles: 'Roles & Permissions',
    settings: 'Settings'
  }

  // Fetch roles
  useEffect(() => {
    fetchRoles()
  }, [])

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

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/login'
        return
      }

      const response = await fetch(`${API_URL}/roles`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setRoles(data.data || [])
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch roles' }))
        showToast(errorData.message || 'Failed to fetch roles', 'error')
      }
    } catch (error) {
      console.error('Error fetching roles:', error)
      showToast('Error fetching roles', 'error')
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
      description: '',
      permissions: {
        projects: false,
        tasks: false,
        issues: false,
        attendance: false,
        inventory: false,
        siteTransfer: false,
        consumption: false,
        pettyCash: false,
        resources: false,
        reports: false,
        users: false,
        roles: false,
        settings: false
      },
      isActive: true
    })
    setEditingRole(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const payload = formData

      const url = editingRole 
        ? `${API_URL}/roles/${editingRole._id || editingRole.id}`
        : `${API_URL}/roles`
      
      const method = editingRole ? 'PUT' : 'POST'

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
          editingRole ? 'Role updated successfully' : 'Role created successfully',
          'success'
        )
        setShowModal(false)
        resetForm()
        fetchRoles()
      } else {
        showToast(data.message || 'Failed to save role', 'error')
      }
    } catch (error) {
      console.error('Error saving role:', error)
      showToast('Error saving role', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (role) => {
    setOpenMenuId(null)
    setEditingRole(role)
    setFormData({
      name: role.name || '',
      description: role.description || '',
      permissions: {
        projects: role.permissions?.projects || false,
        tasks: role.permissions?.tasks || false,
        issues: role.permissions?.issues || false,
        attendance: role.permissions?.attendance || false,
        inventory: role.permissions?.inventory || false,
        siteTransfer: role.permissions?.siteTransfer || false,
        consumption: role.permissions?.consumption || false,
        pettyCash: role.permissions?.pettyCash || false,
        resources: role.permissions?.resources || false,
        reports: role.permissions?.reports || false,
        users: role.permissions?.users || false,
        roles: role.permissions?.roles || false,
        settings: role.permissions?.settings || false
      },
      isActive: role.isActive !== undefined ? role.isActive : true
    })
    setShowModal(true)
  }

  const handleDelete = async () => {
    if (!deletingRole) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/roles/${deletingRole._id || deletingRole.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        showToast('Role deleted successfully', 'success')
        setDeletingRole(null)
        fetchRoles()
      } else {
        showToast(data.message || 'Failed to delete role', 'error')
      }
    } catch (error) {
      console.error('Error deleting role:', error)
      showToast('Error deleting role', 'error')
    }
  }

  const togglePermission = (permissionKey) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [permissionKey]: !formData.permissions[permissionKey]
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading roles...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark mb-2">Roles & Permissions</h1>
          <p className="text-gray-500">Manage user roles and access permissions</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-6 py-3 bg-[#6B4EFF] text-white rounded-xl hover:shadow-lg transition-all hover:scale-105"
        >
          <FiPlus className="w-5 h-5" />
          <span>New Role</span>
        </button>
      </div>

      {/* Roles Grid */}
      {roles.length === 0 ? (
        <div className="text-center py-12">
          <FiShield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No roles found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {roles.map((role, index) => (
            <motion.div
              key={role._id || role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-soft card-hover relative group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#6B4EFF]/10 flex items-center justify-center">
                    <FiShield className="w-6 h-6 text-[#6B4EFF]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-dark">{role.name}</h3>
                    <p className="text-sm text-gray-500">{role.users || 0} users</p>
                  </div>
                </div>
                <div className="relative menu-container">
                  <button
                    type="button"
                    onClick={() => setOpenMenuId(openMenuId === (role._id || role.id) ? null : (role._id || role.id))}
                    className="p-2 rounded-lg hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <FiMoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                  {openMenuId === (role._id || role.id) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          handleEdit(role)
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
                          setDeletingRole(role)
                          setOpenMenuId(null)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-dark mb-3">Permissions</h4>
                {Object.entries(permissionLabels).map(([key, label]) => {
                  const hasPermission = role.permissions?.[key] || false
                  return (
                    <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-600">{label}</span>
                      {hasPermission ? (
                        <FiCheck className="w-5 h-5 text-green-500" />
                      ) : (
                        <FiX className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Role Modal */}
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
                      {editingRole ? 'Edit Role' : 'New Role'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Manage user roles and access permissions</p>
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
                    {/* Role Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FiShield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          placeholder="e.g., Project Manager, Site Engineer"
                          disabled={!!editingRole}
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                        />
                      </div>
                      {editingRole && (
                        <p className="text-xs text-gray-500 mt-1">Role name cannot be changed</p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter role description..."
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Permissions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Permissions
                      </label>
                      <div className="space-y-3 border border-gray-200 rounded-xl p-4 bg-gray-50">
                        {Object.entries(permissionLabels).map(([key, label]) => (
                          <div 
                            key={key} 
                            className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0 cursor-pointer hover:bg-white rounded-lg px-2 transition-colors"
                            onClick={() => togglePermission(key)}
                          >
                            <span className="text-sm text-gray-700 font-medium">{label}</span>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.permissions[key] || false}
                                onChange={() => togglePermission(key)}
                                className="w-5 h-5 rounded border-gray-300 text-[#6B4EFF] focus:ring-[#6B4EFF] cursor-pointer"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status */}
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
                      {submitting ? 'Saving...' : editingRole ? 'Update Role' : 'Create Role'}
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
        {deletingRole && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setDeletingRole(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              >
                <h3 className="text-xl font-bold text-dark mb-2">Delete Role</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete the role "{deletingRole.name}"? This action cannot be undone.
                  {deletingRole.users > 0 && (
                    <span className="block mt-2 text-red-600 font-medium">
                      Warning: {deletingRole.users} user(s) are assigned to this role.
                    </span>
                  )}
                </p>
                <div className="flex items-center justify-end gap-4">
                  <button
                    onClick={() => setDeletingRole(null)}
                    className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    Delete
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

export default RolesPermissions
