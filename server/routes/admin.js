import express from 'express'
import PrankScenario from '../models/PrankScenario.js'
import User from '../models/User.js'
import Call from '../models/Call.js'
import { requireAdmin } from '../middleware/auth.js'
import { adminLimiter } from '../middleware/rateLimiter.js'
import vapiService from '../services/vapiService.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Utility to save a base64 data URL image to public/uploads and return relative URL
async function saveDataUrlImage(dataUrl, subdir = 'scenarios') {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    throw new Error('Invalid image data')
  }

  const match = dataUrl.match(/^data:(image\/(png|jpeg|jpg|webp));base64,(.+)$/i)
  if (!match) {
    throw new Error('Unsupported image format')
  }

  const mime = match[1]
  const ext = mime.split('/')[1] === 'jpeg' ? 'jpg' : mime.split('/')[1]
  const base64 = match[3]
  const buffer = Buffer.from(base64, 'base64')

  // Basic size guard: max ~8MB
  if (buffer.length > 8 * 1024 * 1024) {
    throw new Error('Image too large (max 8MB)')
  }

  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', subdir)
  await fs.promises.mkdir(uploadsDir, { recursive: true })

  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
  const filePath = path.join(uploadsDir, filename)
  await fs.promises.writeFile(filePath, buffer)

  const publicUrl = `/uploads/${subdir}/${filename}`
  return publicUrl
}

// Apply admin auth and rate limiting
router.use(adminLimiter)
router.use(requireAdmin)

// Get VAPI agents
router.get('/agents', async (req, res) => {
  try {
    const agents = await vapiService.getAgents()
    
    res.json({
      success: true,
      agents
    })
    
  } catch (error) {
    console.error('Admin get agents error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching VAPI agents'
    })
  }
})

// Upload scenario image (base64 data URL)
router.post('/upload/image', async (req, res) => {
  try {
    const { dataUrl } = req.body || {}
    if (!dataUrl) {
      return res.status(400).json({ success: false, message: 'dataUrl is required' })
    }

    const relUrl = await saveDataUrlImage(dataUrl, 'scenarios')
    const base = `${req.protocol}://${req.get('host')}`
    const absUrl = `${base}${relUrl}`
    res.json({ success: true, url: absUrl, path: relUrl })
  } catch (error) {
    console.error('Admin upload image error:', error)
    res.status(400).json({ success: false, message: error.message || 'Upload failed' })
  }
})

// Get all scenarios for admin
router.get('/scenarios', async (req, res) => {
  try {
    const scenarios = await PrankScenario.find({})
      .sort({ popularity: -1 })
    
    res.json({
      success: true,
      scenarios
    })
    
  } catch (error) {
    console.error('Admin get scenarios error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching scenarios'
    })
  }
})

// Create new scenario
router.post('/scenarios', async (req, res) => {
  try {
    console.log('🚀 Creating new scenario with data:', req.body)
    
    const scenario = new PrankScenario(req.body)
    const savedScenario = await scenario.save()
    
    console.log('✅ Scenario saved successfully:', savedScenario.id)
    
    res.status(201).json({
      success: true,
      message: 'Scenario created',
      scenario: savedScenario
    })
    
  } catch (error) {
    console.error('❌ Admin create scenario error:', error.message)
    console.error('❌ Validation errors:', error.errors)
    res.status(400).json({
      success: false,
      message: 'Error creating scenario',
      error: error.message,
      validationErrors: error.errors
    })
  }
})

// Get VAPI audio file
router.get('/audio/:audioId', async (req, res) => {
  try {
    const { audioId } = req.params
    
    if (!vapiService.isVapiAudioId(audioId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid VAPI audio ID format'
      })
    }
    
    const audioUrl = await vapiService.getAudioUrl(audioId)
    
    if (!audioUrl) {
      return res.status(404).json({
        success: false,
        message: 'Audio file not found in VAPI'
      })
    }
    
    res.json({
      success: true,
      audioId,
      audioUrl
    })
    
  } catch (error) {
    console.error('Admin get VAPI audio error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching VAPI audio'
    })
  }
})

// Update scenario
router.put('/scenarios/:id', async (req, res) => {
  try {
    console.log('🔄 Updating scenario:', req.params.id)
    console.log('🔄 Update data:', req.body)
    
    // Try to find by both custom id field and MongoDB _id
    let scenario = await PrankScenario.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    )
    
    // If not found by custom id, try MongoDB _id
    if (!scenario) {
      scenario = await PrankScenario.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      )
    }
    
    if (!scenario) {
      console.log('❌ Scenario not found with id:', req.params.id)
      return res.status(404).json({
        success: false,
        message: 'Scenario not found'
      })
    }
    
    console.log('✅ Scenario updated successfully:', scenario.id || scenario._id)
    
    res.json({
      success: true,
      message: 'Scenario updated',
      scenario
    })
    
  } catch (error) {
    console.error('❌ Admin update scenario error:', error.message)
    console.error('❌ Validation errors:', error.errors)
    res.status(400).json({
      success: false,
      message: 'Error updating scenario',
      error: error.message,
      validationErrors: error.errors
    })
  }
})

