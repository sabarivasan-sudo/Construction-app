import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FiPlus, FiSearch, FiFilter, FiCheckCircle, FiClock, FiAlertCircle, FiX,
  FiEdit2, FiTrash2, FiMoreVertical, FiCalendar, FiUser, FiUsers, FiTag,
  FiUpload, FiFile, FiImage, FiDownload, FiEye, FiInfo, FiMessageSquare,
  FiCheck, FiXCircle, FiAlertTriangle, FiBriefcase, FiMapPin
} from 'react-icons/fi'
import Toast from '../components/Toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Issues = () => {
  const navigate = useNavigate()
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingIssue, setEditingIssue] = useState(null)
  const [deletingIssue, setDeletingIssue] = useState(null)
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredIssues, setFilteredIssues] = useState([])
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [filters, setFilters] = useState({
    project: '',
    assignedTo: '',
    severity: '',
    status: '',
    category: ''
  })
  const [toasts, setToasts] = useState([])
  const [openMenuId, setOpenMenuId] = useState(null)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [customTag, setCustomTag] = useState('')
  
  const menuRefs = useRef({})
  const filterMenuRef = useRef(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'defect',
    location: '',
    project: '',
    assignedTo: '',
    watchers: [],
    severity: 'moderate',
    status: 'open',
    tags: [],
    subIssues: [],
    attachments: []
  })

  // Fetch data
  useEffect(() => {
    fetchIssues()
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

  // Search and filter functionality
  useEffect(() => {
    let filtered = [...issues]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(issue => {
        if (issue.title?.toLowerCase().includes(query)) return true
        if (issue.description?.toLowerCase().includes(query)) return true
        if (typeof issue.project === 'object' && issue.project?.name?.toLowerCase().includes(query)) return true
        if (typeof issue.assignedTo === 'object' && issue.assignedTo?.name?.toLowerCase().includes(query)) return true
        return false
      })
    }

    // Apply filters
    if (filters.project) {
      filtered = filtered.filter(issue => {
        const projectId = typeof issue.project === 'object' ? issue.project._id : issue.project
        return projectId === filters.project
      })
    }
    if (filters.assignedTo) {
      filtered = filtered.filter(issue => {
        const assigneeId = typeof issue.assignedTo === 'object' ? issue.assignedTo._id : issue.assignedTo
        return assigneeId === filters.assignedTo
      })
    }
    if (filters.severity) {
      filtered = filtered.filter(issue => issue.severity === filters.severity)
    }
    if (filters.status) {
      filtered = filtered.filter(issue => issue.status === filters.status)
    }
    if (filters.category) {
      filtered = filtered.filter(issue => issue.category === filters.category)
    }

    setFilteredIssues(filtered)
  }, [issues, searchQuery, filters])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.values(menuRefs.current).forEach(ref => {
        if (ref && !ref.contains(event.target)) {
          setOpenMenuId(null)
        }
      })
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowFilterMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchIssues = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/issues`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setIssues(data.data || [])
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setProjects(data.data || [])
      }
    } catch (error) {
    }
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
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
        // Token expired or invalid - clear storage and redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch users' }))
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      const url = editingIssue 
        ? `${API_URL}/issues/${editingIssue._id || editingIssue.id}`
        : `${API_URL}/issues`
      const method = editingIssue ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        attachments: uploadedFiles.map(file => ({
          name: file.name,
          type: file.type,
          url: file.url,
          uploadedAt: file.uploadedAt || new Date().toISOString()
        }))
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setShowModal(false)
        setEditingIssue(null)
        resetForm()
        showToast(editingIssue ? 'Issue updated successfully! 🎉' : 'Issue reported successfully! 🎉', 'success')
        fetchIssues()
      } else {
        showToast(data.message || `Failed to ${editingIssue ? 'update' : 'create'} issue`, 'error')
      }
    } catch (err) {
      showToast('Network error. Please check if backend is running.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'defect',
      location: '',
      project: '',
      assignedTo: '',
      watchers: [],
      severity: 'moderate',
      status: 'open',
      tags: [],
      subIssues: [],
      attachments: []
    })
    setUploadedFiles([])
    setCustomTag('')
  }

  const handleEdit = (issue) => {
    setOpenMenuId(null)
    setEditingIssue(issue)
    
    // Extract custom tags (tags starting with "other:")
    const customTags = (issue.tags || []).filter(t => typeof t === 'string' && t.startsWith('other:'))
    const standardTags = (issue.tags || []).filter(t => !(typeof t === 'string' && t.startsWith('other:')))
    
    // If there are custom tags, check "other" and set the custom tag value
    const hasCustomTag = customTags.length > 0
    const customTagValue = hasCustomTag ? customTags[0].replace('other:', '') : ''
    
    // Add "other" to tags if there's a custom tag
    const tagsWithOther = hasCustomTag ? [...standardTags, 'other'] : standardTags
    
    setFormData({
      title: issue.title || '',
      description: issue.description || '',
      category: issue.category || 'defect',
      location: issue.location || '',
      project: typeof issue.project === 'object' ? issue.project._id : issue.project || '',
      assignedTo: typeof issue.assignedTo === 'object' ? issue.assignedTo._id : issue.assignedTo || '',
      watchers: issue.watchers?.map(w => typeof w === 'object' ? w._id : w) || [],
      severity: issue.severity || 'moderate',
      status: issue.status || 'open',
      tags: hasCustomTag ? [...tagsWithOther, ...customTags] : tagsWithOther,
      subIssues: issue.subIssues || [],
      attachments: issue.attachments || []
    })
    setCustomTag(customTagValue)
    setUploadedFiles(issue.attachments || [])
    setShowModal(true)
  }

  const handleDelete = async () => {
    if (!deletingIssue) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/issues/${deletingIssue._id || deletingIssue.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        showToast('Issue deleted successfully!', 'success')
        fetchIssues()
      } else {
        showToast('Failed to delete issue', 'error')
      }
    } catch (err) {
      showToast('Error deleting issue', 'error')
    } finally {
      setDeletingIssue(null)
    }
  }

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploadingFiles(true)
    const newFiles = []

    for (const file of files) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showToast(`File "${file.name}" is too large. Maximum size is 10MB.`, 'error')
        continue
      }

      try {
        const base64 = await fileToBase64(file)
        newFiles.push({
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : file.type === 'application/pdf' ? 'pdf' : 'document',
          url: base64,
          uploadedAt: new Date().toISOString()
        })
      } catch (err) {
        showToast(`Error processing file "${file.name}"`, 'error')
      }
    }

    setUploadedFiles(prev => [...prev, ...newFiles])
    setUploadingFiles(false)
    if (newFiles.length > 0) {
      showToast(`${newFiles.length} file(s) uploaded successfully`, 'success')
    }
  }

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (file.type.startsWith('image/')) {
          // Compress image
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            const MAX_WIDTH = 1920
            const MAX_HEIGHT = 1080
            let width = img.width
            let height = img.height

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
            resolve(canvas.toDataURL('image/jpeg', 0.8))
          }
          img.onerror = reject
          img.src = reader.result
        } else {
          resolve(reader.result)
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const addSubIssue = () => {
    setFormData({
      ...formData,
      subIssues: [...formData.subIssues, { title: '', completed: false }]
    })
  }

  const updateSubIssue = (index, field, value) => {
    const updated = [...formData.subIssues]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, subIssues: updated })
  }

  const removeSubIssue = (index) => {
    setFormData({
      ...formData,
      subIssues: formData.subIssues.filter((_, i) => i !== index)
    })
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      project: '',
      assignedTo: '',
      severity: '',
      status: '',
      category: ''
    })
  }

  const hasActiveFilters = filters.project || filters.assignedTo || filters.severity || filters.status || filters.category

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white'
      case 'major':
        return 'bg-orange-500 text-white'
      case 'moderate':
        return 'bg-yellow-500 text-white'
      case 'minor':
        return 'bg-green-500 text-white'
      default:
        return 'bg-gray-200 text-gray-700'
    }
  }

  const getSeverityEmoji = (severity) => {
    switch (severity) {
      case 'critical': return '🔴'
      case 'major': return '🟠'
      case 'moderate': return '🟡'
      case 'minor': return '🟢'
      default: return ''
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'in-review':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'in-progress':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'resolved':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'closed':
        return 'bg-gray-200 text-gray-800 border-gray-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const getDaysAgo = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = today - date
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
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
          <h1 className="text-3xl font-bold text-dark mb-2">Issues & Defects</h1>
          <p className="text-gray-500">Track and resolve construction issues</p>
        </div>
        <button
          onClick={() => {
            setEditingIssue(null)
            resetForm()
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:shadow-medium transition-all hover:scale-105"
        >
          <FiPlus className="w-5 h-5" />
          <span>Report Issue</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search issues by title, description, project, or assignee..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="relative" ref={filterMenuRef}>
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <FiFilter className="w-5 h-5" />
            <span>Filter</span>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                {Object.values(filters).filter(v => v).length}
              </span>
            )}
          </button>
          {showFilterMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50 min-w-[250px]"
            >
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Project</label>
                  <select
                    value={filters.project}
                    onChange={(e) => handleFilterChange('project', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Projects</option>
                    {projects.map(project => (
                      <option key={project._id || project.id} value={project._id || project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Assigned To</label>
                  <select
                    value={filters.assignedTo}
                    onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Users</option>
                    {users.map(user => (
                      <option key={user._id || user.id} value={user._id || user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Severity</label>
                  <select
                    value={filters.severity}
                    onChange={(e) => handleFilterChange('severity', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="major">Major</option>
                    <option value="moderate">Moderate</option>
                    <option value="minor">Minor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="in-review">In Review</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Categories</option>
                    <option value="safety-issue">Safety Issue</option>
                    <option value="defect">Defect</option>
                    <option value="workmanship-issue">Workmanship Issue</option>
                    <option value="material-quality">Material Quality</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="structural">Structural</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Issues Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Loading issues...</p>
          </div>
        </div>
      ) : (searchQuery.trim() || hasActiveFilters ? filteredIssues : issues).length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-soft">
          <FiAlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchQuery.trim() || hasActiveFilters 
              ? 'No issues found matching your search/filters'
              : 'No issues reported yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(searchQuery.trim() || hasActiveFilters ? filteredIssues : issues).map((issue, index) => {
            const projectName = typeof issue.project === 'object' ? issue.project?.name : 'No Project'
            const assigneeName = typeof issue.assignedTo === 'object' ? issue.assignedTo?.name : 'Unassigned'
            const daysAgo = getDaysAgo(issue.createdAt)
            
            return (
              <motion.div
                key={issue._id || issue.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1"
              >
                {/* Header with Menu */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-dark mb-2">{issue.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <FiBriefcase className="w-4 h-4" />
                        {projectName}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiUser className="w-4 h-4" />
                        {assigneeName}
                      </span>
                      {issue.location && (
                        <span className="flex items-center gap-1">
                          <FiMapPin className="w-4 h-4" />
                          {issue.location}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                        {getSeverityEmoji(issue.severity)} {issue.severity}
                      </span>
                    </div>
                  </div>
                  <div className="relative" ref={el => menuRefs.current[issue._id || issue.id] = el}>
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === (issue._id || issue.id) ? null : (issue._id || issue.id))}
                      className="p-2 hover:bg-light rounded-lg transition-colors"
                    >
                      <FiMoreVertical className="w-5 h-5 text-gray-500" />
                    </button>
                    {openMenuId === (issue._id || issue.id) && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 min-w-[150px]"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleEdit(issue)
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                        >
                          <FiEdit2 className="w-4 h-4" />
                          <span>Edit Issue</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setDeletingIssue(issue)
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

                {/* Description Preview */}
                {issue.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{issue.description}</p>
                )}

                {/* Tags */}
                {issue.tags && issue.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {issue.tags.map((tag, tagIndex) => {
                      // Handle custom tags (format: "other:CustomName")
                      const displayTag = typeof tag === 'string' && tag.startsWith('other:') 
                        ? tag.replace('other:', '') 
                        : tag
                      // Skip displaying "other" as a tag, only show the custom value
                      if (tag === 'other') return null
                      return (
                        <span key={tagIndex} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-lg">
                          <FiTag className="w-3 h-3 inline mr-1" />
                          {displayTag}
                        </span>
                      )
                    })}
                  </div>
                )}

                {/* Attachments */}
                {issue.attachments && issue.attachments.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                    <FiFile className="w-3 h-3" />
                    <span>{issue.attachments.length} file(s)</span>
                  </div>
                )}

                {/* Reported Date */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <FiCalendar className="w-3 h-3" />
                  <span>Reported: {formatDate(issue.createdAt)}</span>
                  {daysAgo !== null && daysAgo > 7 && (
                    <span className="text-red-600 font-medium">({daysAgo} days ago)</span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(issue.status)}`}>
                    {issue.status === 'open' ? 'Open' :
                     issue.status === 'in-review' ? 'In Review' :
                     issue.status === 'in-progress' ? 'In Progress' :
                     issue.status === 'resolved' ? 'Resolved' :
                     'Closed'}
                  </span>
                  <button 
                    onClick={() => navigate(`/issues/${issue._id || issue.id}`)}
                    className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
                  >
                    <FiEye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Issue Form Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowModal(false)
              setEditingIssue(null)
              resetForm()
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
                <h2 className="text-2xl font-bold text-dark">
                  {editingIssue ? 'Edit Issue' : 'Report New Issue'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setEditingIssue(null)
                    resetForm()
                  }}
                  className="p-2 hover:bg-light rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="overflow-y-auto flex-1 min-h-0">
                <form id="issue-form" onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Section 1: Issue Information */}
                  <div className="border-b border-gray-200 pb-6 mb-6 rounded-2xl p-4 bg-gray-50/50 shadow-sm">
                    <h3 className="text-lg font-semibold text-dark mb-6">Issue Information</h3>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Issue Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter issue title"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the issue in detail..."
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      />
                    </div>
                  </div>

                  {/* Section 2: Issue Category */}
                  <div className="border-b border-gray-200 pb-6 mb-6 rounded-2xl p-4 bg-gray-50/50 shadow-sm">
                    <h3 className="text-lg font-semibold text-dark mb-6">Issue Category</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="safety-issue">Safety Issue</option>
                        <option value="defect">Defect</option>
                        <option value="workmanship-issue">Workmanship Issue</option>
                        <option value="material-quality">Material Quality Issue</option>
                        <option value="plumbing">Plumbing Issue</option>
                        <option value="electrical">Electrical Issue</option>
                        <option value="structural">Structural</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Section 3: Location */}
                  <div className="border-b border-gray-200 pb-6 mb-6 rounded-2xl p-4 bg-gray-50/50 shadow-sm">
                    <h3 className="text-lg font-semibold text-dark mb-6">Location Inside Project</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <div className="relative">
                        <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="e.g., Ground Floor, Toilet 2, Block A, Room No. 104"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Assignment */}
                  <div className="border-b border-gray-200 pb-6 mb-6 rounded-2xl p-4 bg-gray-50/50 shadow-sm">
                    <h3 className="text-lg font-semibold text-dark mb-6">Assignment</h3>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.project}
                        onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      >
                        <option value="">Select Project</option>
                        {projects.map(project => (
                          <option key={project._id || project.id} value={project._id || project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assign To
                      </label>
                      <select
                        value={formData.assignedTo}
                        onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Unassigned</option>
                        {users.map(user => (
                          <option key={user._id || user.id} value={user._id || user.id}>
                            {user.name} ({user.role || 'User'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Followers / Watchers
                      </label>
                      <select
                        multiple
                        value={formData.watchers}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value)
                          setFormData({ ...formData, watchers: selected })
                        }}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[100px]"
                      >
                        {users.map(user => (
                          <option key={user._id || user.id} value={user._id || user.id}>
                            {user.name} ({user.role || 'User'})
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                    </div>
                  </div>

                  {/* Section 5: Severity */}
                  <div className="border-b border-gray-200 pb-6 mb-6 rounded-2xl p-4 bg-gray-50/50 shadow-sm">
                    <h3 className="text-lg font-semibold text-dark mb-6">Severity</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Severity Level
                      </label>
                      <select
                        value={formData.severity}
                        onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="minor">🟢 Minor</option>
                        <option value="moderate">🟡 Moderate</option>
                        <option value="major">🟠 Major</option>
                        <option value="critical">🔴 Critical (Safety, Urgent)</option>
                      </select>
                    </div>
                  </div>

                  {/* Section 6: Status */}
                  <div className="border-b border-gray-200 pb-6 mb-6 rounded-2xl p-4 bg-gray-50/50 shadow-sm">
                    <h3 className="text-lg font-semibold text-dark mb-6">Status</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="open">Open</option>
                        <option value="in-review">In Review</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  {/* Section 7: Attachments */}
                  <div className="border-b border-gray-200 pb-6 mb-6 rounded-2xl p-4 bg-gray-50/50 shadow-sm">
                    <h3 className="text-lg font-semibold text-dark mb-6">Attachments</h3>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Files
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary transition-colors">
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          accept="image/*,.pdf"
                          className="hidden"
                          id="file-upload"
                          disabled={uploadingFiles}
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            {uploadingFiles ? 'Uploading...' : 'Click to upload or drag and drop'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Images, PDFs (Max 10MB each)</p>
                        </label>
                      </div>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                              {file.type === 'image' ? (
                                <FiImage className="w-5 h-5 text-primary" />
                              ) : (
                                <FiFile className="w-5 h-5 text-gray-400" />
                              )}
                              <span className="text-sm text-gray-700">{file.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="p-1 hover:bg-red-50 rounded transition-colors"
                            >
                              <FiX className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section 8: Sub-Issues / Steps to Fix */}
                  <div className="border-b border-gray-200 pb-6 mb-6 rounded-2xl p-4 bg-gray-50/50 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-dark">Sub-Issues / Steps to Fix</h3>
                      <button
                        type="button"
                        onClick={addSubIssue}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:shadow-medium transition-all"
                      >
                        <FiPlus className="w-4 h-4" />
                        <span>Add Step</span>
                      </button>
                    </div>
                    
                    {formData.subIssues.length > 0 ? (
                      <div className="space-y-3">
                        {formData.subIssues.map((subIssue, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                            <input
                              type="checkbox"
                              checked={subIssue.completed || false}
                              onChange={(e) => updateSubIssue(index, 'completed', e.target.checked)}
                              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <input
                              type="text"
                              value={subIssue.title}
                              onChange={(e) => updateSubIssue(index, 'title', e.target.value)}
                              placeholder="Enter step description..."
                              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={() => removeSubIssue(index)}
                              className="p-2 hover:bg-red-50 rounded transition-colors"
                            >
                              <FiX className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No steps added yet. Click "Add Step" to create repair steps.</p>
                    )}
                  </div>

                  {/* Tags Section */}
                  <div className="border-b border-gray-200 pb-6 mb-6 rounded-2xl p-4 bg-gray-50/50 shadow-sm">
                    <h3 className="text-lg font-semibold text-dark mb-6">Tags</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {['plumbing', 'electrical', 'structural', 'material-quality', 'other'].map(tag => (
                        <label key={tag} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={tag === 'other' 
                              ? formData.tags.includes('other') || formData.tags.some(t => typeof t === 'string' && t.startsWith('other:'))
                              : formData.tags.includes(tag)
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                if (tag === 'other') {
                                  // When "other" is checked, add "other" to tags (custom tag will replace it when entered)
                                  const tagsWithoutCustom = formData.tags.filter(t => !(typeof t === 'string' && t.startsWith('other:')))
                                  setFormData({ ...formData, tags: [...tagsWithoutCustom, 'other'] })
                                } else {
                                  // Remove any existing "other" or custom tags when selecting a standard tag
                                  const tagsWithoutOther = formData.tags.filter(t => t !== 'other' && !(typeof t === 'string' && t.startsWith('other:')))
                                  setFormData({ ...formData, tags: [...tagsWithoutOther, tag] })
                                  if (formData.tags.includes('other') || formData.tags.some(t => typeof t === 'string' && t.startsWith('other:'))) {
                                    setCustomTag('')
                                  }
                                }
                              } else {
                                if (tag === 'other') {
                                  // Remove all custom tags and "other" when "other" is unchecked
                                  setFormData({ ...formData, tags: formData.tags.filter(t => t !== 'other' && !(typeof t === 'string' && t.startsWith('other:'))) })
                                  setCustomTag('')
                                } else {
                                  setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })
                                }
                              }
                            }}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-gray-700 capitalize">{tag.replace('-', ' ')}</span>
                        </label>
                      ))}
                    </div>
                    
                    {/* Custom Tag Input - Show when "other" is checked */}
                    {(formData.tags.includes('other') || formData.tags.some(t => typeof t === 'string' && t.startsWith('other:'))) && (
                      <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Custom Tag Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={customTag}
                          onChange={(e) => {
                            const value = e.target.value
                            setCustomTag(value)
                            
                            // Remove old "other" and custom tags, then add new custom tag if value exists
                            const tagsWithoutOther = formData.tags.filter(t => 
                              t !== 'other' && !(typeof t === 'string' && t.startsWith('other:'))
                            )
                            
                            if (value.trim()) {
                              // Replace "other" with custom tag
                              setFormData({ 
                                ...formData, 
                                tags: [...tagsWithoutOther, `other:${value.trim()}`]
                              })
                            } else {
                              // If empty, keep "other" checked but no custom value
                              setFormData({ 
                                ...formData, 
                                tags: [...tagsWithoutOther, 'other']
                              })
                            }
                          }}
                          placeholder="Enter custom tag name (e.g., HVAC, Landscaping, etc.)"
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter a custom tag to categorize this issue
                        </p>
                      </div>
                    )}
                  </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-4 p-6 border-t flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingIssue(null)
                    resetForm()
                  }}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="issue-form"
                  disabled={submitting}
                  className="px-6 py-3 bg-primary text-white rounded-xl hover:shadow-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : editingIssue ? 'Update Issue' : 'Report Issue'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingIssue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDeletingIssue(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-dark mb-2">Delete Issue</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{deletingIssue.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setDeletingIssue(null)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </motion.div>
  )
}

export default Issues
