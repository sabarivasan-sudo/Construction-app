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

const Tasks = () => {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [deletingTask, setDeletingTask] = useState(null)
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredTasks, setFilteredTasks] = useState([])
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [filters, setFilters] = useState({
    project: '',
    assignedTo: '',
    priority: '',
    status: '',
    tag: ''
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
    category: 'work-item',
    location: '',
    project: '',
    assignedTo: '',
    watchers: [],
    startDate: '',
    dueDate: '',
    estimatedDuration: { value: '', unit: 'days' },
    priority: 'medium',
    status: 'not-started',
    tags: [],
    subtasks: [],
    attachments: []
  })

  // Fetch data
  useEffect(() => {
    fetchTasks()
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
    let filtered = [...tasks]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(task => {
        if (task.title?.toLowerCase().includes(query)) return true
        if (task.description?.toLowerCase().includes(query)) return true
        if (typeof task.project === 'object' && task.project?.name?.toLowerCase().includes(query)) return true
        if (typeof task.assignedTo === 'object' && task.assignedTo?.name?.toLowerCase().includes(query)) return true
        return false
      })
    }

    // Apply filters
    if (filters.project) {
      filtered = filtered.filter(task => {
        const projectId = typeof task.project === 'object' ? task.project._id : task.project
        return projectId === filters.project
      })
    }
    if (filters.assignedTo) {
      filtered = filtered.filter(task => {
        const userId = typeof task.assignedTo === 'object' ? task.assignedTo._id : task.assignedTo
        return userId === filters.assignedTo
      })
    }
    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority)
    }
    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status)
    }
    if (filters.tag) {
      filtered = filtered.filter(task => task.tags?.includes(filters.tag))
    }

    setFilteredTasks(filtered)
  }, [searchQuery, tasks, filters])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(menuRefs.current).forEach((id) => {
        if (menuRefs.current[id] && !menuRefs.current[id].contains(event.target)) {
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

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.warn('No token found, user may need to login')
        setLoading(false)
        return
      }

      const response = await fetch(`${API_URL}/tasks`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setTasks(data.data || [])
      } else if (response.status === 401) {
        // Token expired or invalid - clear storage and redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch tasks' }))
        console.error('Error fetching tasks:', errorData.message)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.warn('No token found, user may need to login')
        return
      }

      const response = await fetch(`${API_URL}/projects`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProjects(data.data || [])
      } else if (response.status === 401) {
        // Token expired or invalid - clear storage and redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch projects' }))
        console.error('Error fetching projects:', errorData.message)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.warn('No token found, user may need to login')
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
        console.error('Error fetching users:', errorData.message)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
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

    // Validate due date is after start date
    if (formData.startDate && formData.dueDate && new Date(formData.dueDate) < new Date(formData.startDate)) {
      showToast('Due date must be after start date', 'error')
      setSubmitting(false)
      return
    }

    try {
      const token = localStorage.getItem('token')
      const url = editingTask 
        ? `${API_URL}/tasks/${editingTask._id || editingTask.id}`
        : `${API_URL}/tasks`
      const method = editingTask ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        estimatedDuration: formData.estimatedDuration.value ? {
          value: parseFloat(formData.estimatedDuration.value),
          unit: formData.estimatedDuration.unit
        } : undefined,
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
        setEditingTask(null)
        resetForm()
        showToast(editingTask ? 'Task updated successfully! 🎉' : 'Task created successfully! 🎉', 'success')
        fetchTasks()
      } else {
        showToast(data.message || `Failed to ${editingTask ? 'update' : 'create'} task`, 'error')
      }
    } catch (err) {
      showToast('Network error. Please check if backend is running.', 'error')
      console.error('Task error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'work-item',
      location: '',
      project: '',
      assignedTo: '',
      watchers: [],
      startDate: '',
      dueDate: '',
      estimatedDuration: { value: '', unit: 'days' },
      priority: 'medium',
      status: 'not-started',
      tags: [],
      subtasks: [],
      attachments: []
    })
    setUploadedFiles([])
    setCustomTag('')
  }

  const handleEdit = (task) => {
    setOpenMenuId(null)
    setEditingTask(task)
    
    // Extract custom tags (tags starting with "other:")
    const customTags = (task.tags || []).filter(t => typeof t === 'string' && t.startsWith('other:'))
    const standardTags = (task.tags || []).filter(t => !(typeof t === 'string' && t.startsWith('other:')))
    
    // If there are custom tags, check "other" and set the custom tag value
    const hasCustomTag = customTags.length > 0
    const customTagValue = hasCustomTag ? customTags[0].replace('other:', '') : ''
    
    // Add "other" to tags if there's a custom tag
    const tagsWithOther = hasCustomTag ? [...standardTags, 'other'] : standardTags
    
    setFormData({
      title: task.title || '',
      description: task.description || '',
      category: task.category || 'work-item',
      location: task.location || '',
      project: typeof task.project === 'object' ? task.project._id : task.project || '',
      assignedTo: typeof task.assignedTo === 'object' ? task.assignedTo._id : task.assignedTo || '',
      watchers: task.watchers?.map(w => typeof w === 'object' ? w._id : w) || [],
      startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      estimatedDuration: task.estimatedDuration || { value: '', unit: 'days' },
      priority: task.priority || 'medium',
      status: task.status || 'not-started',
      tags: hasCustomTag ? [...tagsWithOther, ...customTags] : tagsWithOther,
      subtasks: task.subtasks || [],
      attachments: task.attachments || []
    })
    setCustomTag(customTagValue)
    setUploadedFiles(task.attachments || [])
    setShowModal(true)
  }

  const handleDelete = async () => {
    if (!deletingTask) return
    setSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/tasks/${deletingTask._id || deletingTask.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (response.ok && data.success) {
        setDeletingTask(null)
        showToast('Task deleted successfully! 🗑️', 'success')
        fetchTasks()
      } else {
        showToast(data.message || 'Failed to delete task', 'error')
      }
    } catch (err) {
      showToast('Network error. Please check if backend is running.', 'error')
      console.error('Delete task error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    setUploadingFiles(true)
    const maxSize = 10 * 1024 * 1024
    const validFiles = files.filter(f => f.size <= maxSize)
    if (validFiles.length < files.length) {
      showToast('Some files exceed 10MB limit', 'error')
    }
    if (validFiles.length === 0) {
      setUploadingFiles(false)
      return
    }
    try {
      const newFiles = await Promise.all(validFiles.map(async (file) => {
        const base64 = await fileToBase64(file)
        return {
          name: file.name,
          type: file.type.includes('image') ? 'image' : file.type.includes('pdf') ? 'pdf' : 'other',
          url: base64,
          uploadedAt: new Date().toISOString(),
          preview: file.type.includes('image') ? base64 : null
        }
      }))
      setUploadedFiles([...uploadedFiles, ...newFiles])
      showToast(`${newFiles.length} file(s) uploaded`, 'success')
    } catch (error) {
      showToast('Error uploading files', 'error')
    } finally {
      setUploadingFiles(false)
      e.target.value = ''
    }
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

  const addSubtask = () => {
    setFormData({
      ...formData,
      subtasks: [...formData.subtasks, { title: '', completed: false }]
    })
  }

  const updateSubtask = (index, field, value) => {
    const newSubtasks = [...formData.subtasks]
    newSubtasks[index] = { ...newSubtasks[index], [field]: value }
    setFormData({ ...formData, subtasks: newSubtasks })
  }

  const removeSubtask = (index) => {
    setFormData({
      ...formData,
      subtasks: formData.subtasks.filter((_, i) => i !== index)
    })
  }

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }))
  }

  const clearFilters = () => {
    setFilters({ project: '', assignedTo: '', priority: '', status: '', tag: '' })
    setShowFilterMenu(false)
  }

  const hasActiveFilters = Object.values(filters).some(f => f)

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500 text-white'
      case 'medium':
        return 'bg-orange-500 text-white'
      case 'low':
        return 'bg-green-500 text-white'
      default:
        return 'bg-gray-200 text-gray-700'
    }
  }

  const getPriorityEmoji = (priority) => {
    switch (priority) {
      case 'high': return '🔴'
      case 'medium': return '🟠'
      case 'low': return '🟢'
      default: return ''
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'in-progress':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'blocked':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'not-started':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="w-5 h-5 text-green-600" />
      case 'in-progress':
        return <FiClock className="w-5 h-5 text-purple-600" />
      case 'blocked':
        return <FiAlertTriangle className="w-5 h-5 text-red-600" />
      default:
        return <FiAlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getDaysRemainingColor = (days) => {
    if (days < 0) return 'text-red-600'
    if (days <= 3) return 'text-orange-600'
    return 'text-green-600'
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
          <h1 className="text-3xl font-bold text-dark mb-2">Tasks</h1>
          <p className="text-gray-500">Track and manage construction tasks</p>
        </div>
        <motion.button 
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <FiPlus className="w-5 h-5" />
          <span>New Task</span>
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
            placeholder="Search tasks by title, description, project, or assignee..."
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

          {/* Filter Dropdown */}
          {showFilterMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50 min-w-[280px]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-dark">Filter Tasks</h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-sm text-primary hover:underline">
                    Clear All
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                  <select
                    value={filters.project}
                    onChange={(e) => handleFilterChange('project', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <select
                    value={filters.assignedTo}
                    onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="">All Priorities</option>
                    <option value="high">High 🔴</option>
                    <option value="medium">Medium 🟠</option>
                    <option value="low">Low 🟢</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="">All Statuses</option>
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
                  <select
                    value={filters.tag}
                    onChange={(e) => handleFilterChange('tag', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  >
                    <option value="">All Tags</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="masonry">Masonry</option>
                    <option value="interior">Interior</option>
                    <option value="finishing">Finishing</option>
                    <option value="foundation">Foundation</option>
                    <option value="roofing">Roofing</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Tasks Grid - Premium Card Design */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading tasks...</p>
        </div>
      ) : (searchQuery.trim() || hasActiveFilters) && filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <FiSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No tasks found</p>
          <p className="text-gray-400 text-sm">
            {searchQuery.trim() ? 'Try searching with different keywords' : 'Try adjusting your filters'}
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
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <FiCheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No tasks yet</p>
          <p className="text-gray-400 text-sm mb-4">Create your first task to get started</p>
          <button 
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:shadow-medium transition-all mx-auto"
          >
            <FiPlus className="w-5 h-5" />
            <span>Create Task</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(searchQuery.trim() || hasActiveFilters ? filteredTasks : tasks).map((task, index) => {
            const projectName = typeof task.project === 'object' ? task.project?.name : 'No Project'
            const assigneeName = typeof task.assignedTo === 'object' ? task.assignedTo?.name : 'Unassigned'
            const daysRemaining = getDaysRemaining(task.dueDate)
            const progress = task.progress || 0
            
            return (
              <motion.div
                key={task._id || task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1"
              >
                {/* Header with Menu */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-dark mb-2">{task.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <FiBriefcase className="w-4 h-4" />
                        {projectName}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiUser className="w-4 h-4" />
                        {assigneeName}
                      </span>
                      {task.location && (
                        <span className="flex items-center gap-1">
                          <FiMapPin className="w-4 h-4" />
                          {task.location}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {task.category && (
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg font-medium capitalize">
                          {task.category === 'work-item' ? 'Work Item' :
                           task.category === 'material-needed' ? 'Material Needed' :
                           task.category === 'site-problem' ? 'Site Problem' :
                           task.category}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {getPriorityEmoji(task.priority)} {task.priority}
                      </span>
                    </div>
                  </div>
                  <div className="relative" ref={el => menuRefs.current[task._id || task.id] = el}>
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === (task._id || task.id) ? null : (task._id || task.id))}
                      className="p-2 hover:bg-light rounded-lg transition-colors"
                    >
                      <FiMoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                    {openMenuId === (task._id || task.id) && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 min-w-[150px]"
                      >
                        <button
                          onClick={() => handleEdit(task)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <FiEdit2 className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            setDeletingTask(task)
                            setOpenMenuId(null)
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <FiTrash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Description Preview */}
                {task.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{task.description}</p>
                )}

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-dark">Progress</span>
                    <span className="text-sm font-bold text-primary">{progress}%</span>
                  </div>
                  <div className="w-full bg-light rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
                      className={`h-2 rounded-full ${
                        task.status === 'completed' ? 'bg-green-500' :
                        task.status === 'in-progress' ? 'bg-purple-500' :
                        'bg-gray-300'
                      }`}
                    />
                  </div>
                </div>

                {/* Date Section */}
                {task.dueDate && (
                  <div className="flex items-center justify-between mb-4 p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiCalendar className="w-4 h-4" />
                      <span>Due: {formatDate(task.dueDate)}</span>
                    </div>
                    {daysRemaining !== null && (
                      <span className={`text-sm font-semibold flex items-center gap-1 ${getDaysRemainingColor(daysRemaining)}`}>
                        <FiClock className="w-3 h-3" />
                        {daysRemaining < 0 
                          ? `${Math.abs(daysRemaining)} days overdue`
                          : `${daysRemaining} days left`
                        }
                      </span>
                    )}
                  </div>
                )}

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {task.tags.map((tag, tagIndex) => {
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

                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(task.status)}`}>
                    {task.status === 'not-started' ? 'Not Started' :
                     task.status === 'in-progress' ? 'In Progress' :
                     task.status === 'blocked' ? 'Blocked' :
                     'Completed'}
                  </span>
                  <button 
                    onClick={() => navigate(`/tasks/${task._id || task.id}`)}
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

      {/* Task Creation/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowModal(false)
                setEditingTask(null)
                resetForm()
              }}
              className="fixed inset-0 bg-black/50 z-[9998]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowModal(false)
                  setEditingTask(null)
                  resetForm()
                }
              }}
            >
              <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
                  <h2 className="text-2xl font-bold text-dark">
                    {editingTask ? 'Edit Task' : 'Create New Task'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setEditingTask(null)
                      resetForm()
                    }}
                    className="p-2 hover:bg-light rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Modal Body - Scrollable */}
                <div className="overflow-y-auto flex-1 min-h-0">
                  <form id="task-form" onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Section 1: Task Information */}
                    <div className="border-b border-gray-200 pb-6 mb-6 rounded-2xl p-4 bg-gray-50/50 shadow-sm">
                      <h3 className="text-lg font-semibold text-dark mb-6">Task Information</h3>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Task Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Enter task title"
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Enter task description"
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Task Category
                          </label>
                          <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                            <option value="work-item">Work Item</option>
                            <option value="issue">Issue</option>
                            <option value="material-needed">Material Needed</option>
                            <option value="inspection">Inspection</option>
                            <option value="site-problem">Site Problem</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location Inside Project
                          </label>
                          <div className="relative">
                            <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                            <input
                              type="text"
                              value={formData.location}
                              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                              placeholder="e.g., Ground Floor, Terrace, Block A, Room No. 104"
                              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Assignment */}
                    <div className="border-b border-gray-200 pb-6 mb-6 rounded-2xl p-4 bg-gray-50/50 shadow-sm">
                      <h3 className="text-lg font-semibold text-dark mb-6">Assignment</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <FiBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                              value={formData.project}
                              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assigned To
                          </label>
                          <div className="relative">
                            <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                            <select
                              value={formData.assignedTo}
                              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                              <option value="">Unassigned</option>
                              {users.map(user => (
                                <option key={user._id || user.id} value={user._id || user.id}>
                                  {user.name} ({user.email})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Followers / Watchers
                        </label>
                        <div className="relative">
                          <FiUsers className="absolute left-3 top-3 text-gray-400 w-5 h-5 z-10 pointer-events-none" />
                          <select
                            multiple
                            value={formData.watchers || []}
                            onChange={(e) => {
                              const selected = Array.from(e.target.selectedOptions, option => option.value)
                              setFormData({ ...formData, watchers: selected })
                            }}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[120px]"
                            size={5}
                          >
                            {users.map((user) => (
                              <option key={user._id || user.id} value={user._id || user.id}>
                                {user.name} ({user.email})
                              </option>
                            ))}
                          </select>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Hold Ctrl/Cmd to select multiple. {formData.watchers?.length || 0} selected
                        </p>
                      </div>
                    </div>

                    {/* Section 3: Timeline */}
                    <div className="border-b border-gray-200 pb-6 mb-6 rounded-2xl p-4 bg-gray-50/50 shadow-sm">
                      <h3 className="text-lg font-semibold text-dark mb-6">Timeline</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date
                          </label>
                          <div className="relative">
                            <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                            <input
                              type="date"
                              value={formData.startDate}
                              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Due Date
                          </label>
                          <div className="relative">
                            <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                            <input
                              type="date"
                              value={formData.dueDate}
                              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                              min={formData.startDate || ''}
                              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2 lg:col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estimated Duration
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={formData.estimatedDuration.value}
                              onChange={(e) => setFormData({ 
                                ...formData, 
                                estimatedDuration: { ...formData.estimatedDuration, value: e.target.value }
                              })}
                              placeholder="0"
                              min="0"
                              className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <select
                              value={formData.estimatedDuration.unit}
                              onChange={(e) => setFormData({ 
                                ...formData, 
                                estimatedDuration: { ...formData.estimatedDuration, unit: e.target.value }
                              })}
                              className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent whitespace-nowrap"
                            >
                              <option value="hours">Hours</option>
                              <option value="days">Days</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Status & Priority */}
                    <div className="border-b border-gray-200 pb-6 mb-6 rounded-2xl p-4 bg-gray-50/50 shadow-sm">
                      <h3 className="text-lg font-semibold text-dark mb-6">Status & Priority</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                          </label>
                          <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                            <option value="not-started">Not Started</option>
                            <option value="in-progress">In Progress</option>
                            <option value="blocked">Blocked</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Priority
                          </label>
                          <select
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                            <option value="high">High 🔴</option>
                            <option value="medium">Medium 🟠</option>
                            <option value="low">Low 🟢</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tags
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {['plumbing', 'electrical', 'masonry', 'interior', 'finishing', 'foundation', 'roofing', 'other'].map(tag => (
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
                              <span className="text-sm text-gray-700 capitalize">{tag}</span>
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
                              Enter a custom tag to categorize this task
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section 5: Subtasks */}
                    <div className="border-b border-gray-200 pb-6 mb-6 rounded-2xl p-4 bg-gray-50/50 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-dark">Subtasks</h3>
                        <button
                          type="button"
                          onClick={addSubtask}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <FiPlus className="w-4 h-4" />
                          <span>Add Subtask</span>
                        </button>
                      </div>
                      
                      {formData.subtasks.length > 0 ? (
                        <div className="space-y-2">
                          {formData.subtasks.map((subtask, index) => (
                            <div key={index} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
                              <input
                                type="checkbox"
                                checked={subtask.completed || false}
                                onChange={(e) => updateSubtask(index, 'completed', e.target.checked)}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                              />
                              <input
                                type="text"
                                value={subtask.title}
                                onChange={(e) => updateSubtask(index, 'title', e.target.value)}
                                placeholder="Subtask title"
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => removeSubtask(index)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <FiX className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No subtasks added yet</p>
                      )}
                    </div>

                    {/* Section 6: Attachments */}
                    <div className="border-b border-gray-200 pb-6 mb-6 rounded-2xl p-4 bg-gray-50/50 shadow-sm">
                      <h3 className="text-lg font-semibold text-dark mb-6">Attachments</h3>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Files
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
                            id="task-file-upload"
                          />
                          <label
                            htmlFor="task-file-upload"
                            className={`flex flex-col items-center gap-2 ${
                              uploadingFiles ? 'cursor-wait opacity-75' : 'cursor-pointer'
                            }`}
                          >
                            {uploadingFiles ? (
                              <>
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <span className="text-sm text-gray-600">Processing files...</span>
                              </>
                            ) : (
                              <>
                                <FiUpload className="w-8 h-8 text-gray-400" />
                                <span className="text-sm text-gray-600">Click to upload or drag and drop</span>
                                <span className="text-xs text-gray-500">PDF, Images, DOC (Max 10MB per file)</span>
                              </>
                            )}
                          </label>
                        </div>
                      </div>

                      {uploadedFiles.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="relative p-3 bg-gray-50 rounded-lg border border-gray-200">
                              {file.preview || (file.type === 'image' && file.url) ? (
                                <img src={file.preview || file.url} alt={file.name} className="w-full h-32 object-cover rounded-lg mb-2" />
                              ) : (
                                <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                                  <FiFile className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                                  <p className="text-xs text-gray-500 capitalize">{file.type}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFile(index)}
                                  className="ml-2 text-red-500 hover:text-red-700"
                                >
                                  <FiX className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </form>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-4 p-6 border-t bg-white flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingTask(null)
                      resetForm()
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    form="task-form"
                    disabled={submitting}
                    whileHover={!submitting ? { scale: 1.02 } : {}}
                    whileTap={!submitting ? { scale: 0.98 } : {}}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{editingTask ? 'Updating...' : 'Creating...'}</span>
                      </>
                    ) : (
                      <span>{editingTask ? 'Update Task' : 'Create Task'}</span>
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
        {deletingTask && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingTask(null)}
              className="fixed inset-0 bg-black/50 z-[9998]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <h2 className="text-2xl font-bold text-dark mb-4">Delete Task</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete <strong>"{deletingTask.title}"</strong>? This action cannot be undone.
                </p>
                <div className="flex items-center justify-end gap-4">
                  <button
                    onClick={() => setDeletingTask(null)}
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
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </motion.div>
  )
}

export default Tasks

