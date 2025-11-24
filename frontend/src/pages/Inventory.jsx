import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { 
  FiPlus, FiSearch, FiPackage, FiAlertTriangle, FiX, FiBox, FiMapPin,
  FiEdit2, FiTrash2, FiMoreVertical, FiCalendar, FiDollarSign, FiUpload,
  FiFile, FiDownload
} from 'react-icons/fi'
import Toast from '../components/Toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Inventory = () => {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState(null)
  const [deletingMaterial, setDeletingMaterial] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredMaterials, setFilteredMaterials] = useState([])
  const [toasts, setToasts] = useState([])
  const [openMenuId, setOpenMenuId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  
  const menuRefs = useRef({})
  const fileInputRef = useRef(null)
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'cement',
    currentStock: '',
    minThreshold: '',
    unit: 'bag',
    location: '',
    lastUpdated: new Date().toISOString().split('T')[0]
  })

  // Fetch materials
  useEffect(() => {
    fetchMaterials()
  }, [])

  // Search and filter
  useEffect(() => {
    let filtered = [...materials]
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(material => 
        material.name?.toLowerCase().includes(query) ||
        material.category?.toLowerCase().includes(query) ||
        material.location?.toLowerCase().includes(query)
      )
    }
    setFilteredMaterials(filtered)
  }, [searchQuery, materials])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      let clickedInsideMenu = false
      Object.keys(menuRefs.current).forEach(id => {
        const ref = menuRefs.current[id]
        if (ref && ref.contains(event.target)) {
          clickedInsideMenu = true
        }
      })
      if (!clickedInsideMenu) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchMaterials = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/login'
        return
      }

      const response = await fetch(`${API_URL}/materials`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMaterials(data.data || [])
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch materials' }))
        showToast(errorData.message || 'Failed to fetch materials', 'error')
      }
    } catch (error) {
      console.error('Error fetching materials:', error)
      showToast('Error fetching materials', 'error')
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
      category: 'cement',
      currentStock: '',
      minThreshold: '',
      unit: 'bag',
      location: '',
      lastUpdated: new Date().toISOString().split('T')[0]
    })
    setEditingMaterial(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const payload = {
        ...formData,
        currentStock: parseFloat(formData.currentStock) || 0,
        minThreshold: parseFloat(formData.minThreshold) || 0
      }

      const url = editingMaterial 
        ? `${API_URL}/materials/${editingMaterial._id || editingMaterial.id}`
        : `${API_URL}/materials`
      
      const method = editingMaterial ? 'PUT' : 'POST'

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
          editingMaterial ? 'Material updated successfully' : 'Material added successfully',
          'success'
        )
        setShowModal(false)
        resetForm()
        fetchMaterials()
      } else {
        showToast(data.message || 'Failed to save material', 'error')
      }
    } catch (error) {
      console.error('Error saving material:', error)
      showToast('Error saving material', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (material) => {
    setOpenMenuId(null)
    setEditingMaterial(material)
    setFormData({
      name: material.name || '',
      category: material.category || 'cement',
      currentStock: material.currentStock?.toString() || '',
      minThreshold: material.minThreshold?.toString() || '',
      unit: material.unit || 'bag',
      location: material.location || '',
      lastUpdated: material.updatedAt 
        ? new Date(material.updatedAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
    })
    setShowModal(true)
  }

  const handleDelete = async () => {
    if (!deletingMaterial) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/materials/${deletingMaterial._id || deletingMaterial.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        showToast('Material deleted successfully', 'success')
        setDeletingMaterial(null)
        fetchMaterials()
      } else {
        showToast(data.message || 'Failed to delete material', 'error')
      }
    } catch (error) {
      console.error('Error deleting material:', error)
      showToast('Error deleting material', 'error')
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv' // .csv
      ]
      
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
        showToast('Invalid file type. Please upload XLSX, XLS, or CSV file.', 'error')
        return
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        showToast('File size too large. Maximum size is 10MB.', 'error')
        return
      }

      setUploadedFile(file)
    }
  }

  const handleExcelUpload = async () => {
    if (!uploadedFile) return

    setUploadingFile(true)

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('file', uploadedFile)

      const response = await fetch(`${API_URL}/materials/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        showToast('Materials uploaded successfully!', 'success')
        setShowUploadModal(false)
        setUploadedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        fetchMaterials()
      } else {
        showToast(data.message || 'Failed to upload materials', 'error')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      showToast('Error uploading file', 'error')
    } finally {
      setUploadingFile(false)
    }
  }

  const getStockStatus = (current, min) => {
    if (current < min) return { status: 'low', color: '#FF4D4D', bgColor: 'bg-red-50', textColor: 'text-red-600' }
    return { status: 'good', color: '#00C896', bgColor: 'bg-green-50', textColor: 'text-green-600' }
  }

  const getCategoryName = (category) => {
    const categories = {
      cement: 'Cement',
      steel: 'Steel',
      bricks: 'Bricks',
      sand: 'Sand',
      gravel: 'Gravel',
      other: 'Other'
    }
    return categories[category] || category
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getStockPercentage = (current, min) => {
    if (min === 0) return 100
    const percentage = (current / (min * 2)) * 100
    return Math.min(percentage, 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading materials...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark mb-2">Materials Inventory</h1>
          <p className="text-gray-500">Manage construction materials and stock levels</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowUploadModal(true)
              setUploadedFile(null)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#6B4EFF] text-[#6B4EFF] rounded-2xl hover:bg-[#6B4EFF]/5 transition-all"
          >
            <FiUpload className="w-5 h-5" />
            <span>Upload Excel</span>
          </button>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[#6B4EFF] text-white rounded-2xl hover:shadow-lg transition-all hover:scale-105"
          >
            <FiPlus className="w-5 h-5" />
            <span>Add Material</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search materials..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
        />
      </div>

      {/* Materials Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="text-center py-12">
          <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No materials found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material, index) => {
            const stockStatus = getStockStatus(material.currentStock || 0, material.minThreshold || 0)
            const stockPercentage = getStockPercentage(material.currentStock || 0, material.minThreshold || 0)
            const isLowStock = (material.currentStock || 0) < (material.minThreshold || 0)

            return (
              <motion.div
                key={material._id || material.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-[24px] p-6 shadow-soft hover:shadow-medium transition-all border border-gray-100 relative"
              >
                {/* Header with icon and warning */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#6B4EFF]/10 flex items-center justify-center">
                    <FiBox className="w-6 h-6 text-[#6B4EFF]" />
                  </div>
                  <div className="flex items-center gap-2">
                    {isLowStock && (
                      <FiAlertTriangle className="w-6 h-6 text-[#FF4D4D]" />
                    )}
                    <div className="relative" ref={el => menuRefs.current[material._id || material.id] = el}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenMenuId(openMenuId === (material._id || material.id) ? null : (material._id || material.id))
                        }}
                        className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FiMoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                      {openMenuId === (material._id || material.id) && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleEdit(material)
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
                              e.stopPropagation()
                              setDeletingMaterial(material)
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
                </div>

                {/* Title and Category */}
                <h3 className="text-xl font-bold text-dark mb-1">{material.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{getCategoryName(material.category)}</p>

                {/* Details Section */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Current Stock</span>
                    <span className="text-lg font-bold text-dark">
                      {material.currentStock || 0} {getUnitName(material.unit)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Minimum Required</span>
                    <span className="text-sm text-gray-600">{material.minThreshold || 0} {getUnitName(material.unit)}</span>
                  </div>
                  {material.location && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Location</span>
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <FiMapPin className="w-3 h-3" />
                        {material.location}
                      </span>
                    </div>
                  )}
                </div>

                {/* Stock Indicator */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-dark">Stock Level</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stockPercentage}%` }}
                      transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
                      className="h-3 rounded-full"
                      style={{ backgroundColor: stockStatus.color }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    Last Updated: {formatDate(material.updatedAt || material.createdAt)}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Material Modal */}
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
                      {editingMaterial ? 'Edit Material' : 'Add Material'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Manage construction materials and stock levels
                    </p>
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
                    {/* Material Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Material Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FiBox className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          placeholder="e.g., Cement (50kg bags)"
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                      >
                        <option value="cement">Cement</option>
                        <option value="steel">Steel</option>
                        <option value="bricks">Bricks</option>
                        <option value="sand">Sand</option>
                        <option value="gravel">Gravel</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Current Stock and Minimum Required */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Stock <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.currentStock}
                          onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                          required
                          min="0"
                          step="0.01"
                          placeholder="0"
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Required <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.minThreshold}
                          onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
                          required
                          min="0"
                          step="0.01"
                          placeholder="0"
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Unit Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                      >
                        <option value="bag">Bags</option>
                        <option value="ton">Tons</option>
                        <option value="piece">Pieces</option>
                        <option value="cubic-meter">Cubic Meters</option>
                        <option value="kg">Kilograms</option>
                        <option value="other">Other</option>
                      </select>
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
                          placeholder="e.g., Warehouse A, Site Storage"
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Last Updated */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Updated
                      </label>
                      <div className="relative">
                        <FiCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="date"
                          value={formData.lastUpdated}
                          onChange={(e) => setFormData({ ...formData, lastUpdated: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
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
                      className="px-6 py-3 rounded-xl bg-[#6B4EFF] text-white hover:bg-[#5a3fe6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Saving...' : editingMaterial ? 'Update Material' : 'Save Material'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Excel Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => {
                setShowUploadModal(false)
                setUploadedFile(null)
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-dark">Upload Materials File</h2>
                  <button
                    onClick={() => {
                      setShowUploadModal(false)
                      setUploadedFile(null)
                    }}
                    className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FiX className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* File Upload Area */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Excel/CSV File
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                        uploadedFile
                          ? 'border-[#6B4EFF] bg-[#6B4EFF]/5'
                          : 'border-gray-300 hover:border-[#6B4EFF]/50'
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      {uploadedFile ? (
                        <div className="space-y-2">
                          <FiFile className="w-12 h-12 text-[#6B4EFF] mx-auto" />
                          <p className="text-sm font-medium text-dark">{uploadedFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setUploadedFile(null)
                              if (fileInputRef.current) {
                                fileInputRef.current.value = ''
                              }
                            }}
                            className="text-xs text-red-600 hover:text-red-700 mt-2"
                          >
                            Remove file
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <FiUpload className="w-12 h-12 text-gray-400 mx-auto" />
                          <p className="text-sm font-medium text-gray-700">
                            Drag and drop your file here
                          </p>
                          <p className="text-xs text-gray-500">or click to browse</p>
                          <p className="text-xs text-gray-400 mt-2">
                            Supports: XLSX, XLS, CSV (Max 10MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Format Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Expected Format:</h4>
                    <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                      <li>Columns: Material Name, Category, Current Stock, Minimum Required, Unit, Location</li>
                      <li>Category: cement, steel, bricks, sand, gravel, other</li>
                      <li>Unit: bag, ton, piece, cubic-meter, kg, other</li>
                      <li>Stock values should be numbers</li>
                    </ul>
                  </div>

                  {/* Download Template Button */}
                  <button
                    type="button"
                    onClick={() => {
                      // Create a simple CSV template
                      const template = 'Material Name,Category,Current Stock,Minimum Required,Unit,Location\nCement (50kg bags),cement,850,500,bag,Warehouse A\nSteel Bars (12mm),steel,120,200,ton,Warehouse B\nBricks,bricks,15000,10000,piece,Site Storage\nSand,sand,45,50,cubic-meter,Yard Area\n'
                      const blob = new Blob([template], { type: 'text/csv' })
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = 'materials_template.csv'
                      a.click()
                      window.URL.revokeObjectURL(url)
                      showToast('Template downloaded!', 'success')
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                  >
                    <FiDownload className="w-4 h-4" />
                    <span>Download Template</span>
                  </button>

                  {/* Modal Footer */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUploadModal(false)
                        setUploadedFile(null)
                      }}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleExcelUpload}
                      disabled={!uploadedFile || uploadingFile}
                      className="px-6 py-3 bg-[#6B4EFF] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingFile ? 'Uploading...' : 'Import File'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingMaterial && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setDeletingMaterial(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              >
                <h3 className="text-xl font-bold text-dark mb-2">Delete Material</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{deletingMaterial.name}"? This action cannot be undone.
                </p>
                <div className="flex items-center justify-end gap-4">
                  <button
                    onClick={() => setDeletingMaterial(null)}
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

export default Inventory

