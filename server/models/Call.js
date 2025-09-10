import mongoose from 'mongoose'

const callSchema = new mongoose.Schema({
  // User info
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },

  // Call details
  vapiCallId: {
    type: String,
    required: true,
    unique: true
  },
  targetPhone: {
    type: String,
    required: true,
    trim: true
  },
  formattedPhone: {
    type: String // Nederlandse formattering (+31...)
  },

  // Scenario info
  scenarioId: {
    type: String,
    required: true
  },
  scenarioName: {
    type: String,
    required: true
  },
  scenarioIcon: {
    type: String,
    default: '🎭'
  },
  vapiAgentId: {
    type: String,
    required: true
  },

  // Call status en timing
  status: {
    type: String,
    enum: [
      'queued',        // VAPI: in queue
      'ringing',       // VAPI: ringing
      'in-progress',   // VAPI: ongoing
      'forwarding',    // VAPI: forwarding
      'ended',         // VAPI: ended normally  
      'failed',        // VAPI: failed
      'cancelled',     // User cancelled
      'timeout'        // Timeout
    ],
    default: 'queued'
  },
  
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date
  },
  duration: {
    type: Number, // Duration in seconds
    default: 0
  },

  // VAPI response data
  vapiData: {
    cost: { type: Number }, // Cost in dollars
    transcript: { type: String },
    recordingUrl: { type: String },
    summary: { type: String },
    endReason: { type: String }, // hang-up, timeout, error, etc.
    
    // Call quality detection
    wasAnswered: { type: Boolean }, // Was call answered by human
    hitVoicemail: { type: Boolean, default: false }, // Detected voicemail
    callQuality: { 
      type: String, 
      enum: ['excellent', 'good', 'poor', 'voicemail', 'no_answer', 'failed'],
      default: 'good'
    },
    humanInteraction: { type: Boolean, default: false }, // AI detected human interaction
    conversationFlow: { type: Number, min: 0, max: 100 }, // Quality score 0-100
  },

  // Audio Recording System 🎧
  recording: {
    isAvailable: { type: Boolean, default: false },
    url: { type: String }, // VAPI recording URL
    duration: { type: Number }, // Audio duration in seconds
    fileSize: { type: Number }, // File size in bytes
    format: { type: String, default: 'mp3' },
    shareId: { type: String },
    downloadCount: { type: Number, default: 0 },
    lastDownloaded: { type: Date },
    
    // Viral sharing stats
    shareCount: { type: Number, default: 0 },
    shareUrls: [{
      platform: { type: String, enum: ['whatsapp', 'telegram', 'twitter', 'facebook', 'link'] },
      sharedAt: { type: Date, default: Date.now },
      clicks: { type: Number, default: 0 }
    }],
    
    // Privacy settings
    isPublic: { type: Boolean, default: false },
    allowSharing: { type: Boolean, default: true }
  },

  // User feedback
  userRating: {
    type: Number,
    min: 1,
    max: 5
  },
  userNotes: {
    type: String,
    maxlength: 500
  },
  wasSuccessful: {
    type: Boolean
  },
  wasShared: {
    type: Boolean,
    default: false
  },

  // Billing & Refunds
  creditsUsed: {
    type: Number,
    default: 1
  },
  creditsRefunded: {
    type: Number,
    default: 0
  },
  wasFree: {
    type: Boolean,
    default: false
  },
  refundReason: {
    type: String,
    enum: ['none', 'voicemail', 'too_short', 'failed', 'no_answer', 'poor_quality'],
    default: 'none'
  },
  refundedAt: {
    type: Date
  },
  shouldRefund: {
    type: Boolean,
    default: false
  },

  // Error handling
  error: {
    message: String,
    code: String,
    timestamp: Date
  },

  // Metadata
  userAgent: String,
  ipAddress: String,
  country: { type: String, default: 'NL' }

}, {
  timestamps: true,
  collection: 'calls'
})

// Indexes voor performance
callSchema.index({ userId: 1, createdAt: -1 })
callSchema.index({ vapiCallId: 1 })
callSchema.index({ status: 1 })
callSchema.index({ scenarioId: 1 })
callSchema.index({ startedAt: -1 })
callSchema.index({ userEmail: 1, createdAt: -1 })
callSchema.index({ 'recording.shareId': 1 })

// Virtual voor call duur formatting
callSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return '0:00'
  
  const minutes = Math.floor(this.duration / 60)
  const seconds = this.duration % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

