import express from 'express'
import Call from '../models/Call.js'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import fetch from 'node-fetch'
import { authenticateToken } from '../middleware/auth.js'
import crypto from 'crypto'
import { callLimiter } from '../middleware/rateLimiter.js'
import vapiService from '../services/vapiService.js'

const router = express.Router()

// Get dashboard stats for authenticated user
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id

    // Use aggregation from model for consistency
    const agg = await Call.getStatsForUser(userId)

    const totalCalls = agg.totalCalls || 0
    const successfulCalls = agg.successfulCalls || 0
    const successRate = totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) : 0

    // Get favorite scenario by name
    const favoriteScenarioAgg = await Call.aggregate([
      { $match: { userId, status: 'ended' } },
      { $group: { _id: '$scenarioName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ])

    const stats = {
      totalCalls,
      successfulCalls,
      // Convert seconds to whole minutes for display
      totalMinutes: Math.round((agg.totalMinutes || 0) / 60),
      avgDuration: Math.round(agg.avgDuration || 0),
      successRate,
      favoriteScenario: favoriteScenarioAgg[0]?._id || null
    }

    res.json({ success: true, stats })
  } catch (error) {
    console.error('Error fetching call stats:', error)
    res.status(500).json({
      success: false,
      message: 'Er ging iets mis bij het ophalen van de statistieken'
    })
  }
})

// Get call history for authenticated user
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 10 } = req.query

    const calls = await Call.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean()

    const totalCalls = await Call.countDocuments({ userId })

    const withPlayback = calls.map((c) => ({
      ...c,
      playbackUrl: (c?.recording?.url || c?.vapiData?.recordingUrl) ? `/api/calls/${c._id}/recording` : null
    }))

    res.json({
      success: true,
      calls: withPlayback,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCalls,
        pages: Math.ceil(totalCalls / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching call history:', error)
    res.status(500).json({
      success: false,
      message: 'Er ging iets mis bij het ophalen van de call historie'
    })
  }
})

// Create new prank call
router.post('/', authenticateToken, callLimiter, async (req, res) => {
  try {
    const { scenarioId, scenarioName, scenarioIcon, targetPhone, targetName, vapiAgentId } = req.body
    const user = req.user
    
    console.log('📞 Creating call with targetName:', targetName)
    
    // Validation
    if (!scenarioId || !targetPhone || !vapiAgentId) {
      return res.status(400).json({
        success: false,
        message: 'Scenario ID, telefoonnummer en agent ID zijn verplicht'
      })
    }
    
    console.log('💰 Credit check - User has:', user.credits, 'credits, totalCalls:', user.stats.totalCalls)
    
    // Check credits (unless it's user's first free call)
    if (user.credits < 1) {
      return res.status(402).json({
        success: false,
        message: 'Onvoldoende credits. Koop credits om door te gaan.'
      })
    }
    
    // Validate phone number
    const validation = vapiService.validatePhoneNumber(targetPhone)
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Ongeldig Nederlands telefoonnummer'
      })
    }
    
    // Make actual VAPI call first to get real call id
    const vapiResult = await vapiService.createCall({
      agentId: vapiAgentId,
      phoneNumber: validation.formatted,
      scenario: { name: scenarioName },
      targetName: targetName?.trim() || null
    })
    
    if (!vapiResult?.success || !vapiResult?.callId) {
      return res.status(500).json({ success: false, message: 'Kon VAPI call niet starten' })
    }

    // Create call record with real VAPI id
    const call = new Call({
      userId: user._id,
      userEmail: user.email,
      vapiCallId: vapiResult.callId,
      targetPhone: targetPhone,
      formattedPhone: validation.formatted,
      scenarioId,
      scenarioName,
      scenarioIcon: scenarioIcon || '🎭',
      vapiAgentId,
      status: 'queued',
      creditsUsed: 1,
      wasFree: false
    })

    await call.save()

    // Track total calls on user profile immediately
    try {
      user.stats.totalCalls = (user.stats.totalCalls || 0) + 1
      await user.save()
    } catch (e) {
      console.warn('Kon user stats.totalCalls niet bijwerken:', e?.message)
    }

    // Deduct 1 credit after successful VAPI start
    console.log('💳 Deducting 1 credit from user (wasFree:', call.wasFree, ')')
    await user.useCredits(1)
    console.log('💰 User credits after deduction:', user.credits)

    // Start monitoring call status
    monitorCallStatus(call._id, vapiResult.callId)
    
    res.status(201).json({
      success: true,
      message: call.wasFree ? 'Gratis call gestart! 🎉' : 'Call gestart!',
      call: {
        id: call._id,
        _id: call._id,
        vapiCallId: call.vapiCallId,
        status: call.status,
        wasFree: call.wasFree
      },
      user: {
        credits: user.credits
      }
    })
    
  } catch (error) {
    console.error('Create call error:', error)
    res.status(500).json({
      success: false,
      message: 'Er ging iets mis bij het starten van de call'
    })
  }
})

