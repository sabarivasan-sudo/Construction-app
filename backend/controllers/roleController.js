import Role from '../models/Role.js'
import User from '../models/User.js'
import Activity from '../models/Activity.js'

export const getRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ name: 1 })

    // Map role names to user role enum values
    const roleNameMap = {
      'admin': 'admin',
      'administrator': 'admin',
      'manager': 'manager',
      'project manager': 'manager',
      'employee': 'employee',
      'site engineer': 'employee',
      'engineer': 'employee',
      'supervisor': 'employee',
      'viewer': 'viewer'
    }

    // Get user counts for each role
    const rolesWithCounts = await Promise.all(
      roles.map(async (role) => {
        const roleNameLower = role.name.toLowerCase()
        const mappedRole = roleNameMap[roleNameLower] || roleNameLower
        
        // Try exact match first, then partial match
        let userCount = await User.countDocuments({ role: mappedRole })
        if (userCount === 0) {
          // Try to find users where role name matches
          const allUsers = await User.find().select('role')
          userCount = allUsers.filter(u => {
            const userRole = u.role?.toLowerCase() || ''
            return userRole === mappedRole || roleNameLower.includes(userRole) || userRole.includes(roleNameLower.split(' ')[0])
          }).length
        }
        
        return {
          ...role.toObject(),
          users: userCount
        }
      })
    )

    res.json({
      success: true,
      count: roles.length,
      data: rolesWithCounts
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id)

    if (!role) {
      return res.status(404).json({ message: 'Role not found' })
    }

    // Map role name to user role enum
    const roleNameMap = {
      'admin': 'admin',
      'administrator': 'admin',
      'manager': 'manager',
      'project manager': 'manager',
      'employee': 'employee',
      'site engineer': 'employee',
      'engineer': 'employee',
      'supervisor': 'employee',
      'viewer': 'viewer'
    }
    const roleNameLower = role.name.toLowerCase()
    const mappedRole = roleNameMap[roleNameLower] || roleNameLower
    
    let userCount = await User.countDocuments({ role: mappedRole })
    if (userCount === 0) {
      const allUsers = await User.find().select('role')
      userCount = allUsers.filter(u => {
        const userRole = u.role?.toLowerCase() || ''
        return userRole === mappedRole || roleNameLower.includes(userRole) || userRole.includes(roleNameLower.split(' ')[0])
      }).length
    }

    res.json({
      success: true,
      data: {
        ...role.toObject(),
        users: userCount
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createRole = async (req, res) => {
  try {
    const role = await Role.create(req.body)

    await Activity.create({
      type: 'user',
      action: 'created',
      message: `Role "${role.name}" created`,
      entityId: role._id,
      entityType: 'Role',
      user: req.user.id
    })

    res.status(201).json({
      success: true,
      data: {
        ...role.toObject(),
        users: 0
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!role) {
      return res.status(404).json({ message: 'Role not found' })
    }

    // Map role name to user role enum
    const roleNameMap = {
      'admin': 'admin',
      'administrator': 'admin',
      'manager': 'manager',
      'project manager': 'manager',
      'employee': 'employee',
      'site engineer': 'employee',
      'engineer': 'employee',
      'supervisor': 'employee',
      'viewer': 'viewer'
    }
    const roleNameLower = role.name.toLowerCase()
    const mappedRole = roleNameMap[roleNameLower] || roleNameLower
    
    let userCount = await User.countDocuments({ role: mappedRole })
    if (userCount === 0) {
      const allUsers = await User.find().select('role')
      userCount = allUsers.filter(u => {
        const userRole = u.role?.toLowerCase() || ''
        return userRole === mappedRole || roleNameLower.includes(userRole) || userRole.includes(roleNameLower.split(' ')[0])
      }).length
    }

    await Activity.create({
      type: 'user',
      action: 'updated',
      message: `Role "${role.name}" updated`,
      entityId: role._id,
      entityType: 'Role',
      user: req.user.id
    })

    res.json({
      success: true,
      data: {
        ...role.toObject(),
        users: userCount
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id)

    if (!role) {
      return res.status(404).json({ message: 'Role not found' })
    }

    // Map role name to user role enum
    const roleNameMap = {
      'admin': 'admin',
      'administrator': 'admin',
      'manager': 'manager',
      'project manager': 'manager',
      'employee': 'employee',
      'site engineer': 'employee',
      'engineer': 'employee',
      'supervisor': 'employee',
      'viewer': 'viewer'
    }
    const roleNameLower = role.name.toLowerCase()
    const mappedRole = roleNameMap[roleNameLower] || roleNameLower
    
    // Check if any users have this role
    let userCount = await User.countDocuments({ role: mappedRole })
    if (userCount === 0) {
      const allUsers = await User.find().select('role')
      userCount = allUsers.filter(u => {
        const userRole = u.role?.toLowerCase() || ''
        return userRole === mappedRole || roleNameLower.includes(userRole) || userRole.includes(roleNameLower.split(' ')[0])
      }).length
    }
    
    if (userCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete role. ${userCount} user(s) are assigned to this role.` 
      })
    }

    await role.deleteOne()

    res.json({
      success: true,
      message: 'Role deleted'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

