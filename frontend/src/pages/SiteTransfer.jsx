import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { 
  FiPlus, FiSearch, FiTruck, FiArrowRight, FiCalendar, FiX, FiBox,
  FiEdit2, FiTrash2, FiMoreVertical, FiMapPin, FiAlertTriangle,
  FiFilter, FiCheckCircle, FiClock, FiPackage
} from 'react-icons/fi'
import Toast from '../components/Toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const SiteTransfer = () => {
  const [transfers, setTransfers] = useState([])
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTransfer, setEditingTransfer] = useState(null)
  const [deletingTransfer, setDeletingTransfer] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredTransfers, setFilteredTransfers] = useState([])
  const [toasts, setToasts] = useState([])
  const [openMenuId, setOpenMenuId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    location: ''
  })
  
  const menuRefs = useRef({})
  const filterMenuRef = useRef(null)
  
  const [formData, setFormData] = useState({
    material: '',
    quantity: '',
    unit: '',
    fromSite: '',
    toSite: '',
    vehicleNumber: '',
    transferDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    notes: ''
  })

  // Fetch data
  useEffect(() => {
    fetchTransfers()
    fetchMaterials()
  }, [])

  // Search and filter
  useEffect(() => {
    let filtered = [...transfers]
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(transfer => {
        const materialName = typeof transfer.material === 'object' 
          ? transfer.material?.name?.toLowerCase() 
          : ''
        const vehicle = transfer.vehicleNumber?.toLowerCase() || ''
        const from = transfer.fromSite?.toLowerCase() || ''
        const to = transfer.toSite?.toLowerCase() || ''
        return materialName.includes(query) || vehicle.includes(query) || 
               from.includes(query) || to.includes(query)
      })
    }
    
    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status)
    }
    
    if (filters.date) {
      const filterDate = new Date(filters.date).toISOString().split('T')[0]
      filtered = filtered.filter(t => {
        const transferDate = new Date(t.transferDate).toISOString().split('T')[0]
        return transferDate === filterDate
      })
    }
    
    if (filters.location) {
      filtered = filtered.filter(t => 
        t.fromSite?.toLowerCase().includes(filters.location.toLowerCase()) ||
        t.toSite?.toLowerCase().includes(filters.location.toLowerCase())
      )
    }
    
    setFilteredTransfers(filtered)
  }, [searchQuery, filters, transfers])

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
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowFilterMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchTransfers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/login'
        return
      }

      const response = await fetch(`${API_URL}/transfers`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTransfers(data.data || [])
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch transfers' }))
        showToast(errorData.message || 'Failed to fetch transfers', 'error')
      }
    } catch (error) {
      showToast('Error fetching transfers', 'error')
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
      quantity: '',
      unit: '',
      fromSite: '',
      toSite: '',
      vehicleNumber: '',
      transferDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      notes: ''
    })
    setEditingTransfer(null)
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

      const url = editingTransfer 
        ? `${API_URL}/transfers/${editingTransfer._id || editingTransfer.id}`
        : `${API_URL}/transfers`
      
      const method = editingTransfer ? 'PUT' : 'POST'

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
          editingTransfer ? 'Transfer updated successfully' : 'Transfer created successfully',
          'success'
        )
        setShowModal(false)
        resetForm()
        fetchTransfers()
      } else {
        showToast(data.message || 'Failed to save transfer', 'error')
      }
    } catch (error) {
      showToast('Error saving transfer', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (transfer) => {
    setOpenMenuId(null)
    setEditingTransfer(transfer)
    const material = typeof transfer.material === 'object' ? transfer.material : null
    setFormData({
      material: material?._id || transfer.material || '',
      quantity: transfer.quantity?.toString() || '',
      unit: material?.unit || '',
      fromSite: transfer.fromSite || '',
      toSite: transfer.toSite || '',
      vehicleNumber: transfer.vehicleNumber || '',
      transferDate: transfer.transferDate 
        ? new Date(transfer.transferDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      status: transfer.status || 'pending',
      notes: transfer.notes || ''
    })
    setShowModal(true)
  }

  const handleDelete = async () => {
    if (!deletingTransfer) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/transfers/${deletingTransfer._id || deletingTransfer.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        showToast('Transfer deleted successfully', 'success')
        setDeletingTransfer(null)
        fetchTransfers()
      } else {
        showToast(data.message || 'Failed to delete transfer', 'error')
      }
    } catch (error) {
      showToast('Error deleting transfer', 'error')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' }
      case 'in-transit':
        return { bg: 'bg-[#6B4EFF]/10', text: 'text-[#6B4EFF]', border: 'border-[#6B4EFF]/20' }
      case 'pending':
        return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' }
      case 'cancelled':
        return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' }
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' }
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pending',
      'in-transit': 'In Transit',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    }
    return labels[status] || status
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

  const isUrgentTransfer = (transfer) => {
    // Check if material has low stock or if transfer is overdue
    if (transfer.material && typeof transfer.material === 'object') {
      const currentStock = transfer.material.currentStock || 0
      const minThreshold = transfer.material.minThreshold || 0
      if (currentStock < minThreshold) return true
    }
    // Check if pending transfer is older than 3 days
    if (transfer.status === 'pending') {
      const transferDate = new Date(transfer.transferDate)
      const daysDiff = (new Date() - transferDate) / (1000 * 60 * 60 * 24)
      if (daysDiff > 3) return true
    }
    return false
  }

  // Get unique locations for filter
  const locations = [...new Set([
    ...transfers.map(t => t.fromSite).filter(Boolean),
    ...transfers.map(t => t.toSite).filter(Boolean)
  ])]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading transfers...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark mb-2">Site Transfer</h1>
          <p className="text-gray-500">Track material transfers between sites and warehouses</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-6 py-3 bg-[#6B4EFF] text-white rounded-[22px] hover:shadow-lg transition-all hover:scale-105"
        >
          <FiPlus className="w-5 h-5" />
          <span className="font-semibold">New Transfer</span>
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search materials, trucks, sites…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-[22px] border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent shadow-sm"
          />
        </div>
        <div className="relative" ref={filterMenuRef}>
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="flex items-center gap-2 px-6 py-3 rounded-[22px] border border-gray-200 bg-white hover:bg-gray-50 transition-all shadow-sm"
          >
            <FiFilter className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700">Filter</span>
          </button>
          {showFilterMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF]"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in-transit">In Transit</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF]"
                  >
                    <option value="">All Locations</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setFilters({ status: '', date: '', location: '' })}
                  className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear Filters
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Transfers List */}
      {filteredTransfers.length === 0 ? (
        <div className="text-center py-12">
          <FiTruck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No transfers found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransfers.map((transfer, index) => {
            const statusColors = getStatusColor(transfer.status)
            const material = typeof transfer.material === 'object' ? transfer.material : null
            const materialName = material?.name || 'Unknown Material'
            const materialUnit = material?.unit || 'units'
            const isUrgent = isUrgentTransfer(transfer)

            return (
              <motion.div
                key={transfer._id || transfer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-[22px] p-6 shadow-soft hover:shadow-medium transition-all border border-gray-100 relative cursor-pointer group"
              >
                {/* Urgent Warning Icon */}
                {isUrgent && (
                  <div className="absolute top-4 right-4 z-10" title="Low Stock / Urgent Transfer">
                    <FiAlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                )}

                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Left Section - Material Details */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-14 rounded-full bg-[#6B4EFF]/10 flex items-center justify-center flex-shrink-0">
                      <FiPackage className="w-7 h-7 text-[#6B4EFF]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-dark mb-2">{materialName}</h3>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Quantity:</span>
                          <span className="font-bold text-dark">
                            {transfer.quantity} {getUnitName(materialUnit)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle Section - Transfer Route */}
                  <div className="flex items-center gap-4 px-6 border-l border-r border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-dark">{transfer.fromSite}</p>
                        <p className="text-xs text-gray-500">From</p>
                      </div>
                      <FiArrowRight className="w-5 h-5 text-[#6B4EFF] flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-dark">{transfer.toSite}</p>
                        <p className="text-xs text-gray-500">To</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 ml-4">
                      <FiCalendar className="w-4 h-4" />
                      <span>{formatDate(transfer.transferDate)}</span>
                    </div>
                  </div>

                  {/* Right Section - Transporter & Status */}
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Transporter</p>
                      <p className="text-sm font-semibold text-dark flex items-center gap-2">
                        <FiTruck className="w-4 h-4 text-gray-400" />
                        {transfer.vehicleNumber || 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-2 rounded-full text-xs font-semibold border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                        {getStatusLabel(transfer.status)}
                      </span>
                      <div className="relative" ref={el => menuRefs.current[transfer._id || transfer.id] = el}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenMenuId(openMenuId === (transfer._id || transfer.id) ? null : (transfer._id || transfer.id))
                          }}
                          className="p-2 rounded-lg hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <FiMoreVertical className="w-5 h-5 text-gray-400" />
                        </button>
                        {openMenuId === (transfer._id || transfer.id) && (
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
                                handleEdit(transfer)
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
                                setDeletingTransfer(transfer)
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
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Transfer Modal */}
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
                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div>
                    <h2 className="text-2xl font-bold text-dark">
                      {editingTransfer ? 'Edit Transfer' : 'Add New Transfer'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Manage materials movement</p>
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
                    {/* Section 1: Material Details */}
                    <div>
                      <h3 className="text-lg font-semibold text-dark mb-4 flex items-center gap-2">
                        <FiPackage className="w-5 h-5 text-[#6B4EFF]" />
                        Material Details
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Material <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <FiBox className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                              value={formData.material}
                              onChange={(e) => {
                                const selectedMaterial = materials.find(m => (m._id || m.id) === e.target.value)
                                setFormData({ 
                                  ...formData, 
                                  material: e.target.value,
                                  unit: selectedMaterial?.unit || ''
                                })
                              }}
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
                              Unit Type
                            </label>
                            <input
                              type="text"
                              value={formData.unit ? getUnitName(formData.unit) : ''}
                              disabled
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-600"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Transfer Route */}
                    <div>
                      <h3 className="text-lg font-semibold text-dark mb-4 flex items-center gap-2">
                        <FiMapPin className="w-5 h-5 text-[#6B4EFF]" />
                        Transfer Route
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              From <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.fromSite}
                              onChange={(e) => setFormData({ ...formData, fromSite: e.target.value })}
                              required
                              placeholder="Warehouse A, Site A..."
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              To <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.toSite}
                              onChange={(e) => setFormData({ ...formData, toSite: e.target.value })}
                              required
                              placeholder="Warehouse B, Site B..."
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Transporter (Truck Number)
                            </label>
                            <div className="relative">
                              <FiTruck className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                              <input
                                type="text"
                                value={formData.vehicleNumber}
                                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                                placeholder="Truck #1234"
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Transfer Date <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <FiCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                              <input
                                type="date"
                                value={formData.transferDate}
                                onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                                required
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Status */}
                    <div>
                      <h3 className="text-lg font-semibold text-dark mb-4 flex items-center gap-2">
                        <FiCheckCircle className="w-5 h-5 text-[#6B4EFF]" />
                        Status
                      </h3>
                      <div>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-transit">In Transit</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    {/* Section 4: Notes */}
                    <div>
                      <h3 className="text-lg font-semibold text-dark mb-4 flex items-center gap-2">
                        <FiPackage className="w-5 h-5 text-[#6B4EFF]" />
                        Notes
                      </h3>
                      <div>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="Enter remarks…"
                          rows={4}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#6B4EFF] focus:border-transparent resize-none"
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
                      {submitting ? 'Saving...' : editingTransfer ? 'Update Transfer' : 'Save Transfer'}
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
        {deletingTransfer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setDeletingTransfer(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              >
                <h3 className="text-xl font-bold text-dark mb-2">Delete Transfer</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this transfer? This action cannot be undone.
                </p>
                <div className="flex items-center justify-end gap-4">
                  <button
                    onClick={() => setDeletingTransfer(null)}
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

export default SiteTransfer