// Get user's calls
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, status, scenario } = req.query
    
    let query = { userId: req.user._id }
    
    if (status) query.status = status
    if (scenario) query.scenarioId = scenario
    
    const calls = await Call.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))

    const callsWithPlayback = calls.map((doc) => {
      const c = (typeof doc.toObject === 'function') ? doc.toObject() : doc
      const hasRecording = Boolean(c?.recording?.url || c?.vapiData?.recordingUrl)
      return {
        ...c,
        playbackUrl: hasRecording ? `/api/calls/${c._id}/recording` : null
      }
    })

    res.json({ success: true, calls: callsWithPlayback })
    
  } catch (error) {
    console.error('Get calls error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching calls'
    })
  }
})

// Get call details
router.get('/:callId', authenticateToken, async (req, res) => {
  try {
    const call = await Call.findOne({
      _id: req.params.callId,
      userId: req.user._id
    })
    
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      })
    }
    
    // If call status is active, check VAPI for updates
    if (call.vapiCallId && ['queued', 'ringing', 'in-progress', 'forwarding'].includes(call.status)) {
      try {
        const vapiStatus = await vapiService.getCallStatus(call.vapiCallId)
        
        console.log(`📊 Monitoring call ${req.params.callId}, VAPI status:`, vapiStatus.status)
        // Normalize external status to our enum
        const normalizedStatus = vapiStatus.status === 'completed' ? 'ended' :
                                 vapiStatus.status === 'inProgress' ? 'in-progress' :
                                 vapiStatus.status
        call.status = normalizedStatus
        
        if (normalizedStatus === 'ended') {
          console.log(`🏁 Call ended, processing completion:`, vapiStatus)
          await call.markCompleted(vapiStatus)
        } else {
          await call.save()
        }
      } catch (error) {
        console.error('Error checking VAPI status:', error)
        // Continue with database version if VAPI check fails
      }
    }
    
    res.json({
      success: true,
      call: {
        ...(typeof call.toObject === 'function' ? call.toObject() : call),
        playbackUrl: (call?.recording?.url || call?.vapiData?.recordingUrl) ? `/api/calls/${call._id}/recording` : null
      }
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching call'
    })
  }
})