// Instance method om call te markeren als voltooid
callSchema.methods.markCompleted = async function(vapiResponse) {
  this.status = 'ended'
  this.endedAt = new Date()
  
  if (vapiResponse) {
    // Calculate duration from VAPI startedAt and endedAt timestamps
    let calculatedDuration = 0
    
    console.log(`📞 Processing VAPI response for call ${this.id}:`)
    console.log(`- VAPI duration: ${vapiResponse.duration}`)
    console.log(`- VAPI startedAt: ${vapiResponse.startedAt}`)
    console.log(`- VAPI endedAt: ${vapiResponse.endedAt}`)
    
    if (vapiResponse.startedAt && vapiResponse.endedAt) {
      const startTime = new Date(vapiResponse.startedAt)
      const endTime = new Date(vapiResponse.endedAt)
      calculatedDuration = Math.round((endTime - startTime) / 1000) // Duration in seconds
      console.log(`- Calculated duration: ${calculatedDuration} seconds`)
    }
    
    // Use VAPI duration first, then calculated duration, with minimum of calculated duration
    const finalDuration = vapiResponse.duration || calculatedDuration
    this.duration = Math.max(finalDuration, calculatedDuration)
    console.log(`- Final duration set to: ${this.duration} seconds (VAPI: ${vapiResponse.duration}, calculated: ${calculatedDuration})`)
    
    this.vapiData = {
      cost: vapiResponse.cost,
      transcript: vapiResponse.transcript,
      recordingUrl: vapiResponse.recordingUrl,
      summary: vapiResponse.summary,
      endReason: vapiResponse.endReason || vapiResponse.endedReason || 'unknown',
      wasAnswered: vapiResponse.wasAnswered ?? (vapiResponse.status === 'ended' && calculatedDuration > 0),
      hitVoicemail: Boolean(vapiResponse.hitVoicemail) || (vapiResponse.endReason === 'voicemail'),
      callQuality: vapiResponse.callQuality || (vapiResponse.analysis?.successEvaluation === 'true' ? 'good' : 'poor'),
      humanInteraction: vapiResponse.humanInteraction ?? (vapiResponse.analysis?.successEvaluation === 'true'),
      conversationFlow: vapiResponse.conversationFlow ?? (vapiResponse.analysis?.successEvaluation === 'true' ? 80 : 20)
    }

    // Populate recording block for easy playback in UI
    if (vapiResponse.recordingUrl) {
      this.recording = {
        ...(this.recording || {}),
        isAvailable: true,
        url: vapiResponse.recordingUrl,
        duration: this.duration || finalDuration || calculatedDuration || 0,
        format: (vapiResponse.recordingUrl.split('?')[0] || '').split('.').pop() || 'mp3'
      }
    }
    
    // Mark success heuristically
    this.wasSuccessful = (this.status === 'ended') && (this.duration >= 10) && !this.vapiData?.hitVoicemail
    
    // Automatic quality analysis and refund check
    await this.analyzeCallQuality()
  }
  
  // Update user stats on completion
  try {
    const User = mongoose.model('User')
    const user = await User.findById(this.userId)
    if (user) {
      // Ensure totalCalls counted at creation time elsewhere; here only success/minutes
      if (this.wasSuccessful) {
        user.stats.successfulCalls = (user.stats.successfulCalls || 0) + 1
      }
      // Store seconds in totalMinutes for consistency with Call aggregation (sums duration seconds)
      user.stats.totalMinutes = (user.stats.totalMinutes || 0) + (this.duration || 0)
      await user.save()
    }
  } catch (e) {
    console.warn('Could not update user stats on call completion:', e?.message)
  }

  return await this.save()
}