// Delete scenario
router.delete('/scenarios/:id', async (req, res) => {
  try {
    console.log('🗑️ Deleting scenario:', req.params.id)
    
    // Try to delete by both custom id field and MongoDB _id
    let scenario = await PrankScenario.findOneAndDelete({ id: req.params.id })
    
    // If not found by custom id, try MongoDB _id
    if (!scenario) {
      scenario = await PrankScenario.findByIdAndDelete(req.params.id)
    }
    
    if (!scenario) {
      console.log('❌ Scenario not found for deletion:', req.params.id)
      return res.status(404).json({
        success: false,
        message: 'Scenario not found'
      })
    }
    
    console.log('✅ Scenario deleted successfully:', scenario.id || scenario._id)
    
    res.json({
      success: true,
      message: 'Scenario deleted'
    })
    
  } catch (error) {
    console.error('❌ Admin delete scenario error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error deleting scenario'
    })
  }
})

// Get system stats
router.get('/stats', async (req, res) => {
  try {
    const [userStats, callStats, scenarioStats] = await Promise.all([
      User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            totalCredits: { $sum: '$credits' },
            avgCredits: { $avg: '$credits' }
          }
        }
      ]),
      Call.aggregate([
        {
          $group: {
            _id: null,
            totalCalls: { $sum: 1 },
            successfulCalls: { $sum: { $cond: [{ $eq: ['$status', 'ended'] }, 1, 0] } },
            refundedCalls: { $sum: { $cond: [{ $gt: ['$creditsRefunded', 0] }, 1, 0] } },
            totalDuration: { $sum: '$duration' }
          }
        }
      ]),
      Call.getScenarioStats()
    ])
    
    res.json({
      success: true,
      stats: {
        users: userStats[0] || { totalUsers: 0, totalCredits: 0, avgCredits: 0 },
        calls: callStats[0] || { totalCalls: 0, successfulCalls: 0, refundedCalls: 0, totalDuration: 0 },
        scenarios: scenarioStats
      }
    })
    
  } catch (error) {
    console.error('Admin stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching stats'
    })
  }
})

export default router

// BACKFILL: recordings from vapiData.recordingUrl -> recording block
router.post('/backfill/recordings', async (req, res) => {
  try {
    const { dryRun = false, limit = 1000 } = req.body || {}

    const query = {
      'vapiData.recordingUrl': { $exists: true, $ne: null, $ne: '' },
      $or: [
        { 'recording.isAvailable': { $ne: true } },
        { 'recording.url': { $in: [null, '', undefined] } }
      ]
    }

    const calls = await Call.find(query).sort({ createdAt: -1 }).limit(parseInt(limit))
    let updated = 0

    if (!dryRun) {
      for (const call of calls) {
        const url = call.vapiData?.recordingUrl
        if (!url) continue
        const format = (() => {
          try {
            const clean = (url.split('?')[0] || '')
            const ext = clean.split('.').pop()
            return (ext && ext.length <= 5) ? ext : 'mp3'
          } catch { return 'mp3' }
        })()

        call.recording = {
          ...(call.recording || {}),
          isAvailable: true,
          url,
          duration: call.duration || call.recording?.duration,
          format,
          downloadCount: call.recording?.downloadCount || 0,
          lastDownloaded: call.recording?.lastDownloaded || null,
          shareCount: call.recording?.shareCount || 0,
          shareUrls: call.recording?.shareUrls || [],
          isPublic: call.recording?.isPublic ?? false,
          allowSharing: call.recording?.allowSharing ?? true
        }

        await call.save()
        updated += 1
      }
    }

    res.json({
      success: true,
      matched: calls.length,
      updated,
      dryRun: Boolean(dryRun),
      sample: calls.slice(0, 3).map(c => ({ id: c._id, vapiCallId: c.vapiCallId, url: c.vapiData?.recordingUrl }))
    })
  } catch (error) {
    console.error('Admin backfill recordings error:', error)
    res.status(500).json({ success: false, message: 'Backfill mislukt', error: error.message })
  }
})

// BACKFILL: ensure all scenarios have an `image` field
router.post('/backfill/scenario-images', async (req, res) => {
  try {
    const { dryRun = false, defaultImage = '' } = req.body || {}

    const filter = { $or: [
      { image: { $exists: false } },
      { image: null }
    ]}

    const missingCount = await PrankScenario.countDocuments(filter)

    let updated = 0
    if (!dryRun && missingCount > 0) {
      const result = await PrankScenario.updateMany(filter, { $set: { image: defaultImage } })
      updated = result.modifiedCount || result.nModified || 0
    }

    const sample = await PrankScenario.find({}).sort({ createdAt: -1 }).limit(3).select('id name image')

    res.json({
      success: true,
      matched: missingCount,
      updated,
      dryRun: Boolean(dryRun),
      defaultImage,
      sample
    })
  } catch (error) {
    console.error('Admin backfill scenario-images error:', error)
    res.status(500).json({ success: false, message: 'Backfill mislukt', error: error.message })
  }
})
