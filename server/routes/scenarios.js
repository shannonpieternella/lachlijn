import express from 'express'
import PrankScenario from '../models/PrankScenario.js'
import { optionalAuth } from '../middleware/auth.js'

const router = express.Router()

// Get all active scenarios
router.get('/', optionalAuth, async (req, res) => {
  try {
    const scenarios = await PrankScenario.getActiveScenarios()
    
    res.json({
      success: true,
      scenarios
    })
    
  } catch (error) {
    console.error('Get scenarios error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scenarios'
    })
  }
})

export default router