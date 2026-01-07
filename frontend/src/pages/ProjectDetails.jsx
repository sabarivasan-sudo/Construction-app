import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  FiArrowLeft, 
  FiBriefcase, 
  FiCalendar, 
  FiDollarSign, 
  FiUsers, 
  FiMapPin,
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
  FiMail,
  FiPhone,
  FiFile,
  FiImage,
  FiDownload,
  FiX
} from 'react-icons/fi'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const ProjectDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProjectDetails()
  }, [id])

  const fetchProjectDetails = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/projects/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProject(data.data)
      } else {
        setError('Project not found')
      }
    } catch (err) {
      setError('Failed to load project details')
    } finally {
      setLoading(false)
    }
  }

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
      case 'active':
        return 'bg-success/10 text-success'
      case 'completed':
        return 'bg-primary/10 text-primary'
      case 'on-hold':
        return 'bg-warning/10 text-warning'
      case 'cancelled':
        return 'bg-red-100 text-red-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading project details...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || 'Project not found'}</p>
        <button
          onClick={() => navigate('/projects')}
          className="px-6 py-3 bg-primary text-white rounded-xl hover:shadow-medium transition-all"
        >
          Back to Projects
        </button>
      </div>
    )
  }

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
            onClick={() => navigate('/projects')}
            className="p-2 hover:bg-light rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-dark">{project.name}</h1>
            <p className="text-gray-500 mt-1">Project Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:shadow-medium transition-all"
          >
            <FiEdit2 className="w-4 h-4" />
            <span>Edit Project</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Overview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-soft"
          >
            <h2 className="text-xl font-bold text-dark mb-4">Project Overview</h2>
            
            {project.description && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600">{project.description}</p>
              </div>
            )}

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">Progress</h3>
                <span className="text-lg font-bold text-primary">{project.progress || 0}%</span>
              </div>
              <div className="w-full bg-light rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress || 0}%` }}
                  transition={{ duration: 0.8 }}
                  className="bg-primary h-3 rounded-full"
                />
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-light rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiDollarSign className="w-5 h-5 text-primary" />
                  <span className="text-xs text-gray-500">Budget</span>
                </div>
                <p className="text-lg font-bold text-dark">{formatCurrency(project.budget)}</p>
              </div>
              
              <div className="bg-light rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiUsers className="w-5 h-5 text-primary" />
                  <span className="text-xs text-gray-500">Team Size</span>
                </div>
                <p className="text-lg font-bold text-dark">
                  {project.team && Array.isArray(project.team) ? project.team.length : 0} {project.team?.length === 1 ? 'member' : 'members'}
                </p>
              </div>

              <div className="bg-light rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiCalendar className="w-5 h-5 text-primary" />
                  <span className="text-xs text-gray-500">Start Date</span>
                </div>
                <p className="text-sm font-semibold text-dark">{formatDate(project.startDate)}</p>
              </div>

              <div className="bg-light rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiCalendar className="w-5 h-5 text-primary" />
                  <span className="text-xs text-gray-500">End Date</span>
                </div>
                <p className="text-sm font-semibold text-dark">{formatDate(project.endDate)}</p>
              </div>
            </div>
          </motion.div>

          {/* Team Members Card */}
          {project.team && project.team.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-soft"
            >
              <h2 className="text-xl font-bold text-dark mb-4">Team Members</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.team.map((member, index) => {
                  // Handle new structure: { user: ObjectId, role: string }
                  const user = typeof member === 'object' && member.user 
                    ? (typeof member.user === 'object' ? member.user : null)
                    : (typeof member === 'object' ? member : null)
                  
                  const role = typeof member === 'object' && member.role ? member.role : (user?.role || 'worker')
                  
                  const getRoleDisplay = (role) => {
                    const roleMap = {
                      'site-engineer': 'Site Engineer',
                      'supervisor': 'Supervisor',
                      'worker': 'Worker',
                      'accountant': 'Accountant',
                      'designer': 'Designer',
                      'manager': 'Manager',
                      'other': 'Other'
                    }
                    return roleMap[role] || role
                  }
                  
                  return (
                    <div
                      key={user?._id || user?.id || member?._id || member?.id || index}
                      className="flex items-center gap-3 p-3 bg-light rounded-lg"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {user?.name
                            ? user.name.charAt(0).toUpperCase()
                            : 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-dark">
                          {user?.name || 'Unknown User'}
                        </p>
                        {user?.email && (
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <FiMail className="w-3 h-3" />
                            {user.email}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{getRoleDisplay(role)}</p>
                      </div>
                    </div>
                  )
                })}
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
            <h2 className="text-lg font-bold text-dark mb-4">Project Status</h2>
            <div className="space-y-4">
              <div>
                <span className={`px-4 py-2 rounded-lg text-sm font-medium inline-block ${getStatusColor(project.status)}`}>
                  {project.status || 'planning'}
                </span>
              </div>
              
              {project.location && (
                <div className="flex items-start gap-2 pt-4 border-t">
                  <FiMapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Location</p>
                    <p className="text-sm text-gray-600">{project.location}</p>
                  </div>
                </div>
              )}

              {project.createdBy && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-1">Created By</p>
                  <p className="text-sm text-gray-600">
                    {typeof project.createdBy === 'object' 
                      ? project.createdBy.name 
                      : 'Unknown'}
                  </p>
                </div>
              )}

              {project.projectManager && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-1">Project Manager</p>
                  <p className="text-sm text-gray-600">
                    {typeof project.projectManager === 'object' 
                      ? project.projectManager.name 
                      : 'Not assigned'}
                  </p>
                  {typeof project.projectManager === 'object' && project.projectManager.email && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <FiMail className="w-3 h-3" />
                      {project.projectManager.email}
                    </p>
                  )}
                </div>
              )}

              {project.createdAt && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-1">Created On</p>
                  <p className="text-sm text-gray-600">{formatDate(project.createdAt)}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-soft"
          >
            <h2 className="text-lg font-bold text-dark mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => navigate(`/tasks?project=${id}`)}
                className="w-full text-left px-4 py-2 rounded-lg hover:bg-light transition-colors text-sm"
              >
                View Tasks
              </button>
              <button
                onClick={() => navigate(`/issues?project=${id}`)}
                className="w-full text-left px-4 py-2 rounded-lg hover:bg-light transition-colors text-sm"
              >
                View Issues
              </button>
              <button
                onClick={() => navigate(`/attendance?project=${id}`)}
                className="w-full text-left px-4 py-2 rounded-lg hover:bg-light transition-colors text-sm"
              >
                View Attendance
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Project Documents Section */}
      {project.documents && project.documents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-soft"
        >
          <h2 className="text-xl font-bold text-dark mb-4">Project Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.documents.map((doc, index) => (
              <div
                key={index}
                className="relative group border border-gray-200 rounded-xl overflow-hidden hover:border-primary transition-all hover:shadow-lg"
              >
                {/* Image Preview */}
                {doc.type === 'photo' && doc.url ? (
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={doc.url}
                      alt={doc.name}
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
                
                {/* Document Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-dark truncate mb-1">{doc.name}</h3>
                      <span className="text-xs text-gray-500 capitalize">{doc.type}</span>
                    </div>
                    {doc.type === 'photo' ? (
                      <FiImage className="w-4 h-4 text-primary flex-shrink-0 ml-2" />
                    ) : (
                      <FiFile className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                    )}
                  </div>
                  
                  {doc.uploadedAt && (
                    <p className="text-xs text-gray-400 mt-2">
                      {formatDate(doc.uploadedAt)}
                    </p>
                  )}
                  
                  {/* Download Button */}
                  <a
                    href={doc.url}
                    download={doc.name}
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
    </motion.div>
  )
}

export default ProjectDetails

