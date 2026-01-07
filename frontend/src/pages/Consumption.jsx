import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  FiPlus, FiShoppingCart, FiTrendingDown, FiX, FiPackage, FiCalendar,
  FiMapPin, FiEdit2, FiTrash2, FiMoreVertical, FiBriefcase, FiMessageSquare
} from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import Toast from '../components/Toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Consumption = () => {
  const [consumptions, setConsumptions] = useState([])
  const [materials, setMaterials] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingConsumption, setEditingConsumption] = useState(null)
  const [deletingConsumption, setDeletingConsumption] = useState(null)
  const [chartData, setChartData] = useState([])
  const [toasts, setToasts] = useState([])
  const [openMenuId, setOpenMenuId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    material: '',
    project: '',
    quantity: '',
    consumptionDate: new Date().toISOString().split('T')[0],
    purpose: '',
    location: ''
  })

  // Fetch data
  useEffect(() => {
    fetchConsumptions()
    fetchMaterials()
    fetchProjects()
    fetchWeeklyData()
  }, [])

  const fetchConsumptions = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/login'
        return
      }

      const response = await fetch(`${API_URL}/consumption`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setConsumptions(data.data || [])
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch consumptions' }))
        showToast(errorData.message || 'Failed to fetch consumptions', 'error')
      }
    } catch (error) {
      showToast('Error fetching consumptions', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchMaterials = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`${API_URL}/materials`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMaterials(data.data || [])
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

  const fetchWeeklyData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`${API_URL}/consumption/weekly`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setChartData(data.data || [])
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
      material: '',
      project: '',
      quantity: '',
      consumptionDate: new Date().toISOString().split('T')[0],
      purpose: '',
      location: ''
    })
    setEditingConsumption(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const payload = {
        ...formData,
        quantity: parseFloat(formData.quantity) || 0
      }

      const url = editingConsumption 
        ? `${API_URL}/consumption/${editingConsumption._id || editingConsumption.id}`
        : `${API_URL}/consumption`
      
      const method = editingConsumption ? 'PUT' : 'POST'

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
          editingConsumption ? 'Consumption updated successfully' : 'Consumption recorded successfully',
          'success'
        )
        setShowModal(false)
        resetForm()
        fetchConsumptions()
        fetchWeeklyData()
      } else {
        showToast(data.message || 'Failed to save consumption', 'error')
      }
    } catch (error) {
      showToast('Error saving consumption', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (consumption) => {
    setOpenMenuId(null)
    setEditingConsumption(consumption)
    setFormData({
      material: typeof consumption.material === 'object' ? consumption.material._id : consumption.material || '',
      project: typeof consumption.project === 'object' ? consumption.project._id : consumption.project || '',
      quantity: consumption.quantity?.toString() || '',
      consumptionDate: consumption.consumptionDate 
        ? new Date(consumption.consumptionDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      purpose: consumption.purpose || '',
      location: consumption.location || ''
    })
    setShowModal(true)
  }

  const handleDelete = async () => {
    if (!deletingConsumption) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/consumption/${deletingConsumption._id || deletingConsumption.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        showToast('Consumption deleted successfully', 'success')
        setDeletingConsumption(null)
        fetchConsumptions()
        fetchWeeklyData()
      } else {
        showToast(data.message || 'Failed to delete consumption', 'error')
      }
    } catch (error) {
      showToast('Error deleting consumption', 'error')
    }
  }

  const getUnitName = (unit) => {
    const units = {
      kg: 'kg',
      ton: 'tons',
      bag: 'bags',
      'cubic-meter': 'cubic meters',
      piece: 'pieces',
      other: 'units'
    }
    return units[unit] || unit
  }

  // Get unique consumptions grouped by material for display cards
  const getConsumptionSummary = () => {
    const summary = {}
    consumptions.forEach(cons => {
      const material = typeof cons.material === 'object' ? cons.material : null
      const project = typeof cons.project === 'object' ? cons.project : null
      if (material) {
        const key = material._id || material.id
        if (!summary[key]) {
          summary[key] = {
            material: material,
            totalQuantity: 0,
            project: project?.name || 'N/A'
          }
        }
        summary[key].totalQuantity += cons.quantity || 0
      }
    })
    return Object.values(summary).slice(0, 4) // Show top 4
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading consumption data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark mb-2">Material Consumption</h1>
          <p className="text-gray-500">Track material usage across projects</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-6 py-3 bg-[#6B4EFF] text-white rounded-xl hover:shadow-lg transition-all hover:scale-105"
        >
          <FiPlus className="w-5 h-5" />
          <span>Record Consumption</span>
        </button>
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-soft"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-dark">Weekly Consumption</h2>
          <FiTrendingDown className="w-6 h-6 text-[#6B4EFF]" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="name" stroke="#374151" />
            <YAxis stroke="#374151" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #F3F4F6',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="cement" fill="#6366F1" radius={[8, 8, 0, 0]} />
            <Bar dataKey="steel" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
            <Bar dataKey="bricks" fill="#10B981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="sand" fill="#F59E0B" radius={[8, 8, 0, 0]} />
            <Bar dataKey="gravel" fill="#EF4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Consumption List */}
      {consumptions.length === 0 ? (
        <div className="text-center py-12">
          <FiShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No consumption records found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {getConsumptionSummary().map((item, index) => {
            const material = item.material
            return (
              <motion.div
                key={material._id || material.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-soft card-hover relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#6B4EFF]/10 flex items-center justify-center">
                    <FiShoppingCart className="w-6 h-6 text-[#6B4EFF]" />
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenMenuId(openMenuId === (material._id || material.id) ? null : (material._id || material.id))}
                      className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <FiMoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                    {openMenuId === (material._id || material.id) && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                      >
                        {consumptions
                          .filter(c => {
                            const mat = typeof c.material === 'object' ? c.material : null
                            return mat?._id === material._id || mat?.id === material.id
                          })
                          .slice(0, 1)
                          .map(cons => (
                            <div key={cons._id || cons.id}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleEdit(cons)
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
                                  setDeletingConsumption(cons)
                                  setOpenMenuId(null)
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <FiTrash2 className="w-4 h-4" />
                                <span>Delete</span>
                              </button>
                            </div>
                          ))}
                      </motion.div>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-dark mb-4">{material.name}</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Consumed</span>
                    <span className="text-2xl font-bold text-dark">
                      {item.totalQuantity} {getUnitName(material.unit)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Project</span>
                    <span className="text-sm font-medium text-dark">{item.project}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Consumption Modal */}
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
                      {editingConsumption ? 'Edit Consumption' : 'Record Consumption'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Track material usage across projects</p>
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
                    {/* Material Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Material <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FiPackage className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                          value={formData.material}
                          onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                          required
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                        >
                          <option value="">Select Material</option>
                          {materials.map(material => (
                            <option key={material._id || material.id} value={material._id || material.id}>
                              {material.name} ({getUnitName(material.unit)})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Project Selection */}
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

                    {/* Quantity and Date */}
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
                          min="0"
                          step="0.01"
                          placeholder="0"
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Consumption Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FiCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="date"
                            value={formData.consumptionDate}
                            onChange={(e) => setFormData({ ...formData, consumptionDate: e.target.value })}
                            required
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <div className="relative">
                        <FiMapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="e.g., Building A, Floor 2"
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Purpose/Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Purpose / Notes
                      </label>
                      <div className="relative">
                        <FiMessageSquare className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                        <textarea
                          value={formData.purpose}
                          onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                          placeholder="Enter purpose or additional notes..."
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
                      {submitting ? 'Saving...' : editingConsumption ? 'Update Consumption' : 'Record Consumption'}
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
        {deletingConsumption && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setDeletingConsumption(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              >
                <h3 className="text-xl font-bold text-dark mb-2">Delete Consumption</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this consumption record? This action cannot be undone.
                </p>
                <div className="flex items-center justify-end gap-4">
                  <button
                    onClick={() => setDeletingConsumption(null)}
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

export default Consumption
