import express from 'express'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// VAPI API configuration
const VAPI_BASE_URL = 'https://api.vapi.ai'
const VAPI_API_KEY = process.env.VAPI_API_KEY

// Helper function for VAPI API calls
async function makeVapiRequest(endpoint, options = {}) {
  const url = `${VAPI_BASE_URL}${endpoint}`
  
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${VAPI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    ...options,
  }

  if (options.headers) {
    defaultOptions.headers = {
      ...defaultOptions.headers,
      ...options.headers,
    }
  }

  try {
    console.log('VAPI Request:', url, defaultOptions.method)
    const response = await fetch(url, defaultOptions)
    
    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`VAPI API Error: ${response.status} - ${errorData}`)
    }

    const data = await response.json()
    console.log('VAPI Response received, data length:', Array.isArray(data) ? data.length : 'not array')
    return data
    
  } catch (error) {
    console.error('VAPI Service Error:', error)
    throw error
  }
}

// Get all VAPI assistants/agents
router.get('/agents', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching VAPI agents via backend...')
    const response = await makeVapiRequest('/assistant')
    
    // VAPI returns either array directly or object with data property
    const agents = response.data || response || []
    
    console.log('Fetched agents:', agents.length, 'items')
    
    res.json({
      success: true,
      agents: agents
    })
    
  } catch (error) {
    console.error('Error fetching VAPI agents:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch VAPI agents: ' + error.message
    })
  }
})

// Create new VAPI agent
router.post('/agents', authenticateToken, async (req, res) => {
  try {
    const agentData = req.body
    console.log('Creating VAPI agent:', agentData.name)
    
    const response = await makeVapiRequest('/assistant', {
      method: 'POST',
      body: JSON.stringify(agentData)
    })
    
    console.log('Agent created successfully')
    
    res.json({
      success: true,
      agent: response
    })
    
  } catch (error) {
    console.error('Error creating VAPI agent:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create VAPI agent: ' + error.message
    })
  }
})

// Update VAPI agent
router.put('/agents/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const agentData = req.body
    console.log('Updating VAPI agent:', id)
    
    const response = await makeVapiRequest(`/assistant/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(agentData)
    })
    
    console.log('Agent updated successfully')
    
    res.json({
      success: true,
      agent: response
    })
    
  } catch (error) {
    console.error('Error updating VAPI agent:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update VAPI agent: ' + error.message
    })
  }
})

// Delete VAPI agent
router.delete('/agents/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    console.log('Deleting VAPI agent:', id)
    
    await makeVapiRequest(`/assistant/${id}`, {
      method: 'DELETE'
    })
    
    console.log('Agent deleted successfully')
    
    res.json({
      success: true,
      message: 'Agent deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting VAPI agent:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete VAPI agent: ' + error.message
    })
  }
})

// Test VAPI connection
router.get('/test', authenticateToken, async (req, res) => {
  try {
    console.log('Testing VAPI connection...')
    await makeVapiRequest('/assistant')
    
    res.json({
      success: true,
      message: 'VAPI connection successful'
    })
    
  } catch (error) {
    console.error('VAPI connection test failed:', error)
    res.status(500).json({
      success: false,
      message: 'VAPI connection failed: ' + error.message
    })
  }
})

export default router