// Stream or redirect to call recording for playback
router.get('/:callId/recording', async (req, res) => {
  try {
    // Authenticate via header or token query param (for <audio> tag usage)
    let userId = null
    try {
      const authHeader = req.headers.authorization
      const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
      const token = tokenFromHeader || req.query.token
      if (!token) throw new Error('No token')
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      userId = decoded.userId
    } catch (e) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }
    const { callId } = req.params
    let call = null
    
    // Try by internal Mongo _id first (if valid)
    try {
      call = await Call.findOne({ _id: callId, userId })
    } catch (e) {
      // ignore cast error, we'll try vapiCallId next
    }
    
    // Fallback: try by VAPI call id (UUID)
    if (!call) {
      call = await Call.findOne({ vapiCallId: callId, userId })
    }
    
    if (!call) {
      return res.status(404).json({ success: false, message: 'Call niet gevonden' })
    }

    const recordingUrl = call.recording?.url || call.vapiData?.recordingUrl
    if (!recordingUrl) {
      return res.status(404).json({ success: false, message: 'Geen opname beschikbaar' })
    }

    // Update recording analytics
    try {
      call.recording = {
        ...(call.recording || {}),
        isAvailable: true,
        url: recordingUrl,
        downloadCount: (call.recording?.downloadCount || 0) + 1,
        lastDownloaded: new Date()
      }
      await call.save()
    } catch (e) {
      console.warn('Kon recording statistieken niet opslaan:', e?.message)
    }

    // Proxy the audio stream to avoid cross-origin redirect issues
    const upstream = await fetch(recordingUrl)
    if (!upstream.ok) {
      return res.status(502).json({ success: false, message: 'Opname bron niet beschikbaar' })
    }

    // Pass through content type and length if available
    const contentType = upstream.headers.get('content-type') || 'audio/mpeg'
    const contentLength = upstream.headers.get('content-length')
    res.setHeader('Content-Type', contentType)
    if (contentLength) res.setHeader('Content-Length', contentLength)
    res.setHeader('Cache-Control', 'private, max-age=3600')
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')

    upstream.body.pipe(res)
    upstream.body.on('error', () => {
      try { res.end() } catch {}
    })
    return
  } catch (error) {
    console.error('Error fetching recording:', error)
    res.status(500).json({ success: false, message: 'Kon opname niet ophalen' })
  }
})

// Direct endpoint for VAPI call id playback
router.get('/vapi/:vapiCallId/recording', async (req, res) => {
  try {
    // Authenticate via header or token query param
    let userId = null
    try {
      const authHeader = req.headers.authorization
      const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
      const token = tokenFromHeader || req.query.token
      if (!token) throw new Error('No token')
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      userId = decoded.userId
    } catch (e) {
      return res.status(401).json({ success: false, message: 'Unauthorized' })
    }

    const call = await Call.findOne({ vapiCallId: req.params.vapiCallId, userId })
    if (!call) return res.status(404).json({ success: false, message: 'Call niet gevonden' })

    const recordingUrl = call.recording?.url || call.vapiData?.recordingUrl
    if (!recordingUrl) return res.status(404).json({ success: false, message: 'Geen opname beschikbaar' })

    try {
      call.recording = {
        ...(call.recording || {}),
        isAvailable: true,
        url: recordingUrl,
        downloadCount: (call.recording?.downloadCount || 0) + 1,
        lastDownloaded: new Date()
      }
      await call.save()
    } catch {}

    const upstream = await fetch(recordingUrl)
    if (!upstream.ok) return res.status(502).json({ success: false, message: 'Opname bron niet beschikbaar' })

    const contentType = upstream.headers.get('content-type') || 'audio/mpeg'
    const contentLength = upstream.headers.get('content-length')
    res.setHeader('Content-Type', contentType)
    if (contentLength) res.setHeader('Content-Length', contentLength)
    res.setHeader('Cache-Control', 'private, max-age=3600')
    upstream.body.pipe(res)
    upstream.body.on('error', () => { try { res.end() } catch {} })
    return
  } catch (error) {
    console.error('Error fetching recording by VAPI id:', error)
    res.status(500).json({ success: false, message: 'Kon opname niet ophalen' })
  }
})

