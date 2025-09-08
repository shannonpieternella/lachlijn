import express from 'express'
import User from '../models/User.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    })
  }
})

// Update user profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { name, phone, settings } = req.body
    
    const user = req.user
    
    if (name) user.name = name.trim()
    if (phone !== undefined) user.phone = phone
    if (settings) user.settings = { ...user.settings, ...settings }
    
    await user.save()
    
    res.json({
      success: true,
      message: 'Profiel bijgewerkt',
      user: user.toJSON()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    })
  }
})

// Get referral stats
router.get('/referral/stats', authenticateToken, async (req, res) => {
  try {
    const stats = req.user.getReferralStats()
    
    res.json({
      success: true,
      stats
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching referral stats'
    })
  }
})

export default router