// Automatic call quality analysis and refund system
callSchema.methods.analyzeCallQuality = async function() {
  const User = mongoose.model('User')
  let shouldRefund = false
  let refundReason = 'none'
  
  console.log(`🔍 Analyzing call quality for call ${this.id}`)
  console.log(`Duration: ${this.duration}s, End reason: ${this.vapiData?.endReason}`)
  
  // Rule 1: Calls shorter than 7 seconds get refunded
  if (this.duration < 7) {
    shouldRefund = true
    refundReason = 'too_short'
    console.log('❌ Call too short - refunding')
  }
  
  // Rule 2: Voicemail detection
  if (this.vapiData?.hitVoicemail || 
      this.vapiData?.callQuality === 'voicemail' ||
      (this.vapiData?.transcript && this.detectVoicemail(this.vapiData.transcript))) {
    shouldRefund = true
    refundReason = 'voicemail'
    console.log('📱 Voicemail detected - refunding')
  }
  
  // Rule 3: No human interaction detected
  if (this.vapiData?.humanInteraction === false && this.duration < 30) {
    shouldRefund = true
    refundReason = 'no_answer'
    console.log('🤖 No human interaction - refunding')
  }
  
  // Rule 4: Call failed or poor quality
  if (this.vapiData?.callQuality === 'failed' || 
      this.vapiData?.endReason === 'error' ||
      this.status === 'failed') {
    shouldRefund = true
    refundReason = 'failed'
    console.log('💥 Call failed - refunding')
  }
  
  // Rule 5: Very poor conversation flow
  if (this.vapiData?.conversationFlow !== undefined && 
      this.vapiData.conversationFlow < 20) {
    shouldRefund = true
    refundReason = 'poor_quality'
    console.log('📉 Poor conversation flow - refunding')
  }
  
  // Apply refund if needed
  if (shouldRefund && !this.wasFree && this.creditsRefunded === 0) {
    console.log(`💰 Processing refund for call ${this.id} - reason: ${refundReason}`)
    
    this.shouldRefund = true
    this.refundReason = refundReason
    this.creditsRefunded = this.creditsUsed
    this.refundedAt = new Date()
    
    // Give credits back to user
    const user = await User.findById(this.userId)
    if (user) {
      await user.addCredits(this.creditsUsed)
      console.log(`✅ Refunded ${this.creditsUsed} credits to user ${user.email}`)
      
      // Update user stats - don't count failed calls
      if (user.stats.totalCalls > 0) {
        user.stats.totalCalls -= 1
      }
      await user.save()
    }
  }
  
  return shouldRefund
}

// Voicemail detection helper
callSchema.methods.detectVoicemail = function(transcript) {
  if (!transcript) return false
  
  const voicemailKeywords = [
    'voicemail', 'boodschap', 'achterlaten', 'spreken na de piep',
    'niet bereikbaar', 'momenteel niet beschikbaar', 'inbox',
    'beep', 'piep', 'na het signaal', 'later terugbellen'
  ]
  
  const transcriptLower = transcript.toLowerCase()
  
  return voicemailKeywords.some(keyword => 
    transcriptLower.includes(keyword)
  )
}

// Instance method om call te markeren als mislukt
callSchema.methods.markFailed = async function(error) {
  this.status = 'failed'
  this.endedAt = new Date()
  
  if (error) {
    this.error = {
      message: error.message,
      code: error.code,
      timestamp: new Date()
    }
  }
  
  return await this.save()
}

// Static method om calls te krijgen voor user
callSchema.statics.getCallsForUser = function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name email')
}

// Static method voor call statistieken
callSchema.statics.getStatsForUser = async function(userId) {
  let matchUserId = userId
  try {
    if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
      matchUserId = new mongoose.Types.ObjectId(userId)
    }
  } catch (_) {}

  const stats = await this.aggregate([
    { $match: { userId: matchUserId } },
    {
      $group: {
        _id: null,
        totalCalls: { $sum: 1 },
        successfulCalls: { $sum: { $cond: [{ $eq: ['$status', 'ended'] }, 1, 0] } },
        totalMinutes: { $sum: { $ifNull: ['$duration', 0] } },
        totalCost: { $sum: { $ifNull: ['$vapiData.cost', 0] } },
        avgDuration: { $avg: { $ifNull: ['$duration', 0] } }
      }
    }
  ])
  
  return stats[0] || {
    totalCalls: 0,
    successfulCalls: 0,
    totalMinutes: 0,
    totalCost: 0,
    avgDuration: 0
  }
}

// Static method voor scenario populatie
callSchema.statics.getScenarioStats = async function() {
  return await this.aggregate([
    { $match: { status: 'ended' } },
    {
      $group: {
        _id: '$scenarioId',
        name: { $first: '$scenarioName' },
        count: { $sum: 1 },
        avgDuration: { $avg: '$duration' },
        avgRating: { $avg: '$userRating' }
      }
    },
    { $sort: { count: -1 } }
  ])
}

const Call = mongoose.model('Call', callSchema)

export default Call
