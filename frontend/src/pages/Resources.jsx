import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  FiPlus, FiUsers, FiTruck, FiBriefcase, FiX, FiEdit2, FiTrash2,
  FiMoreVertical, FiCalendar, FiDollarSign, FiPackage, FiMessageSquare
} from 'react-icons/fi'
import Toast from '../components/Toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Resources = () => {
  const [resources, setResources] = useState([])
  const [summary, setSummary] = useState({
    labour: [],
    machinery: [],
    subcontractor: []
  })
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingResource, setEditingResource] = useState(null)
  const [deletingResource, setDeletingResource] = useState(null)
  const [toasts, setToasts] = useState([])
  const [openMenuId, setOpenMenuId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'labour',
    project: '',
    quantity: '1',
    unit: '',
    cost: '',
    status: 'available',
    startDate: '',
    endDate: '',
    notes: ''
  })

  // Fetch data
  useEffect(() => {
    fetchResources()
    fetchSummary()
    fetchProjects()
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

  const fetchResources = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/login'
        return
      }

      const response = await fetch(`${API_URL}/resources`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setResources(data.data || [])
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`${API_URL}/resources/summary`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSummary(data.data || { labour: [], machinery: [], subcontractor: [] })
      }
    } catch (error) {
    }
  }

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
      type: 'labour',
      project: '',
      quantity: '1',
      unit: '',
      cost: '',
      status: 'available',
      startDate: '',
      endDate: '',
      notes: ''
    })
    setEditingResource(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const payload = {
        ...formData,
        quantity: parseFloat(formData.quantity) || 1,
        cost: parseFloat(formData.cost) || 0,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined
      }

      const url = editingResource 
        ? `${API_URL}/resources/${editingResource._id || editingResource.id}`
        : `${API_URL}/resources`
      
      const method = editingResource ? 'PUT' : 'POST'

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
          editingResource ? 'Resource updated successfully' : 'Resource added successfully',
          'success'
        )
        setShowModal(false)
        resetForm()
        fetchResources()
        fetchSummary()
      } else {
        showToast(data.message || 'Failed to save resource', 'error')
      }
    } catch (error) {
      showToast('Error saving resource', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (resource) => {
    setOpenMenuId(null)
    setEditingResource(resource)
    setFormData({
      name: resource.name || '',
      type: resource.type || 'labour',
      project: typeof resource.project === 'object' ? resource.project._id : resource.project || '',
      quantity: resource.quantity?.toString() || '1',
      unit: resource.unit || '',
      cost: resource.cost?.toString() || '',
      status: resource.status || 'available',
      startDate: resource.startDate 
        ? new Date(resource.startDate).toISOString().split('T')[0]
        : '',
      endDate: resource.endDate 
        ? new Date(resource.endDate).toISOString().split('T')[0]
        : '',
      notes: resource.notes || ''
    })
    setShowModal(true)
  }

  const handleDelete = async () => {
    if (!deletingResource) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/resources/${deletingResource._id || deletingResource.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        showToast('Resource deleted successfully', 'success')
        setDeletingResource(null)
        fetchResources()
        fetchSummary()
      } else {
        showToast(data.message || 'Failed to delete resource', 'error')
      }
    } catch (error) {
      showToast('Error deleting resource', 'error')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
      case 'operational':
      case 'active':
        return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' }
      case 'in-use':
        return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' }
      case 'maintenance':
        return { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' }
      case 'unavailable':
        return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' }
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' }
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      'available': 'Active',
      'in-use': 'In Use',
      'maintenance': 'Maintenance',
      'unavailable': 'Unavailable',
      'operational': 'Operational',
      'active': 'Active'
    }
    return labels[status] || status
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'labour':
        return { icon: 'text-[#6B4EFF]', bg: 'bg-[#6B4EFF]/10', count: 'text-[#6B4EFF]' }
      case 'machinery':
        return { icon: 'text-teal-500', bg: 'bg-teal-500/10', count: 'text-teal-500' }
      case 'subcontractor':
        return { icon: 'text-green-500', bg: 'bg-green-500/10', count: 'text-green-500' }
      default:
        return { icon: 'text-gray-500', bg: 'bg-gray-500/10', count: 'text-gray-500' }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading resources...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark mb-2">Resources</h1>
          <p className="text-gray-500">Manage labour, machinery, and subcontractors</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-6 py-3 bg-[#6B4EFF] text-white rounded-xl hover:shadow-lg transition-all hover:scale-105"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add Resource</span>
        </button>
      </div>

      {/* Labour Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-soft"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-[#6B4EFF]/10 flex items-center justify-center">
            <FiUsers className="w-6 h-6 text-[#6B4EFF]" />
          </div>
          <h2 className="text-xl font-bold text-dark">Labour</h2>
        </div>
        {summary.labour.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No labour resources</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {summary.labour.map((item, index) => {
              const statusColors = getStatusColor(item.status)
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="border border-gray-100 rounded-xl p-4 hover:shadow-medium transition-shadow relative group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-dark">{item.name}</h3>
                  </div>
                  <p className="text-2xl font-bold text-[#6B4EFF] mb-1">{item.count}</p>
                  <span className="text-xs text-gray-500 capitalize">{getStatusLabel(item.status)}</span>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Machinery Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-6 shadow-soft"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center">
            <FiTruck className="w-6 h-6 text-teal-500" />
          </div>
          <h2 className="text-xl font-bold text-dark">Machinery</h2>
        </div>
        {summary.machinery.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No machinery resources</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {summary.machinery.map((item, index) => {
              const statusColors = getStatusColor(item.status)
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="border border-gray-100 rounded-xl p-4 hover:shadow-medium transition-shadow relative group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-dark">{item.name}</h3>
                  </div>
                  <p className="text-2xl font-bold text-teal-500 mb-1">{item.count}</p>
                  <span className={`text-xs px-2 py-1 rounded-lg ${statusColors.bg} ${statusColors.text}`}>
                    {getStatusLabel(item.status)}
                  </span>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Subcontractors Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl p-6 shadow-soft"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
            <FiBriefcase className="w-6 h-6 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-dark">Subcontractors</h2>
        </div>
        {summary.subcontractor.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No subcontractor resources</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {summary.subcontractor.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="border border-gray-100 rounded-xl p-6 hover:shadow-medium transition-shadow card-hover relative group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-dark">{item.name}</h3>
                </div>
                <p className="text-sm text-gray-500 mb-3">Subcontractor</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Active Projects</span>
                  <span className="text-lg font-bold text-green-500">{item.projects}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Add/Edit Resource Modal */}
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
                      {editingResource ? 'Edit Resource' : 'Add Resource'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Manage labour, machinery, and subcontractors</p>
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
                    {/* Resource Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resource Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                      >
                        <option value="labour">Labour</option>
                        <option value="machinery">Machinery</option>
                        <option value="subcontractor">Subcontractor</option>
                      </select>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FiPackage className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          placeholder="e.g., Construction Workers, Excavator, ABC Electrical Works"
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Project */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FiBriefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                          value={formData.project}
                          onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                          required
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                        >
                          <option value="">Select Project</option>
                          {projects.map(project => (
                            <option key={project._id || project.id} value={project._id || project.id}>
                              {project.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Quantity and Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                          required
                          min="1"
                          placeholder="1"
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                        >
                          <option value="available">Available</option>
                          <option value="in-use">In Use</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="unavailable">Unavailable</option>
                        </select>
                      </div>
                    </div>

                    {/* Unit and Cost */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Unit
                        </label>
                        <input
                          type="text"
                          value={formData.unit}
                          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                          placeholder="e.g., workers, units, hours"
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cost (₹)
                        </label>
                        <div className="relative">
                          <FiDollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="number"
                            value={formData.cost}
                            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Start Date and End Date */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date
                        </label>
                        <div className="relative">
                          <FiCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date
                        </label>
                        <div className="relative">
                          <FiCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <div className="relative">
                        <FiMessageSquare className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="Enter additional notes..."
                          rows={3}
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent resize-none"
                        />
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
                      {submitting ? 'Saving...' : editingResource ? 'Update Resource' : 'Add Resource'}
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
        {deletingResource && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setDeletingResource(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              >
                <h3 className="text-xl font-bold text-dark mb-2">Delete Resource</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this resource? This action cannot be undone.
                </p>
                <div className="flex items-center justify-end gap-4">
                  <button
                    onClick={() => setDeletingResource(null)}
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

export default Resources
