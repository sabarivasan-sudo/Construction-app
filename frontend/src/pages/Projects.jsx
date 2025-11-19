import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiPlus, FiSearch, FiFilter, FiMoreVertical, FiX, FiBriefcase, FiCalendar, FiDollarSign, FiUsers, FiMapPin, FiEdit2, FiTrash2, FiInfo, FiUpload, FiFile, FiMail, FiPhone, FiHome, FiClock, FiImage, FiDownload } from 'react-icons/fi'
import Toast from '../components/Toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Projects = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [deletingProject, setDeletingProject] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [users, setUsers] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    locationCoordinates: { lat: null, lng: null },
    startDate: '',
    endDate: '',
    budget: '',
    amountSpent: '',
    projectType: 'residential',
    projectStage: 'planning',
    priority: 'medium',
    status: 'planning',
    client: {
      name: '',
      phone: '',
      email: '',
      address: ''
    },
    team: [],
    documents: []
  })
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredProjects, setFilteredProjects] = useState([])
  const [toasts, setToasts] = useState([])
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    projectType: '',
    priority: '',
    projectStage: ''
  })
  const menuRefs = useRef({})
  const filterMenuRef = useRef(null)

  // Fetch projects and users from API
  useEffect(() => {
    fetchProjects()
    fetchUsers()
  }, [])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showModal])

  // Smart search and filter functionality
  useEffect(() => {
    let filtered = [...projects]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(project => {
        // Search by project name
        if (project.name?.toLowerCase().includes(query)) return true
        
        // Search by location
        if (project.location?.toLowerCase().includes(query)) return true
        
        // Search by team member names
        if (project.team && Array.isArray(project.team)) {
          const teamMatch = project.team.some(member => {
            // Handle new structure: { user: ObjectId, role: string }
            if (typeof member === 'object' && member.user) {
              const user = typeof member.user === 'object' ? member.user : null
              return user?.name?.toLowerCase().includes(query) || 
                     user?.email?.toLowerCase().includes(query)
            }
            // Handle old structure: direct user object
            if (typeof member === 'object' && member.name) {
              return member.name?.toLowerCase().includes(query) || 
                     member.email?.toLowerCase().includes(query)
            }
            return false
          })
          if (teamMatch) return true
        }
        
        // Search by client name
        if (project.client?.name?.toLowerCase().includes(query)) return true
        
        return false
      })
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(project => project.status === filters.status)
    }

    // Apply project type filter
    if (filters.projectType) {
      filtered = filtered.filter(project => project.projectType === filters.projectType)
    }

    // Apply priority filter
    if (filters.priority) {
      filtered = filtered.filter(project => project.priority === filters.priority)
    }

    // Apply project stage filter
    if (filters.projectStage) {
      filtered = filtered.filter(project => project.projectStage === filters.projectStage)
    }

    setFilteredProjects(filtered)
  }, [searchQuery, projects, filters])

  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowFilterMenu(false)
      }
    }

    if (showFilterMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFilterMenu])

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      status: '',
      projectType: '',
      priority: '',
      projectStage: ''
    })
    setShowFilterMenu(false)
  }

  const hasActiveFilters = filters.status || filters.projectType || filters.priority || filters.projectStage

  // Toast management
  const showToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      removeToast(id)
    }, 4000)
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProjects(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const url = editingProject 
        ? `${API_URL}/projects/${editingProject._id || editingProject.id}`
        : `${API_URL}/projects`
      const method = editingProject ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          budget: parseFloat(formData.budget) || 0,
          amountSpent: parseFloat(formData.amountSpent) || 0,
          team: formData.team.map(userId => ({ user: userId, role: 'worker' })) || [],
          documents: uploadedFiles.map(file => ({
            name: file.name,
            type: file.type,
            url: file.url,
            uploadedAt: file.uploadedAt || new Date().toISOString()
          }))
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setShowModal(false)
        setEditingProject(null)
        setFormData({
          name: '',
          description: '',
          location: '',
          locationCoordinates: { lat: null, lng: null },
          startDate: '',
          endDate: '',
          budget: '',
          amountSpent: '',
          projectType: 'residential',
          projectStage: 'planning',
          priority: 'medium',
          status: 'planning',
          client: {
            name: '',
            phone: '',
            email: '',
            address: ''
          },
          team: [],
          documents: []
        })
        setUploadedFiles([])
        showToast(
          editingProject 
            ? 'Project updated successfully! 🎉' 
            : 'Project created successfully! 🎉',
          'success'
        )
        fetchProjects() // Refresh projects list
      } else {
        const errorMsg = data.message || `Failed to ${editingProject ? 'update' : 'create'} project`
        setError(errorMsg)
        showToast(errorMsg, 'error')
      }
    } catch (err) {
      const errorMsg = 'Network error. Please check if backend is running.'
      setError(errorMsg)
      showToast(errorMsg, 'error')
      console.error('Project error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (project) => {
    // Close dropdown immediately
    setOpenMenuId(null)
    
    // Extract team member IDs if team is populated
    const teamIds = project.team && Array.isArray(project.team) 
      ? project.team.map(member => {
          if (typeof member === 'object' && member.user) {
            return typeof member.user === 'object' ? member.user._id || member.user.id : member.user
          }
          return typeof member === 'object' ? member._id || member.id : member
        })
      : []
    
    const formDataToSet = {
      name: project.name || '',
      description: project.description || '',
      location: project.location || '',
      locationCoordinates: project.locationCoordinates || { lat: null, lng: null },
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      budget: project.budget?.toString() || '',
      amountSpent: project.amountSpent?.toString() || '',
      projectType: project.projectType || 'residential',
      projectStage: project.projectStage || 'planning',
      priority: project.priority || 'medium',
      status: project.status || 'planning',
      client: project.client || {
        name: '',
        phone: '',
        email: '',
        address: ''
      },
      team: teamIds,
      documents: project.documents || []
    }
    
    // Set all state at once
    setEditingProject(project)
    setFormData(formDataToSet)
    // Set uploaded files from project documents
    const existingFiles = (project.documents || []).map(doc => ({
      name: doc.name,
      type: doc.type,
      url: doc.url,
      uploadedAt: doc.uploadedAt,
      preview: doc.type === 'photo' ? doc.url : null
    }))
    setUploadedFiles(existingFiles)
    setShowModal(true)
  }

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploadingFiles(true)
    const maxSize = 10 * 1024 * 1024 // 10MB in bytes
    const validFiles = []
    const invalidFiles = []

    // Validate file sizes
    files.forEach(file => {
      if (file.size > maxSize) {
        invalidFiles.push(file.name)
      } else {
        validFiles.push(file)
      }
    })

    // Show error for files that are too large
    if (invalidFiles.length > 0) {
      showToast(
        `Files too large (max 10MB): ${invalidFiles.join(', ')}`,
        'error'
      )
    }

    if (validFiles.length === 0) {
      setUploadingFiles(false)
      return
    }

    try {
      // Process valid files
      const newFiles = await Promise.all(
        validFiles.map(async (file) => {
          try {
            // Compress images before converting to base64
            let processedFile = file
            if (file.type.includes('image')) {
              processedFile = await compressImage(file)
            }
            
            // Convert file to base64 for storage
            const base64 = await fileToBase64(processedFile)
            const fileType = file.type.includes('pdf') ? 'drawing' : 
                            file.type.includes('image') ? 'photo' : 
                            file.type.includes('word') || file.type.includes('document') ? 'contract' : 'other'
            
            return {
              name: file.name,
              type: fileType,
              url: base64, // Store as base64 data URL
              uploadedAt: new Date().toISOString(),
              preview: file.type.includes('image') ? base64 : null // Preview for images
            }
          } catch (error) {
            console.error('Error processing file:', error)
            showToast(`Error processing ${file.name}`, 'error')
            return null
          }
        })
      )
      
      // Filter out any null values from failed processing
      const successfulFiles = newFiles.filter(file => file !== null)
      if (successfulFiles.length > 0) {
        setUploadedFiles([...uploadedFiles, ...successfulFiles])
        showToast(`${successfulFiles.length} file(s) uploaded successfully`, 'success')
      }
    } catch (error) {
      console.error('Error uploading files:', error)
      showToast('Error uploading files', 'error')
    } finally {
      setUploadingFiles(false)
      // Reset file input
      e.target.value = ''
    }
  }

  // Compress image to reduce base64 size
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (e) => {
        const img = new Image()
        img.src = e.target.result
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 1920
          const MAX_HEIGHT = 1920
          let width = img.width
          let height = img.height

          // Calculate new dimensions
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height
              height = MAX_HEIGHT
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob((blob) => {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          }, file.type, 0.8) // 80% quality
        }
      }
    })
  }

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }

  const removeFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
  }

  const handleDelete = async () => {
    if (!deletingProject) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/projects/${deletingProject._id || deletingProject.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setDeletingProject(null)
        showToast('Project deleted successfully! 🗑️', 'success')
        fetchProjects() // Refresh projects list
      } else {
        const errorMsg = data.message || 'Failed to delete project'
        setError(errorMsg)
        showToast(errorMsg, 'error')
      }
    } catch (err) {
      const errorMsg = 'Network error. Please check if backend is running.'
      setError(errorMsg)
      showToast(errorMsg, 'error')
      console.error('Delete project error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on a button inside the dropdown menu
      const clickedButton = event.target.closest('button')
      if (clickedButton && clickedButton.closest('[class*="rounded-xl"]')) {
        const isDropdownButton = clickedButton.textContent === 'Edit' || clickedButton.textContent === 'Delete'
        if (isDropdownButton) {
          return // Don't close dropdown when clicking Edit/Delete
        }
      }
      
      Object.keys(menuRefs.current).forEach((id) => {
        if (menuRefs.current[id] && !menuRefs.current[id].contains(event.target)) {
          setOpenMenuId(null)
        }
      })
    }

    // Use a small delay to allow button clicks to process first
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return '₹0'
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (numAmount >= 10000000) {
      return `₹${(numAmount / 10000000).toFixed(1)} Cr`
    } else if (numAmount >= 100000) {
      return `₹${(numAmount / 100000).toFixed(1)} L`
    }
    return `₹${numAmount.toLocaleString()}`
  }

  const formatBudgetInput = (value) => {
    if (!value) return ''
    const num = parseFloat(value)
    if (isNaN(num)) return value
    if (num >= 10000000) {
      return `${(num / 10000000).toFixed(1)} Cr`
    } else if (num >= 100000) {
      return `${(num / 100000).toFixed(1)} L`
    }
    return num.toLocaleString()
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null
    const today = new Date()
    const end = new Date(endDate)
    const diffTime = end - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-20 md:pb-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark mb-2">Projects</h1>
          <p className="text-gray-500">Manage and track all your construction projects</p>
        </div>
        <motion.button 
          onClick={() => setShowModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <FiPlus className="w-5 h-5" />
          <span>New Project</span>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by project name, location, team member, or client..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-light bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
        <div className="relative" ref={filterMenuRef}>
          <button 
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className={`flex items-center gap-2 px-6 py-3 border rounded-xl transition-colors ${
              hasActiveFilters 
                ? 'border-primary bg-primary/10 text-primary' 
                : 'border-light hover:bg-light'
            }`}
          >
            <FiFilter className="w-5 h-5" />
            <span>Filter</span>
            {hasActiveFilters && (
              <span className="ml-1 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                {Object.values(filters).filter(f => f).length}
              </span>
            )}
          </button>

          {/* Filter Dropdown Menu */}
          {showFilterMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50 min-w-[280px]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-dark">Filter Projects</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Statuses</option>
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Project Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Type
                  </label>
                  <select
                    value={filters.projectType}
                    onChange={(e) => handleFilterChange('projectType', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Types</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="renovation">Renovation</option>
                    <option value="road-work">Road Work</option>
                    <option value="interior-work">Interior Work</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={filters.priority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {/* Project Stage Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Stage
                  </label>
                  <select
                    value={filters.projectStage}
                    onChange={(e) => handleFilterChange('projectStage', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Stages</option>
                    <option value="planning">Planning</option>
                    <option value="foundation">Foundation</option>
                    <option value="framing">Framing</option>
                    <option value="masonry">Masonry</option>
                    <option value="electrical">Electrical</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="finishing">Finishing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <FiBriefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No projects yet</p>
          <p className="text-gray-400 text-sm mb-4">Create your first project to get started</p>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:shadow-medium transition-all mx-auto"
          >
            <FiPlus className="w-5 h-5" />
            <span>Create Project</span>
          </button>
        </div>
      ) : (searchQuery.trim() || hasActiveFilters) && filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <FiSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No projects found</p>
          <p className="text-gray-400 text-sm">
            {searchQuery.trim() 
              ? 'Try searching with different keywords' 
              : 'Try adjusting your filters'}
          </p>
          {(searchQuery.trim() || hasActiveFilters) && (
            <button
              onClick={() => {
                setSearchQuery('')
                clearFilters()
              }}
              className="mt-4 px-4 py-2 text-primary hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(searchQuery.trim() || hasActiveFilters ? filteredProjects : projects).map((project, index) => (
            <motion.div
              key={project._id || project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <FiBriefcase className="w-6 h-6 text-white" />
                </div>
                <div className="relative" ref={el => menuRefs.current[project._id || project.id] = el}>
                  <button 
                    onClick={() => setOpenMenuId(openMenuId === (project._id || project.id) ? null : (project._id || project.id))}
                    className="p-2 hover:bg-light rounded-lg transition-colors"
                  >
                    <FiMoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {openMenuId === (project._id || project.id) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 min-w-[150px]"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleEdit(project)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                      >
                        <FiEdit2 className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setDeletingProject(project)
                          setOpenMenuId(null)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-bold text-dark mb-2">{project.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <FiMapPin className="w-4 h-4 text-primary" />
                <span>{project.location || 'No location'}</span>
              </div>
              {project.projectType && (
                <div className="mb-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">
                    <FiHome className="w-3 h-3" />
                    {project.projectType === 'residential' ? 'Residential' :
                     project.projectType === 'commercial' ? 'Commercial' :
                     project.projectType === 'renovation' ? 'Renovation' :
                     project.projectType === 'road-work' ? 'Road Work' :
                     project.projectType === 'interior-work' ? 'Interior Work' :
                     project.projectType === 'infrastructure' ? 'Infrastructure' :
                     project.projectType === 'other' ? 'Other' :
                     project.projectType.charAt(0).toUpperCase() + project.projectType.slice(1).replace(/-/g, ' ')}
                  </span>
                </div>
              )}
              {project.description && (
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{project.description}</p>
              )}

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-dark">Progress</span>
                  <span className="text-sm font-bold text-primary">{project.progress || 0}%</span>
                </div>
                <div className="w-full bg-light rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress || 0}%` }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
                    className="bg-primary h-2 rounded-full"
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <FiDollarSign className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-gray-500">Budget</p>
                    <p className="text-sm font-semibold text-gray-700">{formatCurrency(project.budget)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <FiUsers className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-gray-500">Team</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {project.team && Array.isArray(project.team) 
                        ? project.team.length 
                        : 0} members
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-2 mb-4">
                {project.amountSpent > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Budget Used:</span>
                    <span className="font-semibold text-gray-700">{formatCurrency(project.amountSpent)}</span>
                  </div>
                )}
                {project.endDate && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      Days Left:
                    </span>
                    <span className={`font-semibold ${
                      getDaysRemaining(project.endDate) < 0 ? 'text-red-600' :
                      getDaysRemaining(project.endDate) < 30 ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {getDaysRemaining(project.endDate) < 0 
                        ? `${Math.abs(getDaysRemaining(project.endDate))} days overdue`
                        : `${getDaysRemaining(project.endDate)} days`
                      }
                    </span>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 p-2 bg-gray-50 rounded-lg">
                <FiCalendar className="w-4 h-4 text-primary" />
                <span>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  project.status === 'active' ? 'bg-success/10 text-success' :
                  project.status === 'completed' ? 'bg-primary/10 text-primary' :
                  project.status === 'on-hold' ? 'bg-warning/10 text-warning' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {project.status || 'planning'}
                </span>
                <button 
                  onClick={() => navigate(`/projects/${project._id || project.id}`)}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/50 z-[9998]"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
              onClick={(e) => {
                // Close modal if clicking on backdrop
                if (e.target === e.currentTarget) {
                  setShowModal(false)
                  setEditingProject(null)
                }
              }}
            >
              <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header - Fixed */}
                <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
                  <h2 className="text-2xl font-bold text-dark">
                    {editingProject ? 'Edit Project' : 'Create New Project'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setEditingProject(null)
                      setFormData({
                        name: '',
                        description: '',
                        location: '',
                        locationCoordinates: { lat: null, lng: null },
                        startDate: '',
                        endDate: '',
                        budget: '',
                        amountSpent: '',
                        projectType: 'residential',
                        projectStage: 'planning',
                        priority: 'medium',
                        status: 'planning',
                        client: {
                          name: '',
                          phone: '',
                          email: '',
                          address: ''
                        },
                        team: [],
                        documents: []
                      })
                      setUploadedFiles([])
                    }}
                    className="p-2 hover:bg-light rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Modal Body - Scrollable */}
                <div className="overflow-y-auto flex-1 min-h-0">
                  <form id="project-form" onSubmit={handleSubmit} className="p-6 space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                      {error}
                    </div>
                  )}

                  {/* Section: Project Info */}
                  <div className="border-b border-gray-200 pb-6 mb-6 rounded-2xl p-4 bg-gray-50/50 shadow-sm">
                    <h3 className="text-lg font-semibold text-dark mb-6">Project Information</h3>
                    
                    {/* Project Name */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter project name"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter project description"
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Project Type & Stage */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          Project Type
                          <span className="group relative">
                            <FiInfo className="w-4 h-4 text-gray-400 cursor-help" />
                            <span className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded-lg z-10">
                              Select the type of construction project
                            </span>
                          </span>
                        </label>
                        <select
                          value={formData.projectType}
                          onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="residential">Residential</option>
                          <option value="commercial">Commercial</option>
                          <option value="renovation">Renovation</option>
                          <option value="road-work">Road Work</option>
                          <option value="interior-work">Interior Work</option>
                          <option value="infrastructure">Infrastructure</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          Project Stage
                          <span className="group relative">
                            <FiInfo className="w-4 h-4 text-gray-400 cursor-help" />
                            <span className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded-lg z-10">
                              Current stage of construction
                            </span>
                          </span>
                        </label>
                        <select
                          value={formData.projectStage}
                          onChange={(e) => setFormData({ ...formData, projectStage: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="planning">Planning</option>
                          <option value="foundation">Foundation</option>
                          <option value="framing">Framing</option>
                          <option value="masonry">Masonry</option>
                          <option value="electrical">Electrical</option>
                          <option value="plumbing">Plumbing</option>
                          <option value="finishing">Finishing</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>

                    {/* Priority & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Priority
                        </label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="planning">Planning</option>
                          <option value="active">Active</option>
                          <option value="on-hold">On Hold</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section: Timeline */}
                  <div className="border-b border-gray-200 pb-6 mb-6 rounded-2xl p-4 bg-gray-50/50 shadow-sm">
                    <h3 className="text-lg font-semibold text-dark mb-6">Timeline</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          Start Date <span className="text-red-500">*</span>
                          <span className="group relative">
                            <FiInfo className="w-4 h-4 text-gray-400 cursor-help" />
                            <span className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded-lg z-10">
                              Project start date
                            </span>
                          </span>
                        </label>
                        <div className="relative">
                          <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          End Date <span className="text-red-500">*</span>
                          <span className="group relative">
                            <FiInfo className="w-4 h-4 text-gray-400 cursor-help" />
                            <span className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded-lg z-10">
                              Expected completion date
                            </span>
                          </span>
                        </label>
                        <div className="relative">
                          <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section: Location */}
                  <div className="border-b border-gray-200 pb-6 mb-6 rounded-2xl p-4 bg-gray-50/50 shadow-sm">
                    <h3 className="text-lg font-semibold text-dark mb-6">Location</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site Location <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="Enter project location or Google Maps link"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        You can paste a Google Maps link or enter address manually
                      </p>
                    </div>
                  </div>

                  {/* Section: Budget */}
                  <div className="border-b border-gray-200 pb-6 mb-6 rounded-2xl p-4 bg-gray-50/50 shadow-sm">
                    <h3 className="text-lg font-semibold text-dark mb-6">Budget Tracking</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          Total Budget (₹)
                          <span className="group relative">
                            <FiInfo className="w-4 h-4 text-gray-400 cursor-help" />
                            <span className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded-lg z-10">
                              Initial project budget
                            </span>
                          </span>
                        </label>
                        <div className="relative">
                          <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="number"
                            value={formData.budget}
                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                            placeholder="Enter budget"
                            min="0"
                            step="0.01"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                        {formData.budget && parseFloat(formData.budget) > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {formatCurrency(formData.budget)}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount Spent (₹)
                        </label>
                        <div className="relative">
                          <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="number"
                            value={formData.amountSpent}
                            onChange={(e) => setFormData({ ...formData, amountSpent: e.target.value })}
                            placeholder="Enter spent amount"
                            min="0"
                            step="0.01"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Remaining Budget (₹)
                        </label>
                        <div className="relative">
                          <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            value={formatCurrency((parseFloat(formData.budget) || 0) - (parseFloat(formData.amountSpent) || 0))}
                            disabled
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section: Client Information */}
                  <div className="border-b border-gray-200 pb-6 mb-6 rounded-2xl p-4 bg-gray-50/50 shadow-sm">
                    <h3 className="text-lg font-semibold text-dark mb-6">Client Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Client Name
                        </label>
                        <div className="relative">
                          <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            value={formData.client.name}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              client: { ...formData.client, name: e.target.value }
                            })}
                            placeholder="Enter client name"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Client Phone
                        </label>
                        <div className="relative">
                          <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="tel"
                            value={formData.client.phone}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              client: { ...formData.client, phone: e.target.value }
                            })}
                            placeholder="Enter phone number"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Client Email
                        </label>
                        <div className="relative">
                          <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="email"
                            value={formData.client.email}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              client: { ...formData.client, email: e.target.value }
                            })}
                            placeholder="Enter email address"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Client Address
                        </label>
                        <div className="relative">
                          <FiHome className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            value={formData.client.address}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              client: { ...formData.client, address: e.target.value }
                            })}
                            placeholder="Enter client address"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section: Team */}
                  <div className="border-b border-gray-200 pb-6 mb-6 rounded-2xl p-4 bg-gray-50/50 shadow-sm">
                    <h3 className="text-lg font-semibold text-dark mb-6">Team Members</h3>
                    <div className="relative">
                      <FiUsers className="absolute left-3 top-3 text-gray-400 w-5 h-5 z-10" />
                      <select
                        multiple
                        value={formData.team || []}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value)
                          setFormData({ ...formData, team: selected })
                        }}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[120px]"
                        size={5}
                      >
                        {users.length > 0 ? (
                          users.map((user) => (
                            <option key={user._id || user.id} value={user._id || user.id}>
                              {user.name} ({user.email}) - {user.role}
                            </option>
                          ))
                        ) : (
                          <option disabled>No users available</option>
                        )}
                      </select>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Hold Ctrl/Cmd to select multiple members. {formData.team?.length || 0} selected
                    </p>
                  </div>

                  {/* Section: Documents */}
                  <div className="border-b border-gray-200 pb-6 mb-6 rounded-2xl p-4 bg-gray-50/50 shadow-sm">
                    <h3 className="text-lg font-semibold text-dark mb-6">Project Documents</h3>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Documents
                      </label>
                      <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                        uploadingFiles 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-300 hover:border-primary'
                      }`}>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={handleFileUpload}
                          disabled={uploadingFiles}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className={`flex flex-col items-center gap-2 ${
                            uploadingFiles ? 'cursor-wait opacity-75' : 'cursor-pointer'
                          }`}
                        >
                          {uploadingFiles ? (
                            <>
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                              <span className="text-sm text-gray-600">
                                Processing files...
                              </span>
                            </>
                          ) : (
                            <>
                              <FiUpload className="w-8 h-8 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                Click to upload or drag and drop
                              </span>
                              <span className="text-xs text-gray-500">
                                PDF, Images, DOC (Max 10MB per file)
                              </span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {uploadedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="relative p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary transition-colors"
                            >
                              {/* Image Preview */}
                              {file.preview || (file.type === 'photo' && file.url) ? (
                                <div className="mb-2">
                                  <img
                                    src={file.preview || file.url}
                                    alt={file.name}
                                    className="w-full h-32 object-cover rounded-lg"
                                    onError={(e) => {
                                      e.target.style.display = 'none'
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="mb-2 flex items-center justify-center h-32 bg-gray-100 rounded-lg">
                                  <FiFile className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    {file.type === 'photo' ? (
                                      <FiImage className="w-4 h-4 text-primary flex-shrink-0" />
                                    ) : (
                                      <FiFile className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    )}
                                    <span className="text-sm font-medium text-gray-700 truncate">{file.name}</span>
                                  </div>
                                  <span className="text-xs text-gray-500 capitalize">{file.type}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFile(index)}
                                  className="ml-2 text-red-500 hover:text-red-700 flex-shrink-0"
                                  title="Remove file"
                                >
                                  <FiX className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  </form>
                </div>

                {/* Modal Footer - Fixed */}
                <div className="flex items-center justify-end gap-4 p-6 border-t bg-white flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingProject(null)
                      setFormData({
                        name: '',
                        description: '',
                        location: '',
                        locationCoordinates: { lat: null, lng: null },
                        startDate: '',
                        endDate: '',
                        budget: '',
                        amountSpent: '',
                        projectType: 'residential',
                        projectStage: 'planning',
                        priority: 'medium',
                        status: 'planning',
                        client: {
                          name: '',
                          phone: '',
                          email: '',
                          address: ''
                        },
                        team: [],
                        documents: []
                      })
                      setUploadedFiles([])
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    form="project-form"
                    disabled={submitting}
                    whileHover={!submitting ? { scale: 1.02 } : {}}
                    whileTap={!submitting ? { scale: 0.98 } : {}}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{editingProject ? 'Updating...' : 'Creating project... please wait'}</span>
                      </>
                    ) : (
                      <span>{editingProject ? 'Update Project' : 'Create Project'}</span>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingProject && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingProject(null)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-dark mb-4">Delete Project</h2>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete <strong>"{deletingProject.name}"</strong>? This action cannot be undone.
                  </p>
                  
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
                      {error}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-4">
                    <button
                      onClick={() => {
                        setDeletingProject(null)
                        setError('')
                      }}
                      disabled={submitting}
                      className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={submitting}
                      className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </motion.div>
  )
}

export default Projects

