import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  FiArrowLeft, 
  FiCheckSquare, 
  FiCalendar, 
  FiUser, 
  FiUsers,
  FiMapPin,
  FiEdit2,
  FiTag,
  FiClock,
  FiAlertTriangle,
  FiCheckCircle,
  FiFile,
  FiImage,
  FiDownload,
  FiMessageSquare,
  FiBriefcase,
  FiX,
  FiPlus,
  FiCheck
} from 'react-icons/fi'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const TaskDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    fetchTaskDetails()
  }, [id])

  const fetchTaskDetails = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTask(data.data)
      } else {
        setError('Task not found')
      }
    } catch (err) {
      setError('Failed to load task details')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
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

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    
    setSubmittingComment(true)
    try {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')
      const user = userStr ? JSON.parse(userStr) : null
      
      if (!user) {
        alert('User not found. Please login again.')
        return
      }

      const comment = {
        user: user._id || user.id,
        text: newComment.trim(),
        createdAt: new Date().toISOString()
      }

      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          comments: [...(task.comments || []), comment]
        })
      })

      if (response.ok) {
        setNewComment('')
        fetchTaskDetails() // Refresh task data
      } else {
        alert('Failed to add comment')
      }
    } catch (err) {
      alert('Error adding comment')
    } finally {
      setSubmittingComment(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading task details...</p>
        </div>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || 'Task not found'}</p>
        <button
          onClick={() => navigate('/tasks')}
          className="px-6 py-3 bg-primary text-white rounded-xl hover:shadow-medium transition-all"
        >
          Back to Tasks
        </button>
      </div>
    )
  }

  const projectName = typeof task.project === 'object' ? task.project?.name : 'No Project'
  const assigneeName = typeof task.assignedTo === 'object' ? task.assignedTo?.name : 'Unassigned'
  const assigneeEmail = typeof task.assignedTo === 'object' ? task.assignedTo?.email : ''
  const daysRemaining = getDaysRemaining(task.dueDate)
  const progress = task.progress || 0

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-20 md:pb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/tasks')}
            className="p-2 hover:bg-light rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-dark">{task.title}</h1>
            <p className="text-gray-500 mt-1">Task Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:shadow-medium transition-all"
          >
            <FiEdit2 className="w-4 h-4" />
            <span>Edit Task</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Overview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-soft"
          >
            <h2 className="text-xl font-bold text-dark mb-4">Task Overview</h2>
            
            {task.description && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600">{task.description}</p>
              </div>
            )}

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">Progress</h3>
                <span className="text-lg font-bold text-primary">{progress}%</span>
              </div>
              <div className="w-full bg-light rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8 }}
                  className={`h-3 rounded-full ${
                    task.status === 'completed' ? 'bg-green-500' :
                    task.status === 'in-progress' ? 'bg-purple-500' :
                    'bg-gray-300'
                  }`}
                />
              </div>
            </div>

            {/* Key Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-light rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiBriefcase className="w-5 h-5 text-primary" />
                  <span className="text-xs text-gray-500">Project</span>
                </div>
                <p className="text-sm font-semibold text-dark truncate">{projectName}</p>
              </div>
              
              <div className="bg-light rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiUser className="w-5 h-5 text-primary" />
                  <span className="text-xs text-gray-500">Assigned To</span>
                </div>
                <p className="text-sm font-semibold text-dark truncate">{assigneeName}</p>
              </div>

              {task.category && (
                <div className="bg-light rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiTag className="w-5 h-5 text-primary" />
                    <span className="text-xs text-gray-500">Category</span>
                  </div>
                  <p className="text-sm font-semibold text-dark capitalize">
                    {task.category === 'work-item' ? 'Work Item' :
                     task.category === 'material-needed' ? 'Material Needed' :
                     task.category === 'site-problem' ? 'Site Problem' :
                     task.category}
                  </p>
                </div>
              )}

              {task.location && (
                <div className="bg-light rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FiMapPin className="w-5 h-5 text-primary" />
                    <span className="text-xs text-gray-500">Location</span>
                  </div>
                  <p className="text-sm font-semibold text-dark truncate">{task.location}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Subtasks Section */}
          {task.subtasks && task.subtasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-soft"
            >
              <h2 className="text-xl font-bold text-dark mb-4">Subtasks</h2>
              <div className="space-y-3">
                {task.subtasks.map((subtask, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-light rounded-lg"
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      subtask.completed 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-300'
                    }`}>
                      {subtask.completed && <FiCheck className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`flex-1 ${subtask.completed ? 'line-through text-gray-400' : 'text-dark'}`}>
                      {subtask.title}
                    </span>
                    {subtask.completedAt && (
                      <span className="text-xs text-gray-500">
                        {formatDate(subtask.completedAt)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Comments Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-soft"
          >
            <h2 className="text-xl font-bold text-dark mb-4">Comments</h2>
            
            {/* Comments List */}
            {task.comments && task.comments.length > 0 ? (
              <div className="space-y-4 mb-4">
                {task.comments.map((comment, index) => {
                  const commentUser = typeof comment.user === 'object' ? comment.user : null
                  return (
                    <div key={index} className="flex gap-3 p-4 bg-light rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-semibold">
                          {commentUser?.name 
                            ? commentUser.name.charAt(0).toUpperCase()
                            : 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-dark">
                            {commentUser?.name || 'Unknown User'}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-600">{comment.text}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8 mb-4">No comments yet</p>
            )}

            {/* Add Comment */}
            <div className="border-t pt-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || submittingComment}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:shadow-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiMessageSquare className="w-4 h-4" />
                  <span>{submittingComment ? 'Adding...' : 'Add Comment'}</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Attachments Section */}
          {task.attachments && task.attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-soft"
            >
              <h2 className="text-xl font-bold text-dark mb-4">Attachments</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {task.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="relative border border-gray-200 rounded-xl overflow-hidden hover:border-primary transition-all hover:shadow-lg"
                  >
                    {attachment.type === 'image' && attachment.url ? (
                      <div className="relative h-48 bg-gray-100">
                        <img
                          src={attachment.url}
                          alt={attachment.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                        <div className="hidden absolute inset-0 bg-gray-100 items-center justify-center">
                          <FiImage className="w-12 h-12 text-gray-400" />
                        </div>
                      </div>
                    ) : (
                      <div className="h-48 bg-gray-100 flex items-center justify-center">
                        <FiFile className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-dark truncate mb-1">{attachment.name}</h3>
                          <span className="text-xs text-gray-500 capitalize">{attachment.type}</span>
                        </div>
                        {attachment.type === 'image' ? (
                          <FiImage className="w-4 h-4 text-primary flex-shrink-0 ml-2" />
                        ) : (
                          <FiFile className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                        )}
                      </div>
                      
                      {attachment.uploadedAt && (
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDate(attachment.uploadedAt)}
                        </p>
                      )}
                      
                      <a
                        href={attachment.url}
                        download={attachment.name}
                        className="mt-3 inline-flex items-center gap-2 text-xs text-primary hover:text-purple-600 transition-colors"
                      >
                        <FiDownload className="w-3 h-3" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column - Sidebar Info */}
        <div className="space-y-6">
          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-soft"
          >
            <h2 className="text-lg font-bold text-dark mb-4">Task Status</h2>
            <div className="space-y-4">
              <div>
                <span className={`px-4 py-2 rounded-lg text-sm font-medium inline-block border ${getStatusColor(task.status)}`}>
                  {task.status === 'not-started' ? 'Not Started' :
                   task.status === 'in-progress' ? 'In Progress' :
                   task.status === 'blocked' ? 'Blocked' :
                   'Completed'}
                </span>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-gray-700 mb-1">Priority</p>
                <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {getPriorityEmoji(task.priority)} {task.priority}
                </span>
              </div>

              {task.startDate && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-1">Start Date</p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <FiCalendar className="w-4 h-4" />
                    {formatDate(task.startDate)}
                  </p>
                </div>
              )}

              {task.dueDate && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-1">Due Date</p>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mb-2">
                    <FiCalendar className="w-4 h-4" />
                    {formatDate(task.dueDate)}
                  </p>
                  {daysRemaining !== null && (
                    <p className={`text-sm font-semibold flex items-center gap-1 ${getDaysRemainingColor(daysRemaining)}`}>
                      <FiClock className="w-3 h-3" />
                      {daysRemaining < 0 
                        ? `${Math.abs(daysRemaining)} days overdue`
                        : `${daysRemaining} days left`
                      }
                    </p>
                  )}
                </div>
              )}

              {task.estimatedDuration && task.estimatedDuration.value && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-1">Estimated Duration</p>
                  <p className="text-sm text-gray-600">
                    {task.estimatedDuration.value} {task.estimatedDuration.unit}
                  </p>
                </div>
              )}

              {task.createdBy && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-1">Created By</p>
                  <p className="text-sm text-gray-600">
                    {typeof task.createdBy === 'object' 
                      ? task.createdBy.name 
                      : 'Unknown'}
                  </p>
                </div>
              )}

              {task.createdAt && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-1">Created On</p>
                  <p className="text-sm text-gray-600">{formatDate(task.createdAt)}</p>
                </div>
              )}

              {task.completedDate && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-1">Completed On</p>
                  <p className="text-sm text-gray-600">{formatDate(task.completedDate)}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-soft"
            >
              <h2 className="text-lg font-bold text-dark mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, tagIndex) => {
                  const displayTag = typeof tag === 'string' && tag.startsWith('other:') 
                    ? tag.replace('other:', '') 
                    : tag
                  if (tag === 'other') return null
                  return (
                    <span key={tagIndex} className="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-lg">
                      <FiTag className="w-3 h-3 inline mr-1" />
                      {displayTag}
                    </span>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Watchers */}
          {task.watchers && task.watchers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-soft"
            >
              <h2 className="text-lg font-bold text-dark mb-4">Watchers</h2>
              <div className="space-y-2">
                {task.watchers.map((watcher, index) => {
                  const watcherUser = typeof watcher === 'object' ? watcher : null
                  return (
                    <div key={index} className="flex items-center gap-3 p-2 bg-light rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold text-xs">
                          {watcherUser?.name 
                            ? watcherUser.name.charAt(0).toUpperCase()
                            : 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-dark">
                          {watcherUser?.name || 'Unknown User'}
                        </p>
                        {watcherUser?.email && (
                          <p className="text-xs text-gray-500">{watcherUser.email}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default TaskDetails

