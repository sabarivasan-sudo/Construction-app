import Attendance from '../models/Attendance.js'
import Activity from '../models/Activity.js'
import mongoose from 'mongoose'

export const getAttendances = async (req, res) => {
  try {
    const { user, project, date } = req.query
    const filter = {}

    // Get current user to check their assigned projects
    const User = (await import('../models/User.js')).default
    const currentUser = await User.findById(req.user.id).select('role projects')
    
    // If user is not admin, filter by assigned projects
    if (currentUser.role !== 'admin') {
      if (currentUser.projects && currentUser.projects.length > 0) {
        // Convert to ObjectIds if they're strings
        const projectIds = currentUser.projects.map(p => 
          typeof p === 'string' ? p : p._id || p
        )
        filter.project = { $in: projectIds }
      } else {
        // If user has no assigned projects, return empty array
        return res.json({
          success: true,
          count: 0,
          data: []
        })
      }
    }

    if (user) filter.user = user
    // If project query param is provided, further filter (must be within user's assigned projects)
    if (project) {
      if (currentUser.role === 'admin' || (currentUser.projects && currentUser.projects.some(p => {
        const pId = typeof p === 'string' ? p : p._id || p
        return pId.toString() === project.toString()
      }))) {
        filter.project = project
      } else {
        // User trying to access project they don't have access to
        return res.json({
          success: true,
          count: 0,
          data: []
        })
      }
    }
    if (date) {
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)
      filter.date = { $gte: startDate, $lte: endDate }
    }

    const attendances = await Attendance.find(filter)
      .populate('user', 'name email role department')
      .populate('project', 'name')
      .sort({ date: -1 })

    res.json({
      success: true,
      count: attendances.length,
      data: attendances
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.create(req.body)
    
    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('user', 'name email role department')
      .populate('project', 'name')

    await Activity.create({
      type: 'attendance',
      action: 'created',
      message: `Attendance recorded for ${attendance.date}`,
      entityId: attendance._id,
      entityType: 'Attendance',
      project: attendance.project,
      user: req.user.id
    })

    res.status(201).json({
      success: true,
      data: populatedAttendance
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('user', 'name email')
      .populate('project', 'name')

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance not found' })
    }

    // Calculate work hours if checkOut is provided
    if (req.body.checkOut && attendance.checkIn) {
      const hours = (new Date(req.body.checkOut) - new Date(attendance.checkIn)) / (1000 * 60 * 60)
      attendance.workHours = Math.round(hours * 100) / 100
      await attendance.save()
    }

    res.json({
      success: true,
      data: attendance
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id)

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance not found' })
    }

    await Activity.create({
      type: 'attendance',
      action: 'deleted',
      message: `Attendance deleted for ${attendance.date}`,
      entityId: attendance._id,
      entityType: 'Attendance',
      project: attendance.project,
      user: req.user.id
    })

    res.json({
      success: true,
      message: 'Attendance deleted successfully'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const uploadAttendance = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const User = (await import('../models/User.js')).default
    const Project = (await import('../models/Project.js')).default
    
    // Get current user to check their assigned projects
    const currentUser = await User.findById(req.user.id).select('role projects')
    
    // Get user's assigned projects (or all projects if admin)
    let projectIds = []
    if (currentUser.role !== 'admin') {
      if (currentUser.projects && currentUser.projects.length > 0) {
        projectIds = currentUser.projects.map(p => 
          typeof p === 'string' ? p : p._id || p
        )
      } else {
        return res.status(403).json({ 
          message: 'No projects assigned. Please contact administrator.' 
        })
      }
    } else {
      const allProjects = await Project.find({}).select('_id')
      projectIds = allProjects.map(p => p._id)
    }
    
    // Use first project if available, otherwise require project selection
    const defaultProject = projectIds.length > 0 ? projectIds[0] : null
    if (!defaultProject) {
      return res.status(400).json({ 
        message: 'No projects available. Please create a project first.' 
      })
    }

    const file = req.file
    const fileContent = file.buffer.toString('utf-8')
    
    // Parse CSV content
    const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line)
    
    // Helper function to parse CSV line
    const parseCSVLine = (line) => {
      const values = []
      let currentValue = ''
      let inQuotes = false
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim().replace(/^"|"$/g, ''))
          currentValue = ''
        } else {
          currentValue += char
        }
      }
      values.push(currentValue.trim().replace(/^"|"$/g, '')) // Add last value
      return values
    }
    
    // First, try to parse User List section to create a mapping
    const userIdMapping = {} // Maps CSV User ID to MongoDB User ObjectId
    const userListInfo = [] // Store user list info for response
    let userListStartIndex = -1
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('"User List"') || lines[i].includes('User List')) {
        userListStartIndex = i + 1 // Next line should be header
        break
      }
    }
    
    // If User List section exists, parse it to create mapping
    if (userListStartIndex !== -1) {
      const userHeaderLine = lines[userListStartIndex]
      const userHeaders = parseCSVLine(userHeaderLine)
      const uidIndex = userHeaders.findIndex(h => h.toLowerCase() === 'uid')
      const idIndex = userHeaders.findIndex(h => h.toLowerCase() === 'id')
      const nameIndex = userHeaders.findIndex(h => h.toLowerCase() === 'name')
      
      if (idIndex !== -1 && nameIndex !== -1) {
        // Parse user list to create mapping
        for (let i = userListStartIndex + 1; i < lines.length; i++) {
          const line = lines[i]
          if (!line || line.trim() === '' || line.includes('Attendance Logs')) break
          
          const values = parseCSVLine(line)
          if (values.length <= Math.max(idIndex, nameIndex)) continue
          
          const csvUserId = values[idIndex]?.trim()
          let userName = values[nameIndex]?.trim()
          
          if (csvUserId && userName) {
            // Extract actual name - remove ID prefix if present (e.g., "4 Saravanan" -> "Saravanan")
            // The name might be in format "ID Name" or just "Name"
            const nameParts = userName.split(/\s+/)
            let actualName = userName
            
            // If first part is a number and matches the ID, remove it
            if (nameParts.length > 1 && /^\d+$/.test(nameParts[0])) {
              actualName = nameParts.slice(1).join(' ').trim()
            }
            
            // Try multiple matching strategies
            let user = null
            
            // Strategy 1: Match by exact name (without ID prefix)
            if (actualName) {
              user = await User.findOne({ 
                name: { $regex: new RegExp(`^${actualName}$`, 'i') }
              })
            }
            
            // Strategy 2: Match by full name (with ID prefix)
            if (!user && userName) {
              user = await User.findOne({ 
                name: { $regex: new RegExp(`^${userName}$`, 'i') }
              })
            }
            
            // Strategy 3: Match by partial name (contains)
            if (!user && actualName) {
              user = await User.findOne({ 
                name: { $regex: new RegExp(actualName, 'i') }
              })
            }
            
            if (user) {
              userIdMapping[csvUserId] = user._id.toString()
              userListInfo.push({
                csvId: csvUserId,
                csvName: userName,
                actualName: actualName,
                matchedUserId: user._id.toString(),
                matchedUserName: user.name,
                status: 'matched'
              })
            } else {
              // Auto-create user if not found (for workers)
              try {
                // Generate a unique email for the worker
                const emailBase = actualName.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '')
                let workerEmail = `${emailBase}@worker.local`
                let emailCounter = 1
                
                // Ensure email is unique
                while (await User.findOne({ email: workerEmail })) {
                  workerEmail = `${emailBase}${emailCounter}@worker.local`
                  emailCounter++
                }
                
                // Create worker user with default password
                const newUser = await User.create({
                  name: actualName || userName,
                  email: workerEmail,
                  password: 'worker123', // Default password - workers can change later if needed
                  role: 'employee',
                  department: 'Workers',
                  isActive: true
                })
                
                // Assign user to the project
                if (defaultProject) {
                  if (!newUser.projects) {
                    newUser.projects = []
                  }
                  if (!newUser.projects.includes(defaultProject)) {
                    newUser.projects.push(defaultProject)
                    await newUser.save()
                  }
                }
                
                userIdMapping[csvUserId] = newUser._id.toString()
                userListInfo.push({
                  csvId: csvUserId,
                  csvName: userName,
                  actualName: actualName,
                  matchedUserId: newUser._id.toString(),
                  matchedUserName: newUser.name,
                  status: 'created'
                })
              } catch (createError) {
                // If creation fails, continue
                userListInfo.push({
                  csvId: csvUserId,
                  csvName: userName,
                  actualName: actualName,
                  status: 'creation_failed',
                  error: createError.message
                })
              }
            }
          }
        }
      }
    }
    
    // Find the "Attendance Logs" section
    let attendanceLogsStartIndex = -1
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('"Attendance Logs"') || lines[i].includes('Attendance Logs')) {
        attendanceLogsStartIndex = i + 1 // Next line should be header
        break
      }
    }
    
    if (attendanceLogsStartIndex === -1) {
      return res.status(400).json({ 
        message: 'Could not find "Attendance Logs" section in the file' 
      })
    }
    
    // Parse header
    const headerLine = lines[attendanceLogsStartIndex]
    const headers = parseCSVLine(headerLine)
    
    // Find column indices
    const recordIdIndex = headers.findIndex(h => h.toLowerCase().includes('record id'))
    const userIdIndex = headers.findIndex(h => h.toLowerCase().includes('user id'))
    const timestampIndex = headers.findIndex(h => h.toLowerCase().includes('timestamp'))
    const statusIndex = headers.findIndex(h => h.toLowerCase().includes('status'))
    
    if (userIdIndex === -1 || timestampIndex === -1) {
      return res.status(400).json({ 
        message: 'Required columns not found. Expected: User ID, Timestamp' 
      })
    }
    
    // Parse attendance records
    const attendanceRecords = []
    const errors = []
    
    for (let i = attendanceLogsStartIndex + 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line || line.trim() === '') continue
      
      const values = parseCSVLine(line)
      
      if (values.length <= Math.max(userIdIndex, timestampIndex)) continue
      
      const csvUserId = values[userIdIndex]?.trim()
      const timestampStr = values[timestampIndex]?.trim()
      
      if (!csvUserId || !timestampStr) continue
      
      try {
        // Try to find user using the mapping first
        let user = null
        const mappedUserId = userIdMapping[csvUserId]
        
        if (mappedUserId) {
          user = await User.findById(mappedUserId)
        }
        
        // If not found in mapping, try direct ObjectId match
        if (!user && mongoose.Types.ObjectId.isValid(csvUserId)) {
          user = await User.findById(csvUserId)
        }
        
        // If still not found, try sequential matching (fallback)
        if (!user) {
          try {
            const userIdNum = parseInt(csvUserId)
            if (!isNaN(userIdNum)) {
              const allUsers = await User.find({}).sort({ createdAt: 1 })
              if (userIdNum > 0 && userIdNum <= allUsers.length) {
                user = allUsers[userIdNum - 1] // 1-indexed
              }
            }
          } catch (e) {
            // Ignore error
          }
        }
        
        if (!user) {
          // Try to get from mapping (might have been auto-created)
          const mappedUserId = userIdMapping[csvUserId]
          if (mappedUserId) {
            user = await User.findById(mappedUserId)
          }
        }
        
        if (!user) {
          errors.push(`User with ID ${csvUserId} could not be found or created.`)
          continue
        }
        
        // Parse timestamp - handle format "2025-07-31 16:15:43"
        let timestamp = null
        try {
          // Try parsing the timestamp string directly
          timestamp = new Date(timestampStr.replace(/"/g, ''))
          
          // If parsing fails, try alternative formats
          if (isNaN(timestamp.getTime())) {
            // Try parsing as ISO format or other common formats
            timestamp = new Date(timestampStr.replace(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/, '$1-$2-$3T$4:$5:$6'))
          }
          
          if (isNaN(timestamp.getTime())) {
            errors.push(`Invalid timestamp format: ${timestampStr}`)
            continue
          }
        } catch (parseError) {
          errors.push(`Error parsing timestamp: ${timestampStr} - ${parseError.message}`)
          continue
        }
        
        // Extract date (without time for date field) - use start of day
        const dateOnly = new Date(timestamp)
        dateOnly.setHours(0, 0, 0, 0)
        
        // Check if attendance already exists for this user and date
        let attendance = await Attendance.findOne({
          user: user._id,
          date: dateOnly
        })
        
        if (attendance) {
          // Update check-in/check-out times
          // Check-in should be the earliest timestamp of the day
          if (!attendance.checkIn || timestamp < attendance.checkIn) {
            attendance.checkIn = new Date(timestamp)
          }
          // Check-out should be the latest timestamp of the day
          if (!attendance.checkOut || timestamp > attendance.checkOut) {
            attendance.checkOut = new Date(timestamp)
          }
          
          // Calculate work hours
          if (attendance.checkIn && attendance.checkOut) {
            const hours = (attendance.checkOut - attendance.checkIn) / (1000 * 60 * 60)
            attendance.workHours = Math.round(hours * 100) / 100
          }
          
          await attendance.save()
          
          // Only add to records if not already added (avoid duplicates)
          if (!attendanceRecords.find(r => r._id.toString() === attendance._id.toString())) {
            attendanceRecords.push(attendance)
          }
        } else {
          // Create new attendance record
          // For first entry, set both checkIn and checkOut to the same time
          // Subsequent entries will update checkOut
          attendance = await Attendance.create({
            user: user._id,
            project: defaultProject,
            date: dateOnly,
            checkIn: new Date(timestamp),
            checkOut: new Date(timestamp), // Initially same as checkIn, will be updated if more entries exist
            status: 'present',
            workHours: 0
          })
          
          attendanceRecords.push(attendance)
        }
      } catch (error) {
        errors.push(`Error processing record: ${error.message}`)
      }
    }
    
    // Create activity log
    if (attendanceRecords.length > 0) {
      await Activity.create({
        type: 'attendance',
        action: 'created',
        message: `${attendanceRecords.length} attendance records uploaded from Excel`,
        entityId: attendanceRecords[0]._id, // Use first record's ID as entityId
        entityType: 'Attendance',
        project: defaultProject,
        user: req.user.id
      })
    }
    
    // Populate user and project info
    const populatedRecords = await Attendance.find({
      _id: { $in: attendanceRecords.map(r => r._id) }
    })
      .populate('user', 'name email role department')
      .populate('project', 'name')
    
    res.json({
      success: true,
      message: `Successfully processed ${attendanceRecords.length} attendance record(s)`,
      count: attendanceRecords.length,
      data: populatedRecords,
      userListInfo: userListInfo, // Include user mapping info
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

