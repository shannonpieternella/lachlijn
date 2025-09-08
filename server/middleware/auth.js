import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// JWT verificatie middleware
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : null

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      })
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password')
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      })
    }

    // Add user to request
    req.user = user
    next()
    
  } catch (error) {
    console.error('Auth middleware error:', error.message)
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      })
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Authentication error'
    })
  }
}

// Admin verificatie middleware
export const requireAdmin = (req, res, next) => {
  const adminPassword = req.headers['x-admin-password']
  
  if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    })
  }
  
  next()
}

// JWT token genereren
export const generateToken = (userId) => {
  return jwt.sign(
    { userId, iat: Math.floor(Date.now() / 1000) },
    process.env.JWT_SECRET,
    { 
      expiresIn: '7d',
      issuer: 'prankcall.nl',
      audience: 'prankcall-users'
    }
  )
}

// Optionele authenticatie (voor publieke endpoints die user info willen)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : null

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.userId).select('-password')
      
      if (user && user.isActive) {
        req.user = user
      }
    }
    
    next()
  } catch (error) {
    // Ignore auth errors for optional auth
    next()
  }
}