// End active call
router.post('/:callId/end', authenticateToken, async (req, res) => {
  try {
    const call = await Call.findOne({
      _id: req.params.callId,
      userId: req.user._id
    })
    
    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      })
    }
    
    // End VAPI call
    if (call.vapiCallId) {
      await vapiService.hangupCall(call.vapiCallId)
    }
    
    call.status = 'ended'
    call.endedAt = new Date()
    await call.save()
    
    res.json({
      success: true,
      message: 'Call ended'
    })
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error ending call'
    })
  }
})

// Monitor call status (background function)
async function monitorCallStatus(callId, vapiCallId) {
  const checkStatus = async () => {
    try {
      const call = await Call.findById(callId)
      if (!call || call.status === 'ended') return
      
      const vapiStatus = await vapiService.getCallStatus(vapiCallId)
      
      console.log(`📊 Monitoring call ${callId}, VAPI status:`, vapiStatus.status)
      // Normalize external status to our enum
      const normalizedStatus = vapiStatus.status === 'completed' ? 'ended' :
                               vapiStatus.status === 'inProgress' ? 'in-progress' :
                               vapiStatus.status
      call.status = normalizedStatus
      if (normalizedStatus === 'ended') {
        console.log(`🏁 Call ended, processing completion:`, vapiStatus)
        await call.markCompleted(vapiStatus)
        return // Stop monitoring
      }
      
      await call.save()
      
      // Continue monitoring if still active
      if (['queued', 'ringing', 'in-progress'].includes(normalizedStatus)) {
        setTimeout(checkStatus, 2000)
      }
      
    } catch (error) {
      console.error('Error monitoring call status:', error)
      setTimeout(checkStatus, 5000) // Retry after 5 seconds
    }
  }
  
  // Start monitoring after 1 second
  setTimeout(checkStatus, 1000)
}

// Public demo audio route - get VAPI call recording for demo scenarios
router.get('/demo/:vapiCallId/audio', async (req, res) => {
  try {
    const { vapiCallId } = req.params
    
    // Get call data from VAPI API
    const callData = await vapiService.getCallStatus(vapiCallId)
    
    if (!callData || !callData.recordingUrl) {
      return res.status(404).json({ 
        success: false, 
        message: 'Demo audio niet beschikbaar' 
      })
    }
    
    // Stream the recording URL directly
    const upstream = await fetch(callData.recordingUrl)
    if (!upstream.ok) {
      return res.status(502).json({ 
        success: false, 
        message: 'Demo audio bron niet beschikbaar' 
      })
    }
    
    // Set appropriate headers
    const contentType = upstream.headers.get('content-type') || 'audio/mpeg'
    const contentLength = upstream.headers.get('content-length')
    res.setHeader('Content-Type', contentType)
    if (contentLength) res.setHeader('Content-Length', contentLength)
    res.setHeader('Cache-Control', 'public, max-age=3600') // 1 hour cache for demos
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    
    // Pipe the audio stream
    upstream.body.pipe(res)
    upstream.body.on('error', () => { 
      try { res.end() } catch {} 
    })
    
  } catch (error) {
    console.error('Demo audio error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Kon demo audio niet ophalen' 
    })
  }
})

export default router
// Create or fetch a public share link for a call recording
router.post('/:callId/share', authenticateToken, async (req, res) => {
  try {
    const { platform } = req.body || {}
    const call = await Call.findOne({ _id: req.params.callId, userId: req.user._id })
    if (!call) return res.status(404).json({ success: false, message: 'Call niet gevonden' })
    const recordingUrl = call.recording?.url || call.vapiData?.recordingUrl
    if (!recordingUrl) return res.status(400).json({ success: false, message: 'Geen opname beschikbaar' })

    if (!call.recording) call.recording = {}
    if (!call.recording.shareId) {
      call.recording.shareId = crypto.randomBytes(8).toString('hex')
    }
    call.recording.isAvailable = true
    call.recording.url = recordingUrl
    call.recording.isPublic = true
    call.recording.allowSharing = true
    call.recording.shareCount = (call.recording.shareCount || 0) + 1
    if (platform) {
      call.recording.shareUrls = call.recording.shareUrls || []
      call.recording.shareUrls.push({ platform, sharedAt: new Date(), clicks: 0 })
    }
    await call.save()

    const base = process.env.NODE_ENV === 'production' ? 'https://prankcall.nl' : 'http://localhost:5173'
    const publicUrl = `${base}/r/${call.recording.shareId}`
    return res.json({ success: true, url: publicUrl, shareId: call.recording.shareId })
  } catch (error) {
    console.error('Create share link error:', error)
    res.status(500).json({ success: false, message: 'Kon share link niet maken' })
  }
})

