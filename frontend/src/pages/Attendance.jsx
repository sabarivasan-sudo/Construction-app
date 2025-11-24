import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { 
  FiPlus, FiSearch, FiFilter, FiCheckCircle, FiClock, FiAlertCircle, FiX,
  FiEdit2, FiTrash2, FiMoreVertical, FiCalendar, FiUser, FiUsers, FiTag,
  FiUpload, FiFile, FiDownload, FiEye, FiInfo, FiMessageSquare,
  FiCheck, FiXCircle, FiAlertTriangle, FiBriefcase, FiMapPin, FiToggleLeft, FiToggleRight,
  FiCamera, FiNavigation
} from 'react-icons/fi'
import Toast from '../components/Toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const Attendance = () => {
  const [attendances, setAttendances] = useState([])
  const [loading, setLoading] = useState(true)
  const [showManualModal, setShowManualModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [editingAttendance, setEditingAttendance] = useState(null)
  const [deletingAttendance, setDeletingAttendance] = useState(null)
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredAttendances, setFilteredAttendances] = useState([])
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [filters, setFilters] = useState({
    project: '',
    user: '',
    status: '',
    date: ''
  })
  const [toasts, setToasts] = useState([])
  const [openMenuId, setOpenMenuId] = useState(null)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [cameraStream, setCameraStream] = useState(null)
  const [showCamera, setShowCamera] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  
  const menuRefs = useRef({})
  const filterMenuRef = useRef(null)
  
  const [formData, setFormData] = useState({
    user: '',
    project: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    overtime: '',
    lateArrival: false,
    earlyLeave: false,
    status: 'present',
    notes: '',
    photo: '',
    latitude: '',
    longitude: '',
    locationName: ''
  })

  // Fetch data
  useEffect(() => {
    fetchAttendances()
    fetchProjects()
    fetchUsers()
  }, [])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showManualModal || showUploadModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
      // Clean up camera when modal closes
      stopCamera()
    }
    return () => {
      document.body.style.overflow = 'unset'
      stopCamera()
    }
  }, [showManualModal, showUploadModal])

  // Search and filter functionality
  useEffect(() => {
    let filtered = [...attendances]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(attendance => {
        if (typeof attendance.user === 'object' && attendance.user?.name?.toLowerCase().includes(query)) return true
        if (typeof attendance.project === 'object' && attendance.project?.name?.toLowerCase().includes(query)) return true
        if (attendance.status?.toLowerCase().includes(query)) return true
        return false
      })
    }

    // Apply filters
    if (filters.project) {
      filtered = filtered.filter(attendance => {
        const projectId = typeof attendance.project === 'object' ? attendance.project._id : attendance.project
        return projectId === filters.project
      })
    }

    if (filters.user) {
      filtered = filtered.filter(attendance => {
        const userId = typeof attendance.user === 'object' ? attendance.user._id : attendance.user
        return userId === filters.user
      })
    }

    if (filters.status) {
      filtered = filtered.filter(attendance => attendance.status === filters.status)
    }

    if (filters.date) {
      filtered = filtered.filter(attendance => {
        const attendanceDate = new Date(attendance.date).toISOString().split('T')[0]
        return attendanceDate === filters.date
      })
    }

    setFilteredAttendances(filtered)
  }, [attendances, searchQuery, filters])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside any menu container (which includes both button and dropdown)
      let clickedInsideMenu = false
      Object.keys(menuRefs.current).forEach(id => {
        const ref = menuRefs.current[id]
        // The ref is the container div, so it includes both button and dropdown
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

  const fetchAttendances = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.warn('No token found, user may need to login')
        setLoading(false)
        return
      }

      const response = await fetch(`${API_URL}/attendance`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAttendances(data.data || [])
      } else if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch attendance' }))
        console.error('Error fetching attendance:', errorData.message)
      }
    } catch (error) {
      console.error('Error fetching attendance:', error)
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

  const resetForm = () => {
    setFormData({
      user: '',
      project: '',
      date: new Date().toISOString().split('T')[0],
      checkIn: '',
      checkOut: '',
      overtime: '',
      lateArrival: false,
      earlyLeave: false,
      status: 'present',
      notes: '',
      photo: '',
      latitude: '',
      longitude: '',
      locationName: ''
    })
    setEditingAttendance(null)
    setCapturedImage(null)
    setShowCamera(false)
    stopCamera()
  }

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      })
      setCameraStream(stream)
      setShowCamera(true)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      
      // Clear old location data to ensure fresh location fetch
      setFormData(prev => ({
        ...prev,
        latitude: '',
        longitude: '',
        locationName: ''
      }))
      
      // Automatically get location when camera opens - ALWAYS get fresh location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            console.log('Fresh GPS coordinates when camera opens:', { latitude, longitude })
            const locationName = await getLocationName(latitude, longitude)
            setFormData(prev => ({
              ...prev,
              latitude: latitude.toString(),
              longitude: longitude.toString(),
              locationName: locationName
            }))
          },
          (error) => {
            console.error('Geolocation error:', error)
            // Don't show error toast, just silently fail - location is optional
          },
          {
            enableHighAccuracy: true,
            timeout: 10000, // Increased timeout
            maximumAge: 0 // Always get fresh location, no cache
          }
        )
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      showToast('Unable to access camera. Please check permissions.', 'error')
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setShowCamera(false)
  }

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Draw video frame
      context.drawImage(video, 0, 0)
      
      // Get location automatically - ALWAYS get fresh location when capturing photo
      let locationName = formData.locationName
      let latitude = formData.latitude
      let longitude = formData.longitude
      
      // Always get fresh location when capturing photo (don't use cached)
      try {
        const position = await new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'))
            return
          }
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000, // Increased timeout
            maximumAge: 0 // Always get fresh location, no cache
          })
        })
        
        const { latitude: lat, longitude: lng } = position.coords
        console.log('Fresh GPS coordinates on photo capture:', { lat, lng })
        
        // Validate coordinates are reasonable (not cached wrong location)
        // Chennai is roughly: 12.8°N to 13.2°N, 80.0°E to 80.3°E
        // If coordinates seem wrong, still use them but log warning
        if (lat < 8 || lat > 14 || lng < 76 || lng > 81) {
          console.warn('Coordinates seem unusual for Tamil Nadu:', { lat, lng })
        }
        
        locationName = await getLocationName(lat, lng)
        latitude = lat.toString()
        longitude = lng.toString()
      } catch (error) {
        console.error('Error getting location:', error)
        // If we have old coordinates, still try to get location name
        if (latitude && longitude && !locationName) {
          locationName = await getLocationName(
            parseFloat(latitude),
            parseFloat(longitude)
          )
        }
      }
      
      // Update form data with location
      if (locationName || latitude || longitude) {
        setFormData({
          ...formData,
          latitude: latitude || formData.latitude,
          longitude: longitude || formData.longitude,
          locationName: locationName || formData.locationName
        })
      }
      
      // Get project name
      const selectedProject = projects.find(p => 
        (p._id || p.id) === formData.project
      )
      const projectName = selectedProject?.name || 'No Project'
      
      // Get current date and time
      const now = new Date()
      const dateStr = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })
      
      // Set font before measuring text
      context.font = '14px Arial, sans-serif'
      context.textBaseline = 'top'
      
      // Draw watermark background (semi-transparent black box at bottom-left)
      const padding = 16
      const lineHeight = 20
      const lineSpacing = 4
      const watermarkLines = [
        `Date: ${dateStr}`,
        `Time: ${timeStr}`,
        `Location: ${locationName || 'Not available'}`,
        `Project: ${projectName}`
      ]
      
      // Calculate text width for all lines
      const textWidth = Math.max(
        ...watermarkLines.map(line => {
          const metrics = context.measureText(line)
          return metrics.width
        })
      )
      
      const watermarkWidth = textWidth + padding * 2
      const watermarkHeight = (watermarkLines.length * (lineHeight + lineSpacing)) - lineSpacing + padding * 2
      const margin = 20
      
      // Draw rounded rectangle background
      const x = margin
      const y = canvas.height - watermarkHeight - margin
      const radius = 12
      
      context.fillStyle = 'rgba(0, 0, 0, 0.7)'
      context.beginPath()
      context.moveTo(x + radius, y)
      context.lineTo(x + watermarkWidth - radius, y)
      context.quadraticCurveTo(x + watermarkWidth, y, x + watermarkWidth, y + radius)
      context.lineTo(x + watermarkWidth, y + watermarkHeight - radius)
      context.quadraticCurveTo(x + watermarkWidth, y + watermarkHeight, x + watermarkWidth - radius, y + watermarkHeight)
      context.lineTo(x + radius, y + watermarkHeight)
      context.quadraticCurveTo(x, y + watermarkHeight, x, y + watermarkHeight - radius)
      context.lineTo(x, y + radius)
      context.quadraticCurveTo(x, y, x + radius, y)
      context.closePath()
      context.fill()
      
      // Draw watermark text
      context.fillStyle = '#FFFFFF'
      
      watermarkLines.forEach((line, index) => {
        const textY = y + padding + (index * (lineHeight + lineSpacing))
        context.fillText(line, x + padding, textY)
      })
      
      // Convert to base64
      const imageData = canvas.toDataURL('image/jpeg', 0.8)
      setCapturedImage(imageData)
      setFormData(prev => ({
        ...prev,
        photo: imageData,
        latitude: latitude || prev.latitude,
        longitude: longitude || prev.longitude,
        locationName: locationName || prev.locationName
      }))
      stopCamera()
      showToast('Photo captured successfully!', 'success')
    }
  }

  const removePhoto = () => {
    setCapturedImage(null)
    setFormData({ ...formData, photo: '' })
  }

  // Helper function to apply watermark to an image
  const applyWatermarkToImage = async (imageSrc) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = async () => {
        const canvas = canvasRef.current
        if (!canvas) {
          resolve(imageSrc)
          return
        }
        
        const context = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        
        // Draw the image
        context.drawImage(img, 0, 0)
        
        // Get location automatically - ALWAYS get fresh location when selecting from gallery
        let locationName = formData.locationName
        let latitude = formData.latitude
        let longitude = formData.longitude
        
        // Always get fresh location when selecting from gallery (don't use cached)
        try {
          const position = await new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
              reject(new Error('Geolocation not supported'))
              return
            }
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000, // Increased timeout
              maximumAge: 0 // Always get fresh location, no cache
            })
          })
          
          const { latitude: lat, longitude: lng } = position.coords
          console.log('Fresh GPS coordinates on gallery select:', { lat, lng })
          
          locationName = await getLocationName(lat, lng)
          latitude = lat.toString()
          longitude = lng.toString()
        } catch (error) {
          console.error('Error getting location:', error)
          // If we have old coordinates, still try to get location name
          if (latitude && longitude && !locationName) {
            locationName = await getLocationName(
              parseFloat(latitude),
              parseFloat(longitude)
            )
          }
        }
        
        // Update form data with location
        if (locationName || latitude || longitude) {
          setFormData(prev => ({
            ...prev,
            latitude: latitude || prev.latitude,
            longitude: longitude || prev.longitude,
            locationName: locationName || prev.locationName
          }))
        }
        
        // Get project name
        const selectedProject = projects.find(p => 
          (p._id || p.id) === formData.project
        )
        const projectName = selectedProject?.name || 'No Project'
        
        // Get current date and time
        const now = new Date()
        const dateStr = now.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
        const timeStr = now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
        
        // Set font before measuring text
        context.font = '14px Arial, sans-serif'
        context.textBaseline = 'top'
        
        // Draw watermark background (semi-transparent black box at bottom-left)
        const padding = 16
        const lineHeight = 20
        const lineSpacing = 4
        const watermarkLines = [
          `Date: ${dateStr}`,
          `Time: ${timeStr}`,
          `Location: ${locationName || 'Not available'}`,
          `Project: ${projectName}`
        ]
        
        // Calculate text width for all lines
        const textWidth = Math.max(
          ...watermarkLines.map(line => {
            const metrics = context.measureText(line)
            return metrics.width
          })
        )
        
        const watermarkWidth = textWidth + padding * 2
        const watermarkHeight = (watermarkLines.length * (lineHeight + lineSpacing)) - lineSpacing + padding * 2
        const margin = 20
        
        // Draw rounded rectangle background
        const x = margin
        const y = canvas.height - watermarkHeight - margin
        const radius = 12
        
        context.fillStyle = 'rgba(0, 0, 0, 0.7)'
        context.beginPath()
        context.moveTo(x + radius, y)
        context.lineTo(x + watermarkWidth - radius, y)
        context.quadraticCurveTo(x + watermarkWidth, y, x + watermarkWidth, y + radius)
        context.lineTo(x + watermarkWidth, y + watermarkHeight - radius)
        context.quadraticCurveTo(x + watermarkWidth, y + watermarkHeight, x + watermarkWidth - radius, y + watermarkHeight)
        context.lineTo(x + radius, y + watermarkHeight)
        context.quadraticCurveTo(x, y + watermarkHeight, x, y + watermarkHeight - radius)
        context.lineTo(x, y + radius)
        context.quadraticCurveTo(x, y, x + radius, y)
        context.closePath()
        context.fill()
        
        // Draw watermark text
        context.fillStyle = '#FFFFFF'
        
        watermarkLines.forEach((line, index) => {
          const textY = y + padding + (index * (lineHeight + lineSpacing))
          context.fillText(line, x + padding, textY)
        })
        
        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.8)
        
        // Update form data
        setFormData(prev => ({
          ...prev,
          photo: imageData,
          latitude: latitude || prev.latitude,
          longitude: longitude || prev.longitude,
          locationName: locationName || prev.locationName
        }))
        
        resolve(imageData)
      }
      img.onerror = () => {
        resolve(imageSrc) // Return original if error
      }
      img.src = imageSrc
    })
  }

  // Handle gallery image selection
  const handleGallerySelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast('Image size should be less than 10MB', 'error')
      return
    }

    try {
      // Read file as data URL
      const reader = new FileReader()
      reader.onload = async (event) => {
        const imageSrc = event.target?.result
        if (!imageSrc) return

        // Apply watermark to the selected image
        const watermarkedImage = await applyWatermarkToImage(imageSrc)
        setCapturedImage(watermarkedImage)
        showToast('Photo selected and watermarked successfully!', 'success')
      }
      reader.onerror = () => {
        showToast('Error reading image file', 'error')
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error handling gallery image:', error)
      showToast('Error processing image', 'error')
    }
  }

  // Get location name from coordinates using OpenStreetMap - returns actual location
  const getLocationName = async (lat, lon) => {
    try {
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=18`,
        {
          headers: {
            'User-Agent': 'ConstructionManagementApp/1.0',
            'Accept-Language': 'en'
          }
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch location name')
      }
      
      const data = await response.json()
      const address = data.address || {}
      
      // Debug: Log the full address data
      console.log('OpenStreetMap address data:', address)
      console.log('Display name:', data.display_name)
      
      // Priority order for locality (most specific first)
      let locality = 
        address.suburb || 
        address.neighbourhood || 
        address.village || 
        address.locality || 
        address.hamlet ||
        ''
      
      // Priority order for city/district (check state_district and district first for Tamil Nadu)
      let city = ''
      
      // For Tamil Nadu, state_district (like Ramanathapuram) is the district name
      // This should come before county (which might be a smaller place name)
      if (address.state_district) {
        city = address.state_district
      } else if (address.district) {
        city = address.district
      } else if (address.city) {
        city = address.city
      } else if (address.town) {
        city = address.town
      } else if (address.municipality) {
        city = address.municipality
      } else if (address.county) {
        city = address.county
      }
      
      // If locality is empty but county exists and is different from city, use county as locality
      // Example: county="Tiruvadanai", state_district="Ramanathapuram"
      // Result: locality="Tiruvadanai", city="Ramanathapuram"
      if (!locality && address.county && address.county !== city) {
        locality = address.county
      }
      
      // State
      const state = address.state || 'Tamil Nadu'
      
      // Clean up values - remove empty strings and trim
      locality = locality ? locality.trim() : ''
      city = city ? city.trim() : ''
      
      // Build readable final name - avoid duplicates
      const parts = []
      
      if (locality && locality.length > 0) {
        parts.push(locality)
      }
      
      // Add city/district if it's different from locality
      if (city && city.length > 0 && city.toLowerCase() !== locality.toLowerCase()) {
        parts.push(city)
      }
      
      // Always add state
      if (state && state.length > 0) {
        parts.push(state)
      }
      
      const finalName = parts.filter(Boolean).join(', ')
      
      console.log('Extracted location:', { locality, city, state, finalName })
      
      // If we have at least locality and state, return it
      if (finalName && parts.length >= 2) {
        return finalName
      }
      
      // Fallback: Use display_name if available
      if (data.display_name) {
        const displayParts = data.display_name.split(',').map(p => p.trim()).filter(p => p)
        // Filter out generic terms and take first 3 relevant parts
        const relevantParts = displayParts
          .filter(p => {
            const pLower = p.toLowerCase()
            return !pLower.includes('india') && 
                   !pLower.includes('pin code') &&
                   !pLower.includes('postal') &&
                   !pLower.includes('post code') &&
                   p.length > 2
          })
          .slice(0, 3)
        
        if (relevantParts.length >= 2) {
          console.log('Using display_name fallback:', relevantParts.join(', '))
          return relevantParts.join(', ')
        }
      }
      
      return finalName || 'Unknown Location'
      
    } catch (error) {
      console.error('Error fetching location name:', error)
      return 'Unknown Location'
    }
  }


  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      
      // Combine date with time for checkIn
      const checkInDateTime = formData.date && formData.checkIn 
        ? new Date(`${formData.date}T${formData.checkIn}`).toISOString()
        : new Date().toISOString()
      
      // Combine date with time for checkOut (if provided)
      const checkOutDateTime = formData.date && formData.checkOut
        ? new Date(`${formData.date}T${formData.checkOut}`).toISOString()
        : null

      const payload = {
        user: formData.user,
        project: formData.project,
        date: new Date(formData.date).toISOString(),
        checkIn: checkInDateTime,
        checkOut: checkOutDateTime || undefined,
        overtime: formData.overtime ? parseFloat(formData.overtime) : 0,
        lateArrival: formData.lateArrival,
        earlyLeave: formData.earlyLeave,
        status: formData.status,
        notes: formData.notes,
        photo: formData.photo || undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        locationName: formData.locationName || undefined
      }

      const url = editingAttendance
        ? `${API_URL}/attendance/${editingAttendance._id || editingAttendance.id}`
        : `${API_URL}/attendance`
      const method = editingAttendance ? 'PUT' : 'POST'

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
        setShowManualModal(false)
        setEditingAttendance(null)
        resetForm()
        showToast(editingAttendance ? 'Attendance updated successfully! 🎉' : 'Attendance recorded successfully! 🎉', 'success')
        fetchAttendances()
      } else {
        showToast(data.message || `Failed to ${editingAttendance ? 'update' : 'create'} attendance`, 'error')
      }
    } catch (err) {
      showToast('Network error. Please check if backend is running.', 'error')
      console.error('Error submitting attendance:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (attendance) => {
    setOpenMenuId(null)
    setEditingAttendance(attendance)
    
    const checkInDate = attendance.checkIn ? new Date(attendance.checkIn) : new Date()
    const checkOutDate = attendance.checkOut ? new Date(attendance.checkOut) : null
    
    setFormData({
      user: typeof attendance.user === 'object' ? attendance.user._id : attendance.user || '',
      project: typeof attendance.project === 'object' ? attendance.project._id : attendance.project || '',
      date: attendance.date ? new Date(attendance.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      checkIn: checkInDate.toTimeString().slice(0, 5), // HH:MM format
      checkOut: checkOutDate ? checkOutDate.toTimeString().slice(0, 5) : '',
      overtime: attendance.overtime?.toString() || '',
      lateArrival: attendance.lateArrival || false,
      earlyLeave: attendance.earlyLeave || false,
      status: attendance.status || 'present',
      notes: attendance.notes || '',
      photo: attendance.photo || '',
      latitude: attendance.latitude?.toString() || '',
      longitude: attendance.longitude?.toString() || '',
      locationName: attendance.locationName || ''
    })
    setCapturedImage(attendance.photo || null)
    setShowManualModal(true)
  }

  const handleDelete = async () => {
    if (!deletingAttendance) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/attendance/${deletingAttendance._id || deletingAttendance.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        showToast('Attendance deleted successfully! 🎉', 'success')
        setDeletingAttendance(null)
        fetchAttendances()
      } else {
        showToast(data.message || 'Failed to delete attendance', 'error')
      }
    } catch (err) {
      showToast('Network error. Please check if backend is running.', 'error')
      console.error('Delete attendance error:', err)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      showToast('File too large. Maximum size is 10MB', 'error')
      return
    }

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ]

    if (!validTypes.includes(file.type)) {
      showToast('Invalid file type. Please upload XLSX, XLS, or CSV files', 'error')
      return
    }

    setUploadedFile(file)
  }

  const handleExcelUpload = async () => {
    if (!uploadedFile) {
      showToast('Please select a file to upload', 'error')
      return
    }

    setUploadingFile(true)

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('file', uploadedFile)

      const response = await fetch(`${API_URL}/attendance/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (response.ok && data.success) {
        showToast(`Successfully imported ${data.count || 0} attendance records! 🎉`, 'success')
        setShowUploadModal(false)
        setUploadedFile(null)
        fetchAttendances()
      } else {
        showToast(data.message || 'Failed to upload file', 'error')
      }
    } catch (err) {
      showToast('Network error. Please check if backend is running.', 'error')
      console.error('Error uploading file:', err)
    } finally {
      setUploadingFile(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'absent':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'on-leave':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'half-day':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'present': return '🟢'
      case 'absent': return '🔴'
      case 'on-leave': return '🔵'
      case 'half-day': return '🟡'
      default: return ''
    }
  }

  const formatTime = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const selectedUser = users.find(u => u._id === formData.user || u.id === formData.user)
  const selectedProject = projects.find(p => p._id === formData.project || p.id === formData.project)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading attendance...</p>
        </div>
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark mb-2">Attendance</h1>
          <p className="text-gray-500">Track daily attendance and workforce management</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-dark rounded-xl hover:shadow-medium transition-all"
          >
            <FiUpload className="w-4 h-4" />
            <span>Upload Excel</span>
          </button>
          <button
            onClick={() => {
              resetForm()
              setShowManualModal(true)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:shadow-medium transition-all"
          >
            <FiPlus className="w-5 h-5" />
            <span>Add Attendance</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by worker name, project, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div className="relative" ref={filterMenuRef}>
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 text-dark rounded-xl hover:shadow-medium transition-all"
          >
            <FiFilter className="w-4 h-4" />
            <span>Filter</span>
          </button>

          {showFilterMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-large border border-gray-100 p-4 z-50">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                  <select
                    value={filters.project}
                    onChange={(e) => setFilters({ ...filters, project: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Worker</label>
                  <select
                    value={filters.user}
                    onChange={(e) => setFilters({ ...filters, user: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Workers</option>
                    {users.map(user => (
                      <option key={user._id || user.id} value={user._id || user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Status</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="on-leave">On Leave</option>
                    <option value="half-day">Half Day</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <button
                  onClick={() => setFilters({ project: '', user: '', status: '', date: '' })}
                  className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Cards */}
      {filteredAttendances.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-soft">
          <FiUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No attendance records found</p>
          <p className="text-gray-400 text-sm mt-2">Add a new attendance record to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAttendances.map((attendance) => {
            const userName = typeof attendance.user === 'object' ? attendance.user?.name : 'Unknown'
            const userRole = typeof attendance.user === 'object' ? attendance.user?.role || attendance.user?.department : 'Worker'
            const projectName = typeof attendance.project === 'object' ? attendance.project?.name : 'Unknown Project'
            
            return (
              <motion.div
                key={attendance._id || attendance.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-soft hover:shadow-medium transition-all border border-gray-100"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-dark mb-1">{userName}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <FiUser className="w-4 h-4" />
                        {userRole}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiBriefcase className="w-4 h-4" />
                        {projectName}
                      </span>
                    </div>
                  </div>
                  <div className="relative" ref={el => menuRefs.current[attendance._id || attendance.id] = el}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenMenuId(openMenuId === (attendance._id || attendance.id) ? null : (attendance._id || attendance.id))
                      }}
                      className="p-2 rounded-lg hover:bg-light transition-colors"
                    >
                      <FiMoreVertical className="w-5 h-5 text-gray-600" />
                    </button>

                    {openMenuId === (attendance._id || attendance.id) && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-large border border-gray-100 py-2 z-50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleEdit(attendance)
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-left text-dark hover:bg-light transition-colors"
                        >
                          <FiEdit2 className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setDeletingAttendance(attendance)
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

                {/* Status Badge */}
                <div className="mb-4">
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium inline-block border ${getStatusColor(attendance.status)}`}>
                    {getStatusEmoji(attendance.status)} {attendance.status === 'present' ? 'Present' :
                     attendance.status === 'absent' ? 'Absent' :
                     attendance.status === 'on-leave' ? 'On Leave' :
                     attendance.status === 'half-day' ? 'Half Day' : attendance.status}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Date:</span>
                    <span className="text-dark font-medium">{formatDate(attendance.date)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Check In:</span>
                    <span className="text-dark font-medium">{formatTime(attendance.checkIn)}</span>
                  </div>
                  {attendance.checkOut && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Check Out:</span>
                      <span className="text-dark font-medium">{formatTime(attendance.checkOut)}</span>
                    </div>
                  )}
                  {attendance.overtime > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Overtime:</span>
                      <span className="text-dark font-medium">{attendance.overtime} hrs</span>
                    </div>
                  )}
                  {(attendance.lateArrival || attendance.earlyLeave) && (
                    <div className="flex items-center gap-2 text-xs">
                      {attendance.lateArrival && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">Late Arrival</span>
                      )}
                      {attendance.earlyLeave && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">Early Leave</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Proof Section */}
                {(attendance.photo || attendance.locationName) && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <FiCamera className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-medium text-gray-700">Attendance Proof</span>
                    </div>
                    <div className="space-y-2">
                      {attendance.photo && (
                        <div className="rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={attendance.photo}
                            alt="Attendance proof"
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      )}
                      {attendance.locationName && (
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <FiMapPin className="w-3 h-3" />
                          <span>{attendance.locationName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {attendance.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">{attendance.notes}</p>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Manual Entry Modal */}
      <AnimatePresence>
        {showManualModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => {
                setShowManualModal(false)
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
                  <h2 className="text-2xl font-bold text-dark">
                    {editingAttendance ? 'Edit Attendance' : 'Add New Attendance'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowManualModal(false)
                      resetForm()
                    }}
                    className="p-2 rounded-lg hover:bg-light transition-colors"
                  >
                    <FiX className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                {/* Modal Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    {/* Section 1: Worker Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-dark mb-4 flex items-center gap-2">
                        <FiUser className="w-5 h-5 text-primary" />
                        Worker Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Worker Name <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.user}
                            onChange={(e) => {
                              const userId = e.target.value
                              setFormData({ ...formData, user: userId })
                            }}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                            <option value="">Select Worker</option>
                            {users.map(user => (
                              <option key={user._id || user.id} value={user._id || user.id}>
                                {user.name} {user.role ? `(${user.role})` : ''}
                              </option>
                            ))}
                          </select>
                          {selectedUser && (
                            <p className="text-xs text-gray-500 mt-1">
                              Role: {selectedUser.role || selectedUser.department || 'Worker'}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.project}
                            onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          >
                            <option value="">Select Project</option>
                            {projects.map(project => (
                              <option key={project._id || project.id} value={project._id || project.id}>
                                {project.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Attendance Times */}
                    <div>
                      <h3 className="text-lg font-semibold text-dark mb-4 flex items-center gap-2">
                        <FiClock className="w-5 h-5 text-primary" />
                        Attendance Times
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Check In Time <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="time"
                            value={formData.checkIn}
                            onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Check Out Time
                          </label>
                          <input
                            type="time"
                            value={formData.checkOut}
                            onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Overtime (hours)
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            value={formData.overtime}
                            onChange={(e) => setFormData({ ...formData, overtime: e.target.value })}
                            placeholder="0"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>

                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.lateArrival}
                              onChange={(e) => setFormData({ ...formData, lateArrival: e.target.checked })}
                              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm font-medium text-gray-700">Late Arrival?</span>
                          </label>

                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.earlyLeave}
                              onChange={(e) => setFormData({ ...formData, earlyLeave: e.target.checked })}
                              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm font-medium text-gray-700">Early Leave?</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Attendance Proof */}
                    <div>
                      <h3 className="text-lg font-semibold text-dark mb-4 flex items-center gap-2">
                        <FiCamera className="w-5 h-5 text-primary" />
                        Attendance Proof
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-6">
                        {/* Camera Capture */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Photo Capture
                          </label>
                          {!showCamera && !capturedImage && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                {/* Take Photo Button */}
                                <button
                                  type="button"
                                  onClick={startCamera}
                                  className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary/50 transition-colors bg-white"
                                >
                                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <FiCamera className="w-6 h-6 text-blue-600" />
                                  </div>
                                  <span className="text-sm font-medium text-dark">📷 Take Photo</span>
                                </button>

                                {/* Choose from Gallery Button */}
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-primary/50 transition-colors bg-white"
                                >
                                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <FiUpload className="w-6 h-6 text-green-600" />
                                  </div>
                                  <span className="text-sm font-medium text-dark">⬆️ Choose from Gallery</span>
                                </button>
                              </div>
                              
                              {/* Hidden file input */}
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleGallerySelect}
                                className="hidden"
                              />
                              
                              <p className="text-xs text-gray-500 text-center">
                                Capture a new photo or select from your gallery
                              </p>
                            </div>
                          )}

                          {showCamera && (
                            <div className="space-y-3">
                              <div className="relative rounded-xl overflow-hidden border border-gray-300 bg-black">
                                <video
                                  ref={videoRef}
                                  autoPlay
                                  playsInline
                                  className="w-full h-auto max-h-64 object-contain"
                                />
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={capturePhoto}
                                  className="flex-1 px-4 py-2 bg-primary text-white rounded-xl hover:shadow-medium transition-all"
                                >
                                  Capture
                                </button>
                                <button
                                  type="button"
                                  onClick={stopCamera}
                                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}

                          {capturedImage && !showCamera && (
                            <div className="space-y-3">
                              {/* Photo Preview */}
                              <div className="relative rounded-xl overflow-hidden border border-gray-300 bg-gray-900">
                                <img
                                  src={capturedImage}
                                  alt="Captured attendance proof"
                                  className="w-full h-auto max-h-80 object-contain"
                                />
                                <button
                                  type="button"
                                  onClick={removePhoto}
                                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-lg"
                                >
                                  <FiX className="w-4 h-4" />
                                </button>
                              </div>
                              
                              {/* Photo Details Card */}
                              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                                <div className="space-y-2">
                                  {/* Date & Time */}
                                  <div className="flex items-center gap-2 text-white text-sm">
                                    <FiCalendar className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-300">
                                      {new Date().toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                      })}
                                    </span>
                                    <span className="text-gray-500 mx-1">•</span>
                                    <FiClock className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-300">
                                      {new Date().toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                        hour12: true
                                      })}
                                    </span>
                                  </div>
                                  
                                  {/* Location */}
                                  {formData.locationName && (
                                    <div className="flex items-center gap-2 text-white text-sm">
                                      <FiMapPin className="w-4 h-4 text-blue-400" />
                                      <span className="text-gray-300">{formData.locationName}</span>
                                    </div>
                                  )}
                                  
                                  {/* Project */}
                                  {formData.project && (
                                    <div className="flex items-center gap-2 text-white text-sm">
                                      <FiBriefcase className="w-4 h-4 text-purple-400" />
                                      <span className="text-gray-300">
                                        {projects.find(p => (p._id || p.id) === formData.project)?.name || 'No Project'}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {/* Coordinates (small text) */}
                                  {formData.latitude && formData.longitude && (
                                    <div className="flex items-center gap-3 text-xs text-gray-500 pt-1 border-t border-gray-700">
                                      <span>Lat: {parseFloat(formData.latitude).toFixed(6)}</span>
                                      <span>Lng: {parseFloat(formData.longitude).toFixed(6)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          <canvas ref={canvasRef} className="hidden" />
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Attendance Status */}
                    <div>
                      <h3 className="text-lg font-semibold text-dark mb-4 flex items-center gap-2">
                        <FiCheckCircle className="w-5 h-5 text-primary" />
                        Attendance Status
                      </h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          required
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="present">🟢 Present</option>
                          <option value="absent">🔴 Absent</option>
                          <option value="on-leave">🔵 On Leave</option>
                          <option value="half-day">🟡 Half Day</option>
                        </select>
                      </div>
                    </div>

                    {/* Section 5: Notes */}
                    <div>
                      <h3 className="text-lg font-semibold text-dark mb-4 flex items-center gap-2">
                        <FiMessageSquare className="w-5 h-5 text-primary" />
                        Notes
                      </h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Additional Notes
                        </label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="Enter any additional notes or remarks..."
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowManualModal(false)
                        resetForm()
                      }}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 bg-primary text-white rounded-xl hover:shadow-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Saving...' : editingAttendance ? 'Update Attendance' : 'Save Attendance'}
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
                  <h2 className="text-2xl font-bold text-dark">Upload Attendance File</h2>
                  <button
                    onClick={() => {
                      setShowUploadModal(false)
                      setUploadedFile(null)
                    }}
                    className="p-2 rounded-lg hover:bg-light transition-colors"
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
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                        uploadedFile
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-300 hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        {uploadedFile ? (
                          <div className="space-y-2">
                            <FiFile className="w-12 h-12 text-primary mx-auto" />
                            <p className="text-sm font-medium text-dark">{uploadedFile.name}</p>
                            <p className="text-xs text-gray-500">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
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
                      </label>
                    </div>
                  </div>

                  {/* Format Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Expected Format:</h4>
                    <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                      <li>Columns: Worker Name, Project, Date, Check In, Check Out, Status</li>
                      <li>Date format: YYYY-MM-DD or DD/MM/YYYY</li>
                      <li>Time format: HH:MM (24-hour) or HH:MM AM/PM</li>
                      <li>Status: Present, Absent, On Leave, Half Day</li>
                    </ul>
                  </div>

                  {/* Download Template Button */}
                  <button
                    onClick={() => {
                      // Create a simple CSV template
                      const template = 'Worker Name,Project,Date,Check In,Check Out,Status,Notes\nJohn Doe,Project A,2025-11-23,09:00,18:00,Present,Regular attendance\n'
                      const blob = new Blob([template], { type: 'text/csv' })
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = 'attendance_template.csv'
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
                      onClick={handleExcelUpload}
                      disabled={!uploadedFile || uploadingFile}
                      className="px-6 py-3 bg-primary text-white rounded-xl hover:shadow-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
        {deletingAttendance && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setDeletingAttendance(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full"
              >
                <h3 className="text-xl font-bold text-dark mb-2">Delete Attendance</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this attendance record? This action cannot be undone.
                </p>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setDeletingAttendance(null)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
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
      <Toast toasts={toasts} removeToast={removeToast} />
    </motion.div>
  )
}

export default Attendance