// Public recording metadata (no auth)
router.get('/public/:shareId', async (req, res) => {
  try {
    const call = await Call.findOne({ 'recording.shareId': req.params.shareId, 'recording.isPublic': true })
    if (!call) return res.status(404).json({ success: false, message: 'Opname niet gevonden' })
    const playbackUrl = `/api/calls/public/${req.params.shareId}/stream`
    return res.json({ success: true, call: {
      scenarioName: call.scenarioName,
      scenarioIcon: call.scenarioIcon,
      duration: call.duration,
      createdAt: call.createdAt,
      playbackUrl
    }})
  } catch (error) {
    console.error('Get public recording error:', error)
    res.status(500).json({ success: false, message: 'Kon publieke opname niet ophalen' })
  }
})

// Public stream (no auth)
router.get('/public/:shareId/stream', async (req, res) => {
  try {
    const call = await Call.findOne({ 'recording.shareId': req.params.shareId, 'recording.isPublic': true })
    if (!call) return res.status(404).json({ success: false, message: 'Opname niet gevonden' })
    const recordingUrl = call.recording?.url || call.vapiData?.recordingUrl
    if (!recordingUrl) return res.status(404).json({ success: false, message: 'Geen opname beschikbaar' })

    const upstream = await fetch(recordingUrl)
    if (!upstream.ok) return res.status(502).json({ success: false, message: 'Opname bron niet beschikbaar' })

    const contentType = upstream.headers.get('content-type') || 'audio/mpeg'
    const contentLength = upstream.headers.get('content-length')
    res.setHeader('Content-Type', contentType)
    if (contentLength) res.setHeader('Content-Length', contentLength)
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    upstream.body.pipe(res)
    upstream.body.on('error', () => { try { res.end() } catch {} })
  } catch (error) {
    console.error('Public stream error:', error)
    res.status(500).json({ success: false, message: 'Kon publieke stream niet starten' })
  }
})

// Public demo audio route - get VAPI call recording for demo scenarios
router.get('/demo/:vapiCallId/audio', async (req, res) => {
  try {
    const { vapiCallId } = req.params
    
    // Get call data from VAPI API
    const callData = await vapiService.getCallStatus(vapiCallId)
    
    if (!callData || !callData.recordingUrl) {
      return res.status(404).json({ 
        success: false, 
        message: 'Demo audio niet beschikbaar' 
      })
    }
    
    // Stream the recording URL directly
    const upstream = await fetch(callData.recordingUrl)
    if (!upstream.ok) {
      return res.status(502).json({ 
        success: false, 
        message: 'Demo audio bron niet beschikbaar' 
      })
    }
    
    // Set appropriate headers
    const contentType = upstream.headers.get('content-type') || 'audio/mpeg'
    const contentLength = upstream.headers.get('content-length')
    res.setHeader('Content-Type', contentType)
    if (contentLength) res.setHeader('Content-Length', contentLength)
    res.setHeader('Cache-Control', 'public, max-age=3600') // 1 hour cache for demos
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    
    // Pipe the audio stream
    upstream.body.pipe(res)
    upstream.body.on('error', () => { 
      try { res.end() } catch {} 
    })
    
  } catch (error) {
    console.error('Demo audio error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Kon demo audio niet ophalen' 
    })
  }
})
